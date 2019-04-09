const fs = require("fs"),
    _ = require("lodash"),
    sequelize = require("sequelize"),
    op = sequelize.Op,
    config = require("../config/config"),
    miscController = require("./misc"),
    models = require("./modelController");

// Return search terms
exports.returnSearchResults = async (req, res) => {
    // Set base page number
    if (!req.query.p) {
        req.query.p = 0;
    }

    let searchEngineHeader = miscController.returnSearchEngineHeader(),
        dbQuery = {
            limit: searchEngineHeader.listingsPerPage,
            offset: req.query.p * searchEngineHeader.listingsPerPage,
            include: [{
                model: models.vendor,
                where: {
                    peerId: {
                        [op.notIn]: miscController.returnBlacklist(),
                    }
                }
            }, { model: models.rating }],
            where: {
                updatedAt: {
                    // Check if listing was seen within the last 7 days
                    [op.gt]: Date.now() - 604800000,
                }
            },
        },
        formattedListings = [],
        totalResults = 0;

    // If acceptedCurrencies selected then find all that match in the array
    if (req.query.acceptedCurrencies) {
        if (typeof(req.query.acceptedCurrencies) == "string") {
            dbQuery.where.acceptedCurrencies = {
                [op.contains]: [req.query.acceptedCurrencies]
            }
        } else {
            dbQuery.where.acceptedCurrencies = {
                [op.contains]: req.query.acceptedCurrencies
            }
        }
    }
    // Set base query
    if (!req.query.q || req.query.q == "*") {
        dbQuery.order = [
            ['updatedAt', 'DESC'],
        ];
        let listingsAndCount = await models.listing.findAndCountAll(dbQuery);

        for (let i = 0; i < listingsAndCount.rows.length; i++) {
            formattedListings.push({
                type: "listing",
                data: listingsAndCount.rows[i],
                relationships: {
                    "vendor": {
                        "data": listingsAndCount.rows[i].vendor
                    },
                    "moderators": []
                }
            });
        }

        totalResults = listingsAndCount.count
    } else {
        try {
            const results = await models.sequelize.query(`
            SELECT * FROM ${models.listing.tableName}
            WHERE _search @@ plainto_tsquery('english', :query);
          `, {
                model: models.listing,
                replacements: { query: req.query.q },
            });

            dbQuery.where.slugPeerId = _.map(results, 'slugPeerId');


            let listings = await models.listing.findAll(dbQuery);

            for (let i = 0; i < listings.length; i++) {
                formattedListings.push({
                    type: "listing",
                    data: listings[i],
                    relationships: {
                        "vendor": {
                            "data": listings[i].vendor
                        },
                        "moderators": []
                    }
                });
            }

            totalResults = results.length;
        } catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
    }

    searchEngineHeader.links.self = config.domain + req.url;

    searchEngineHeader.results = {
        total: totalResults,
        morePages: true,
        results: formattedListings
    }

    res.status(200).send(searchEngineHeader);
}