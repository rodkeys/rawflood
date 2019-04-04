'use strict';

var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    rootPath = path.normalize(__dirname + '/../../frontend');


/**
 * Express configuration
 */

exports.init = function(app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.set('views', rootPath);
    app.use(express.static(path.join(rootPath, ''))); // Where the server serves files
    app.set('view engine', 'html');

    // Log all requests to the console
    app.use(morgan('dev'));


};