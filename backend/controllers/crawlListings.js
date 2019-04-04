const fs = require("fs"),
    request = require("request"),
    config = require('../config/config'),
    imageCtrl = require("./images"),
    cluster = require("cluster"),
    mulithashes = require("multihashes"),
    models = require("./modelController");

let scraperWorker;

// Create a separate worker thread to scan the network
if (cluster.isMaster) {
    scraperWorker = cluster.fork();
    scraperWorker.send({
        messageType: "beginScraping",
    });
};


// Initialize network crawl on startup and repeat
const crawlOpenBazaarDocs = async () => {
    setTimeout(() => {
        initializeFindPeers().then(() => {
            crawlOpenBazaarDocs();
        }).catch((err) => {
            console.log(err);
            crawlOpenBazaarDocs();
        });
    }, 1000);
};

const initializeFindPeers = (() => {
    return new Promise(async (resolve, reject) => {
        // Find all peers
        request("http://localhost:4002/ob/peers", async (err, res, body) => {
            if (err) {
                console.log(err);
                reject();
            } else if (body) {
                let peerList = JSON.parse(body);
                console.log("Full Loop completed. There were " + peerList.length + " peers found.")
                // Refresh exported listing/vendors
                for (let i = 0; i < peerList.length; i++) {
                    console.log("STARTED: " + i)
                    try {
                        await scrapeIndividualPeer(peerList[i]);
                    } catch (err) {
                        console.log(err)
                        continue;
                    }
                }
                resolve();
            }
        });
    });
});

exports.scrapePassedInPeer = (req, res) => {

    try {
        let peerID = mulithashes.fromB58String(req.params.peerID);
        scraperWorker.send({
            messageType: "scrapePassedInPeer",
            peerID: req.params.peerID
        });
        res.status(200).send({ message: "Added to scrape queue" });
    } catch (err) {
        res.status(500).send({ message: "This is an invalid store PeerID" });
    }
};

const scrapeIndividualPeer = (peerID) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Grab profile.json information and return avatar + header hashes
            const profileHashes = await scrapeVendorInformationProfile(peerID);
            // Grab listings.json and then all individual listings and return image hashes
            const listingHashes = await scrapeListingInformation(peerID);
            // Scrape all listing ratings for a user
            await scrapeRatingsInformation(peerID);
            await imageCtrl.scrapeImages(profileHashes.concat(listingHashes));
            resolve();
        } catch (err) {
            reject(err);
        }
    })
};


// Scrape Vendor information and upsert (update if doc exists or create if none already exists)
const scrapeVendorInformationProfile = (peerID) => {
    return new Promise((resolve, reject) => {
        request(`http://localhost:4002/ob/profile/${peerID}?usecache=false`, { timeout: 60000 }, async (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                const profileResp = JSON.parse(body);
                if (profileResp && (profileResp.success != false) && (profileResp.vendor == true)) {
                    try {
                        models.vendor.upsert({
                                peerId: profileResp.peerID,
                                peerID: profileResp.peerID,
                                hash: "",
                                name: profileResp.name,
                                location: profileResp.location,
                                about: profileResp.about,
                                shortDescription: profileResp.shortDescription,
                                nsfw: profileResp.nsfw,
                                vendor: profileResp.vendor,
                                contactInfo: profileResp.contactInfo,
                                colors: profileResp.colors,
                                avatarHashes: profileResp.avatarHashes,
                                headerHashes: profileResp.headerHashes,
                                stats: profileResp.stats,
                                bitcoinPubKey: profileResp.bitcoinPubKey,
                                currencies: profileResp.currencies
                            }, { where: { peerId: profileResp.peerID } })
                            .then(created => {
                                resolve([profileResp.avatarHashes, profileResp.headerHashes]);
                            }).catch(error => {
                                reject(error);
                            });
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    reject();
                }
            }
        });
    });
};

