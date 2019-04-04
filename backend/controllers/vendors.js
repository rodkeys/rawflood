const fs = require("fs"),
    sequelize = require("sequelize"),
    op = sequelize.Op,
    miscController = require("./misc"),
    models = require("./modelController");

// Return a single OB Vendor
exports.returnSingleVendor = (req, res) => {
    models.vendor.findOne({
        where: {
            [op.and]: [
                { peerId: req.params.peerId },
                {
                    peerId: {
                        [op.notIn]: miscController.returnBlacklist()
                    },
                }
            ]

        },
        include: [{ model: models.listing, include: { model: models.rating } }]
    }).then((vendorOne) => {
        vendorOne = vendorOne.dataValues;

        let listings = vendorOne.listings;
        for (let i = 0; i < listings.length; i++) {
            listings[i] = listings[i].dataValues;

            // If listing is older than 7 days then remove the listing from the list
            if ((Date.now() - 604800000) > new Date(listings[i].createdAt).getTime()) {
                listings.splice(i, 1);
                i--;
            } else if (listings[i].ratings && listings[i].ratings.length > 0) {
                listings[i].averageRatingScore = 0;
                for (let y = 0; y < listings[i].ratings.length; y++) {
                    listings[i].averageRatingScore = listings[i].averageRatingScore + listings[i].ratings[y].overallScore;
                }
                listings[i].averageRatingScore = listings[i].averageRatingScore / listings[i].ratings.length;
            }
        }
        vendorOne.listings = listings;

        res.status(200).send(vendorOne);
    }).catch((err) => {
        res.status(400).send(err);
    })
}