const fs = require("fs");

// Description: Model for Single Open Bazaar Listing

module.exports = (sequelize, DataTypes) => {
    const listing = sequelize.define('listing', {
        // Slug peerID stays because it does not change on updates
        slugPeerId: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        handle: {
            type: DataTypes.STRING,
            allowNull: false
        },
        identityPubKey: {
            type: DataTypes.STRING,
            allowNull: false
        },
        identityBitcoinPubKey: {
            type: DataTypes.STRING,
            allowNull: false
        },
        identityBitcoinSig: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        version: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        contractType: {
            type: DataTypes.STRING,
            allowNull: true
        },
        format: {
            type: DataTypes.STRING,
            allowNull: true
        },
        expiry: {
            type: DataTypes.STRING,
            allowNull: true
        },
        acceptedCurrencies: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true
        },
        pricingCurrency: {
            type: DataTypes.STRING,
            allowNull: true
        },
        language: {
            type: DataTypes.STRING,
            allowNull: true
        },
        escrowTimeoutHours: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        coinType: {
            type: DataTypes.STRING,
            allowNull: true
        },
        coinDivisibility: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        priceModifier: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        nsfw: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true
        },
        images: {
            type: DataTypes.ARRAY(DataTypes.JSONB),
            allowNull: true
        },
        thumbnail: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        categories: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true
        },
        grams: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        condition: {
            type: DataTypes.STRING,
            allowNull: true
        },
        options: {
            type: DataTypes.ARRAY(DataTypes.JSONB),
            allowNull: true
        },
        skus: {
            type: DataTypes.ARRAY(DataTypes.JSONB),
            allowNull: true
        },
        shippingOptions: {
            type: DataTypes.ARRAY(DataTypes.JSONB),
            allowNull: true
        },
        coupons: {
            type: DataTypes.ARRAY(DataTypes.JSONB),
            allowNull: true
        },
        moderators: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true
        },
        termsAndConditions: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        refundPolicy: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        signature: {
            type: DataTypes.STRING,
            allowNull: true
        },
        averageRating: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        ratingCount: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        raw: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        misc: {
            type: DataTypes.JSONB,
            allowNull: true
        }
    }, {});

    listing.associate = (models) => {
        // Cascade to delete listings if vendor is removed
        listing.belongsTo(models.vendor, {
            onDelete: "CASCADE",
            allowNull: false
        });
        listing.hasMany(models.rating);
    }

    // Upsert listing while returning the doc
    listing.upsertWithReturn = (options, callback) => {
        listing.findOrCreate(options).spread((listingOne, created) => {
            if (created) {
                callback(null, listingOne)
            } else {
                listingOne.updateAttributes(options.defaults).then((listingOne) => {
                    callback(null, listingOne);
                }).catch(err => {
                    callback(err, null);
                });
            }
        }).catch(err => {
            callback(err, null)
        })

    }


    // export Listing model for use in other files.
    return listing;
};