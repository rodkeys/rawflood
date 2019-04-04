// Description: Model for Single Open Bazaar Vendor

module.exports = (sequelize, DataTypes) => {
    const vendor = sequelize.define('vendor', {
        peerId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            unique: true
        },
        peerID: {
            type: DataTypes.STRING,
            allowNull: true
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        location: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        about: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        shortDescription: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        nsfw: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        vendor: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        contactInfo: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        colors: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        avatarHashes: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        headerHashes: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        stats: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        bitcoinPubkey: {
            type: DataTypes.STRING,
            allowNull: true
        },
        currencies: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true
        },
        vendorCurrencies: {
            type: DataTypes.ARRAY(DataTypes.STRING),
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
    vendor.associate = (models) => {
        vendor.hasMany(models.listing);
    }


    // export vendor model for use in other files.
    return vendor;
};