// Scrape listing information and then grab individual listings
const scrapeListingInformation = (peerID) => {
    return new Promise((resolve, reject) => {
        request(`http://localhost:4002/ob/listings/${peerID}?usecache=false`, { timeout: 60000 }, async (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                const listingsResp = JSON.parse(body);
                // Gather list of all images
                let imageList = [];
                if (listingsResp && (listingsResp.success != false)) {
                    for (let i = 0; i < listingsResp.length; i++) {
                        try {
                            const listingImage = await scrapeIndividualListing(listingsResp[i].hash, peerID);
                            imageList.push(listingImage);
                        } catch (err) {
                            console.log(err);
                            continue;
                        }
                    }
                    resolve(imageList);
                } else {
                    reject();
                }

            }
        });
    });
};

const scrapeIndividualListing = (ipfsHash, peerID) => {
    return new Promise((resolve, reject) => {
        request(`http://localhost:4002/ob/listing/ipfs/${ipfsHash}?usecache=false`, { timeout: 60000 }, async (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const singleListingResp = JSON.parse(body);
                    if (singleListingResp && (singleListingResp.success != false)) {
                        // Generate unique ID for a slug + peerID
                        const slugPeerId = peerID + "-" + singleListingResp.listing.slug;


                        let ratings = await models.rating.findAll({ where: { listingSlugPeerId: slugPeerId } }),
                            averageRating = 0;

                        if (ratings.length > 0) {
                            for (let i = 0; i < ratings.length; i++) {
                                averageRating = averageRating + ratings[i].overallScore
                            }
                            averageRating = averageRating / ratings.length;
                        }

                        let singleListing = {
                            slugPeerId: slugPeerId,
                            hash: ipfsHash,
                            handle: singleListingResp.listing.vendorID.handle,
                            identityPubKey: singleListingResp.listing.vendorID.pubkeys.identity,
                            identityBitcoinPubKey: singleListingResp.listing.vendorID.pubkeys.bitcoin,
                            identityBitcoinSig: singleListingResp.listing.vendorID.bitcoinSig,
                            slug: singleListingResp.listing.slug,
                            version: singleListingResp.listing.metadata.version,
                            contractType: singleListingResp.listing.metadata.contractType,
                            format: singleListingResp.listing.metadata.format,
                            expiry: singleListingResp.listing.metadata.expiry,
                            acceptedCurrencies: singleListingResp.listing.metadata.acceptedCurrencies,
                            pricingCurrency: singleListingResp.listing.metadata.pricingCurrency,
                            language: singleListingResp.listing.metadata.language,
                            escrowTimeoutHours: singleListingResp.listing.metadata.escrowTimeoutHours,
                            coinType: singleListingResp.listing.metadata.coinType,
                            coinDivisibility: singleListingResp.listing.metadata.coinDivisibility,
                            priceModifier: singleListingResp.listing.metadata.priceModifier,
                            title: singleListingResp.listing.item.title,
                            description: singleListingResp.listing.item.description,
                            price: {
                                currencyCode: singleListingResp.listing.metadata.pricingCurrency,
                                amount: singleListingResp.listing.item.price,
                                modifier: singleListingResp.listing.metadata.priceModifier
                            },
                            vendorCurrencies: singleListingResp.listing.metadata.acceptedCurrencies,
                            nsfw: singleListingResp.listing.item.nsfw,
                            tags: singleListingResp.listing.item.tags,
                            thumbnail: singleListingResp.listing.item.images[0],
                            images: singleListingResp.listing.item.images,
                            categories: singleListingResp.listing.item.categories,
                            grams: singleListingResp.listing.item.grams,
                            condition: singleListingResp.listing.item.condition,
                            options: singleListingResp.listing.item.options,
                            skus: singleListingResp.listing.item.skus,
                            shippingOptions: singleListingResp.listing.shippingOptions,
                            coupons: singleListingResp.listing.coupons,
                            moderators: singleListingResp.listing.moderators,
                            termsAndConditions: singleListingResp.listing.termsAndConditions,
                            refundPolicy: singleListingResp.listing.refundPolicy,
                            vendorPeerId: singleListingResp.listing.vendorID.peerID,
                            ratingCount: ratings.length,
                            averageRating: averageRating,
                            signature: singleListingResp.signature
                        };

                        // Next step is to insert the obj in to the database 
                        models.listing.upsert(singleListing, {
                            where: { vendorPeerId: peerID, slug: singleListingResp.listing.slug },
                        }).then(created => {
                            resolve(singleListingResp.listing.item.images[0])
                        }).catch((err) => {
                            reject(err);
                        })

                    } else {
                        reject();
                    }
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
};

// Scrape all ratings within a peer's rating folder
const scrapeRatingsInformation = ((peerID) => {
    return new Promise((resolve, reject) => {
        request(`http://localhost:4002/ob/ratings/${peerID}?usecache=false`, { timeout: 60000 }, async (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                const allRatingsResp = JSON.parse(body);
                if (allRatingsResp && (allRatingsResp.success != false)) {
                    for (let i = 0; i < allRatingsResp.ratings.length; i++) {
                        try {
                            await scrapeSingleRating(allRatingsResp.ratings[i], peerID);
                        } catch (err) {
                            console.log(err);
                            continue;
                        }
                    }
                    resolve();
                } else {
                    reject();
                }
            }
        });
    });
});

const scrapeSingleRating = ((ipfsHash, peerID) => {
    return new Promise((resolve, reject) => {
        request(`http://localhost:4002/ob/rating/${ipfsHash}?usecache=false`, { timeout: 60000 }, async (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                const singleRatingResp = JSON.parse(body);
                if (singleRatingResp && (singleRatingResp.success != false)) {
                    try {
                        const slugPeerId = peerID + "-" + singleRatingResp.ratingData.vendorSig.metadata.listingSlug;
                        let rating = {
                            ratingKey: singleRatingResp.ratingData.ratingKey,
                            buyerSig: singleRatingResp.ratingData.buyerSig,
                            customerServiceScore: singleRatingResp.ratingData.customerService,
                            deliverySpeedScore: singleRatingResp.ratingData.deliverySpeed,
                            descriptionScore: singleRatingResp.ratingData.description,
                            overallScore: singleRatingResp.ratingData.overall,
                            ratingKey: singleRatingResp.ratingData.ratingKey,
                            review: singleRatingResp.ratingData.review,
                            timestamp: singleRatingResp.ratingData.timestamp,
                            vendorBitcoinSig: singleRatingResp.ratingData.vendorID.bitcoinSig,
                            vendorPeerID: singleRatingResp.ratingData.vendorID.peerID,
                            vendorBitcoinPubKey: singleRatingResp.ratingData.vendorID.pubkeys.bitcoin,
                            vendorIdentityKey: singleRatingResp.ratingData.vendorID.pubkeys.identity,
                            vendorSigMetadata: singleRatingResp.ratingData.vendorSig.metadata,
                            vendorSignature: singleRatingResp.ratingData.vendorSig.signature,
                            signature: singleRatingResp.signature,
                            listingSlugPeerId: slugPeerId
                        };

                        if (singleRatingResp.ratingData.buyerID) {
                            rating.buyerBitcoinSig = singleRatingResp.ratingData.buyerID.bitcoinSig;
                            rating.buyerPeerID = singleRatingResp.ratingData.buyerID.peerID
                            rating.buyerBitcoinPubKey = singleRatingResp.ratingData.buyerID.pubkeys.bitcoin;
                            rating.buyerIdentityPubKey = singleRatingResp.ratingData.buyerID.pubkeys.identity;
                        }


                        models.rating.upsert(rating, { where: { ratingKey: singleRatingResp.ratingData.ratingKey } })
                            .then(created => {
                                resolve();
                            }).catch(error => {
                                // Ignore this error because it's almost exclusively an issue with slugPeerId not existing anymore
                                reject();
                            });
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    reject();
                }
            }
        });
    });
});

process.on('message', (data) => {
    if (data.messageType == "beginScraping") {
        crawlOpenBazaarDocs();
    } else if (data.messageType == "scrapePassedInPeer") {
        scrapeIndividualPeer(data.peerID).then(() => {}).catch((err) => {
            console.log(err);
        });
    }
});