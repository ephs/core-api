const request = require('request');
const querystring = require('querystring');
const Cookie = require('request-cookies').Cookie;
const htmlparser2 = require('htmlparser2');

const config = require('../config/config');

module.exports.getSessions = function(callback, sessID){
    let form = { //Form data
        what: "redisplayLoginScreen", //Lmao this program is so bad
        content: ""
    };

    let formData = querystring.stringify(form); //Build it all!
    let contentLength = formData.length;

    //Ensure we have our sessionID in our cookies.
    let sessCookie = request.cookie('PHPSESSID=' + sessID);

    request({
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': sessCookie,
            'X-Request-From': 'Core2 API'
        },
        uri: config.coreURL, //Core website.
        body: formData,
        method: 'POST',
        port: 443
    }, function (err, response, body) { //Ok, now parse the html and check for the login screen.
        console.log(body);



    });



};

module.exports.login = function (callback, username, password) { //Verify login with CORE server and get the phpssid.
    let form = { //Form data
        username: username,
        password: password,
        what: "login", //Yes, the people who made this are so dumb that all forms POST to the same URL, so we need to add this value to tell the server what to do.
        content: ""
    };

    let formData = querystring.stringify(form); //Build it all!
    let contentLength = formData.length;

    request({
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        uri: config.coreURL, //Core website.
        body: formData,
        method: 'POST',
        port: 443
    }, function (err, response, body) { //Ok, now parse the html and check for the "Invalid username/password" message. If it dosen't exist fire off callback without err.
        let badLogin = false;
        let parser = new htmlparser2.Parser({
            ontext: function (text) { // When we find the invalid login text, remember that.
                if(text.includes("Invalid username or password")){
                    badLogin = true;
                }
            },
            onend: function() { //When the parser is done, decide what to do. Callback(err, sessid)
                if(badLogin){
                    callback(true, "");
                }else{
                    let rawcookies = response.headers['set-cookie']; //Find cookies returned by server. //NOTE: You might think "OH THIS WILL BE THE SAME SESSION ID EVERY TIME!", but its not.
                    for (var i in rawcookies) {
                        let cookie = new Cookie(rawcookies[i]);
                        if(cookie.key === "PHPSESSID"){ //When we find the PHPSESSID return it in the call back.
                            callback(false, cookie.value);
                        }
                    }
                }
            }
        }, {decodeEntities: true});
        parser.write(body); //Tell the parser to scan the body returned by the server when we submitted our form.
        parser.end(); //NO MEMORY LEAKS!
    });
};

function checkForLogin(body, callback){

}