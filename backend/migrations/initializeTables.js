'use strict';
const fs = require('fs'),
    path = require('path'),
    Sequelize = require('sequelize'),
    basename = path.basename(module.filename),
    env = process.env.NODE_ENV || 'development',
    config = require(__dirname + "/../config/config"),
    db = {};

const sequelize = new Sequelize(config.postgres.url, {
    // disable logging; default: console.log
    logging: false
})


module.exports = {
    up: (queryInterface, Sequelize) => {
        return new Promise(async (resolve, reject) => {
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
                    resolve();
                })
                .catch(error => {
                    reject(error)
                });

            db.sequelize = sequelize;
        })
    },

    down: (queryInterface, Sequelize) => {
        return new Promise(async (resolve, reject) => {
            resolve();
        })

    }
};