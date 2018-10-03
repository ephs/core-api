#!/usr/bin/env node
console.log("Loading CoreAPI (github.com/ephs/coreAPI)...");

/**
 * Module dependencies.
 */

const fs = require('fs');
const app = require('../server.js').app;
const logger = require('../server.js').logger;
const http = require('http');
const https = require('https');

const config = require('../server/config/config');

let dev = true;
if(dev){
    logger.warn("[SERVER] DEV MODE IS ENABLED. THIS SHOULD NOT BE ENABLED IN PRODUCTION!");
}

/**
 * Get port from environment and store.
 */

let port = normalizePort(process.env.PORT || config.port);
let sslPort = normalizePort(process.env.PORT || config.sslPort);

/**
 * Create HTTP server, for redirection purposes.
 */
let server;
if(!dev) {
    server = http.createServer(function (req, res) {
        res.writeHead(301, {"Location": "https://" + config.hostname + ":8443" + req.url});
        res.end();
    });
}else{
    server = http.createServer(app);
}

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
console.log("HTTP server listening on port " + port);

/**
 * Create HTTPS server.
 */
if(!dev) {
    console.log("NON-SSL will redirect to SSL.");
    const privateKey = fs.readFileSync(config.key, 'utf8');
    const certificate = fs.readFileSync(config.cert, 'utf8');

    console.log("Checking for SSL certificate key and cert in: " + config.key + ", " + config.cert);
    const credentials = {key: privateKey, cert: certificate};


    let sslServer = https.createServer(credentials, app);

    /**
     * Listen on provided port, on all network interfaces.
     */

    sslServer.listen(sslPort);
    sslServer.on('error', onError);
    sslServer.on('listening', onListening);
    console.log("HTTPS server listening on port " + sslPort);
}else{
    console.log("HTTPS server disabled for testing");
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
}