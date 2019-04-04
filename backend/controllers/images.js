const fs = require("fs"),
    request = require("request"),
    platformFolders = require('platform-folders');


// Scrape a list of image hashes and store them locally
exports.scrapeImages = ((imageList) => {
    return new Promise(async (resolve, reject) => {
        for (let i = 0; i < imageList.length; i++) {
            try {
                if (imageList[i] && imageList[i].medium && verifyUniqueImage(imageList[i].medium)) {
                    await saveSingleImage(imageList[i].medium)
                }
            } catch (err) {
                console.log(err);
                continue;
            }
        }
        resolve();
    });
})


const saveSingleImage = (imageHash) => {
    return new Promise((resolve, reject) => {
        const imageFilePath = `${platformFolders.getHomeFolder()}/.rawFlood/images/${imageHash}`;
        request(`http://localhost:4002/ipfs/${imageHash}?usecache=false`, { timeout: 60000, encoding: null }, async (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                fs.writeFileSync(imageFilePath, body)
                resolve();
            }
        })
    });
};


// Verify image hash isn't already saved locally
const verifyUniqueImage = (imageHash) => {
    const rootPath = `${platformFolders.getHomeFolder()}/.rawFlood`,
        imageFolderPath = `${rootPath}/images`,
        imageFilePath = `${rootPath}/images/${imageHash}`;
    // First check if base folders exist, if not, then create one
    if (!fs.existsSync(rootPath)) {
        fs.mkdirSync(rootPath);
    }
    if (!fs.existsSync(imageFolderPath)) {
        fs.mkdirSync(imageFolderPath);
    }

    // Then check if image already exists
    if (fs.existsSync(imageFilePath)) {
        return false;
    } else {
        return true;
    }
};

// Return Base64 for a single image
exports.returnSingleImage = (req, res) => {
    const imageFilePath = `${platformFolders.getHomeFolder()}/.rawFlood/images/${req.params.imageHash}`;

    if (fs.existsSync(imageFilePath)) {
        res.download(imageFilePath, `${req.params.imageHash}.png`)
    } else {
        res.status(404).send({ message: "Image not found" })
    }
}