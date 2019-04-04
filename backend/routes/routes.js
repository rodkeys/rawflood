const path = require("path"),
    indexPage = path.normalize(__dirname + '/../../frontend/index.html'),
    searchController = require("../controllers/search"),
    imageController = require("../controllers/images"),
    listingController = require("../controllers/listings"),
    vendorController = require("../controllers/vendors"),
    miscController = require("../controllers/misc"),
    crawlListingsController = require("../controllers/crawlListings");

/**
 * Application routes
 */
module.exports = (app) => {

    // Set cross origin allowance
    app.all('/*', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    // app.get("/api/search/:searchTerm", searchController.returnSearchResults);
    app.get("/api/search", searchController.returnSearchResults);
    app.get("/api/returnSingleImage/:imageHash", imageController.returnSingleImage);
    app.get("/api/returnIndividualListing/:slugPeerId", listingController.returnSingleListing);
    app.get("/api/returnIndividualVendor/:peerId", vendorController.returnSingleVendor);

    app.post("/api/reports", miscController.acceptReport);

    app.put('/api/scrapePassedInPeer/:peerID', crawlListingsController.scrapePassedInPeer);

    app.get('/*', function(req, res) {
        res.sendFile(indexPage);
    });
}