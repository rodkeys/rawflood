const express = require('express'),
    config = require("./config/config"),
    fs = require("fs"),
    db = require("./controllers/modelController"),
    cluster = require("cluster");


const options = {
    key: fs.readFileSync('./sslcerts/myKey.key'),
    cert: fs.readFileSync('./sslcerts/myCert.crt')
};


if (cluster.isMaster) {
    // invoke an instance of express application.
    const app = express(),
        server = require('https').createServer(options, app)

    // Express settings
    const expressConfig = require('./config/express');
    expressConfig.init(app);

    // Routing
    require('./routes/routes')(app);


    // Start server
    server.listen(config.server.port, () => {
        console.log('Server Listening on', config.server.port);
       
    });

    // This is for redirecting http -> https for use in web server
    const http = require('http');
    http.createServer(function(req, res) {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
        res.end();
    }).listen(80);
} else {
    require("./controllers/crawlListings");
}