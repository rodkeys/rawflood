const fs = require("fs"),
    sequelize = require("sequelize"),
    op = sequelize.Op,
    miscController = require("./misc"),
    models = require("./modelController");

// Return a single OB listing
exports.returnSingleListing = (req, res) => {
    models.listing.findOne({
        where: { slugPeerId: req.params.slugPeerId },
        include: [{
            model: models.vendor,
            where: {
                peerId: {
                    [op.notIn]: miscController.returnBlacklist(),
                }
            }
        }, { model: models.rating }]
    }).then((listingOne) => {
        listingOne = listingOne.dataValues;
        listingOne.averageRatingScore = 0;
        if ((Date.now() - 604800000) > new Date(listingOne.createdAt).getTime()) {
            listingOne.expiredListing = true;
        }

        for (let i = 0; i < listingOne.ratings.length; i++) {
            listingOne.averageRatingScore = listingOne.averageRatingScore + listingOne.ratings[i].overallScore;
        }
        listingOne.averageRatingScore = listingOne.averageRatingScore / listingOne.ratings.length;

        listingOne.ratings.reverse();

        res.status(200).send(listingOne);
    }).catch((err) => {
        res.status(400).send(err);
    })
}