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
                    let token = jwt.sign({sessID: sessID, username: htmlEntities(req.body.username)}, config.secret, {expiresIn: "23min"}); //Why 23mins? Well, (by default) our little phpsessid will expire by then.
                    res.json({
                        "error": "false",
                        "token": token,
                        "username": htmlEntities(req.body.username)
                    });
                }
            }, req.body.username, req.body.password
        );
    }
};

function htmlEntities( html ) { //Prevent those pesky little tags from getting to our HTML.
    //I hate regexps. https://stackoverflow.com/questions/5251520/how-do-i-escape-some-html-in-javascript/5251551
    html = html.replace( /[<>]/g, function( match ) {
        if( match === '<' ) return '&lt;';
        else return '&gt;';
    });
    return html;
}