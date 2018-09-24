#!/usr/bin/env node

/**
 * Module dependencies.
 */

const fs = require('fs');
const app = require('../server.js');
const http = require('http');
const https = require('https');
const privateKey = fs.readFileSync('./ssl/testing_localhost.key', 'utf8');
const certificate = fs.readFileSync('./ssl/testing_localhost.crt', 'utf8');

const credentials = {key: privateKey, cert: certificate};

/**
 * Get port from environment and store in Express.
 */

let port = normalizePort(process.env.PORT || '8080');
let sslPort = normalizePort(process.env.PORT || '8443');

/**
 * Create HTTP server, for redirection purposes.
 */

const server = http.createServer(function (req, res) {
    let hostname = ( req.headers.host.match(/:/g) ) ? req.headers.host.slice(0, req.headers.host.indexOf(":")) : req.headers.host;
    res.writeHead(301, {"Location": "https://" + hostname + ":8443" + req.url});
    res.end();
});

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

let sslServer = https.createServer(credentials, app);

/**
 * Listen on provided port, on all network interfaces.
 */

sslServer.listen(sslPort);
sslServer.on('error', onError);
sslServer.on('listening', onListening);
console.log("HTTPS server listening on port " + sslPort);

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