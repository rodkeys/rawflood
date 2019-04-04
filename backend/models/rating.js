// Description: Model for Single Open Bazaar Vendor

module.exports = (sequelize, DataTypes) => {
    const rating = sequelize.define('rating', {
        ratingKey: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            unique: true
        },
        buyerBitcoinSig: {
            type: DataTypes.STRING,
            allowNull: true
        },
        buyerPeerID: {
            type: DataTypes.STRING,
            allowNull: true
        },
        buyerBitcoinPubKey: {
            type: DataTypes.STRING,
            allowNull: true
        },
        buyerIdentityPubKey: {
            type: DataTypes.STRING,
            allowNull: true
        },
        buyerSig: {
            type: DataTypes.STRING,
            allowNull: true
        },
        customerServiceScore: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        deliverySpeedScore: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        descriptionScore: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        overallScore: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        review: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        timestamp: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        vendorBitcoinSig: {
            type: DataTypes.STRING,
            allowNull: true
        },
        vendorPeerID: {
            type: DataTypes.STRING,
            allowNull: true
        },
        vendorBitcoinPubKey: {
            type: DataTypes.STRING,
            allowNull: true
        },
        vendorIdentityKey: {
            type: DataTypes.STRING,
            allowNull: true
        },
        vendorSigMetadata: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        signature: {
            type: DataTypes.STRING,
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

    // Setup model association
    rating.associate = (models) => {
        // Cascade to delete reveiws if listing is removed
        rating.belongsTo(models.listing, {
            onDelete: "CASCADE",
            allowNull: false
        });
    }

    // Upsert rating while returning the doc
    rating.upsertWithReturn = (options, callback) => {
        rating.findOrCreate(options).spread((ratingOne, created) => {
            if (created) {
                callback(null, ratingOne)
            } else {
                ratingOne.updateAttributes(options.defaults).then((ratingOne) => {
                    callback(null, ratingOne);
                }).catch(err => {
                    callback(err, null);
                });
            }
        }).catch(err => {
            callback(err, null)
        })

    }

    // export rating model for use in other files.
    return rating;
};