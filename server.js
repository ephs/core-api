//Node requires
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('http');
const app = express();
const rateLimit = require("express-rate-limit");
const fs = require('fs');

const config = require('./server/config/config');

//App port. Testing is 8080.
const port = process.env.PORT || '8443';

//Create logger
let logger = function(req, res, next){
    if(req.connection.remoteAddress === "::1") //Local host = ::1
        console.log("[LOGGER] Localhost --> (" + req.method + ") " + req.url);
    else
        console.log("[LOGGER] " + req.connection.remoteAddress + " --> (" + req.method + ") " + req.url);
    next();
};
//Use logger
app.all('*', logger);
console.log("[LOGGER] Running logger.");

//Rate limit (a little generous because all students will have the same IP).
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: config.maxRequests,
    message: "You sure did overwhelm the server. Please wait before sending more requests. THIS HAS BEEN LOGGED!",
    onLimitReached: function (req, res, options) {
        if(req.connection.remoteAddress === "::1")
            console.log("Too many requests from localhost. Slowing.");
        else
            console.log("Too many requests from " + req.connection.remoteAddress + ". Slowing.");
    }
});
app.use(limiter);
console.log("Running rate limiter. " + config.maxRequests + " per 5 minutes.");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // support json encoded bodies

//Remove/add headers
app.disable('x-powered-by');
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requeted-With, Content-Type, Accept, Authorization, RBR");
    if (req.headers.origin) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
    }
    if (req.method === 'OPTIONS') {
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
        return res.status(200).json({});
    }
    next();
});
//Index page routes //TODO maybe get this out of server.js?
app.get('/', function(req, res) {
    res.status(200);
    res.json({
        "error": "false",
        "message": "OK"
    });
});

//Pull in our api routes
const apiRoutes = require('./server/routes/routes');
//Use api routes
app.use('/api/v1/', apiRoutes);

//Error handlers
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401);
        res.json({"error": "true",
            "error_code": "auth_required"});
    }
});

// development error handler
// will print stacktrace
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});
/* TODO: re-enable for prod
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
*/

module.exports = app;