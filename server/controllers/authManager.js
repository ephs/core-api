const ephsCoreBridge = require("../util/ephsCoreBridge");
const config = require("../config/config");

const jwt = require('jsonwebtoken');

module.exports.login = function (req, res) {
    res.status(200);
    if (!req.body.username || !req.body.password) {
        res.json({
            "error": "true",
            "error_code": "no_login"
        });
    } else {
        ephsCoreBridge.login(function (err, sessID) {
                if (err) {
                    res.json({
                        "error": "true",
                        "error_code": "invalid_login"
                    });
                } else {
                    //Yay our login is good, lets encode the sessionID in a token and send it back.
                    let token = jwt.sign({sessID: sessID}, config.secret, {expiresIn: "23min"}); //Why 23mins? Well, (by default) our little phpsessid will expire by then.
                    res.json({
                        "error": "false",
                        "error_code": "",
                        "token": token //TODO: add student name or ID?
                    });
                }
            }, req.body.username, req.body.password //We really don't need to perform validation. //TODO: maybe actually add it. Worried the school will be pissed.
        );
    }
};