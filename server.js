//Node requires
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const app = express();

//App port. Testing is 8080.
const port = process.env.PORT || '8080';

//Create logger
let logger = function(req, res, next){
    if(req.connection.remoteAddress === "::1")
        console.log("Localhost --> (" + req.method + ") " + req.url);
    else
        console.log(req.connection.remoteAddress + " --> (" + req.method + ") " + req.url);
    next();
};
//Use logger
app.all('*', logger);
console.log("Running logger.");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // support json encoded bodies

//Remove/add headers
app.disable('x-powered-by');
app.all('/*',function(req,res,next){
    res.header('builddate' , '9/14/2018' );
    res.header('x-frame-options', 'SAMEORIGN'); //TODO remove this if needed!
    next();
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