const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + "/../config/config");
const db = {};

const sequelize = new Sequelize(config.postgres.url, {
    // disable logging; default: console.log
    logging: false
})

fs
    .readdirSync(__dirname + "/../models")
    .filter(file =>
        (file.indexOf('.') !== 0) &&
        (file !== basename) &&
        (file.slice(-3) === '.js'))
    .forEach(file => {
        // console.log(path.join(__dirname + "/../models", file))
        const model = sequelize.import(path.join(__dirname + "/../models", file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// create all the defined tables in the specified database.
sequelize.sync()
    .then(() => {
        //console.log('sequelize synced')
    })
    .catch(error => {
        //console.log('Sequelize Error: ', error)
    });

db.sequelize = sequelize;


module.exports = db;