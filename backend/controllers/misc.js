const fs = require("fs"),
config = require("../config/config");

// Return the blacklist array
exports.returnBlacklist = () => {
    const blacklist = JSON.parse(fs.readFileSync(__dirname + "/../misc/blacklist.json"));
    return blacklist;
}

// Add report to listingReports.json 
exports.acceptReport = (req, res) => {
    if (req.body.peerID) {
        try {
            // const blacklist = 
            let listingReportLocation = __dirname + "/../misc/listingReports.json",
                listingReports = JSON.parse(fs.readFileSync(listingReportLocation)),
                stats = fs.statSync(listingReportLocation),
                fileSizeInBytes = stats["size"],
                //Convert the file size to megabytes (optional)
                fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
            // Ensure that the report file does not exceed 100MB
            if (fileSizeInMegabytes < 100) {
                listingReports.push(req.body);
                fs.writeFileSync(listingReportLocation, JSON.stringify(listingReports, null, 2));
                res.status(200).send({ message: "Success" })
            } else {
                res.status(500).send({ message: "Failure" })
            }
        } catch (err) {
            console.log(err);
            res.status(500).send({ message: "Failure" })
        }
    } else {
        res.status(500).send({ message: "Missing parameters" })
    }
}

exports.returnSearchEngineHeader = () => {
    return {
        "name": "RawFlood",
        "logo": `${config.domain}/assets/images/logo.png`,
        "listingsPerPage": 50,
        "options": {
            "acceptedCurrencies": {
                "type": "radio",
                "label": "Accepted Currency",
                "options": [{
                        "value": "BTC",
                        "label": "Bitcoin",
                        "checked": false,
                        "default": false
                    },
                    {
                        "value": "BCH",
                        "label": "Bitcoin Cash",
                        "checked": false,
                        "default": false
                    },
                    {
                        "value": "LTC",
                        "label": "Litecoin",
                        "checked": false,
                        "default": false
                    },
                    {
                        "value": "ZEC",
                        "label": "Zcash",
                        "checked": false,
                        "default": false
                    }
                ]
            }
        },
        "links": {
            "self": `${config.domain}/api/search?q=openbazaar`,
            "listings": `${config.domain}/api/search`,
            "reports": `${config.domain}/api/reports`
        },
        "results": {
            "total": null,
            "morePages": true,
            "results": []
        }
    }
}