//Node requires
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const app = express();
const rateLimit = require("express-rate-limit");

const config = require('./server/config/config');

//App port. Testing is 8080.
const port = process.env.PORT || '8080';

//Create logger
let logger = function(req, res, next){
    if(req.connection.remoteAddress === "::1") //Local host = ::1
        console.log("Localhost --> (" + req.method + ") " + req.url);
    else
        console.log(req.connection.remoteAddress + " --> (" + req.method + ") " + req.url);
    next();
};
//Use logger
app.all('*', logger);
console.log("Running logger.");

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
        "message": "Hello there!"
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


const server = http.createServer(app);
server.listen(port, () => console.log('EPHS Core API instance running on 127.0.0.1:' + port + '.'));

//TODO: Can't get this to work because i'm lazy and don't want to switch DNS records to my IP.
/*
require('greenlock-express').create({

    // Let's Encrypt v2 is ACME draft 11
    version: 'draft-11'

    // Note: If at first you don't succeed, switch to staging to debug
    // https://acme-staging-v02.api.letsencrypt.org/directory
    , server: 'https://acme-v02.api.letsencrypt.org/directory'

    // Where the certs will be saved, MUST have write access
    , configDir: '~/.config/acme/'

    // You MUST change this to a valid email address
    , email: 'alec@simplyalec.com'

    // You MUST change these to valid domains
    // NOTE: all domains will validated and listed on the certificate
    , approveDomains: [ 'core.api.notalec.com', 'test.simplyalec.com' ]

    // You MUST NOT build clients that accept the ToS without asking the user
    , agreeTos: true

    , app: app

    // Join the community to get notified of important updates
    , communityMember: true

    // Contribute telemetry data to the project
    , telemetry: true

//, debug: true

}).listen(8080, 8443 );
*/