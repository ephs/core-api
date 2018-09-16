//TODO: Wait until Thursday to see how the server handles session join requests.

const request = require('request');
const querystring = require('querystring');
const Cookie = require('request-cookies').Cookie;
const cheerio = require("cheerio");
const Promises = require('bluebird');

const config = require('../config/config');

module.exports.getPastSessions = function (callback, sessID) {
    const classFormat = {
        0: "category",
        1: "name",
        2: "date",
        3: "startDate",
        4: "endDate",
        5: "startTime",
        6: "endTime",
        7: "firstName",
        8: "lastName",
        9: "attended"
    };

    let form = { //Form that is sent to the CORE server
        what: "displayPastClasses",
        content: ""
    };

    let formData = querystring.stringify(form); //Build it all!
    let contentLength = formData.length;

    //Build cookies sent to server.
    let sessCookie = request.cookie('PHPSESSID=' + sessID);

    request({
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': sessCookie,
            'X-Request-From': 'Core2 API' //Let the crappy sysadmins know what this is.
        },
        uri: config.coreURL, //Core website.
        body: formData,
        method: 'POST',
        port: 443
    }, function (err, response, body) { //Ok, now parse the html. While I'm going to ensure we are logged in, we really don't need to. Since our JWT token will expire before the session will.
        const $ = cheerio.load(body);
        if ($('#pastClassesAssignedToTbl .tblHeader strong').text() === "Past Sessions Assigned To ()") {
            callback(true, "")
        } else {

            let classes = [];
            let getClasses = new Promises(() => { //Create a promise and wait for it to finish.
                $('#pastClassesAssignedToTbl tbody tr').each(function () {
                    let i = 0;
                    let classData = {};
                    $(this.children).each(function () {
                        let text = $(this).text().trim();
                        if (text !== "") { //There is this weird child in the tr that is empty. Search for it and ignore.
                            classData[classFormat[i]] = text;
                            i++;
                        }
                    });
                    classes.push(classData);
                });
            });

            Promises.resolve().then(getClasses).then(function () { //When done, callback,
                callback(false, classes)
            });
        }
    });
};

module.exports.login = function (callback, username, password) { //Verify login with CORE server and get the phpssid.
    let form = { //Form that is sent to the CORE server
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
        const $ = cheerio.load(body);
        if ($('table.loginBox td span').text() === "* Invalid username or password") { //Where the invalid login thing will appear.
            callback(true, "");
        } else {
            let rawcookies = response.headers['set-cookie']; //Find cookies returned by server. //NOTE: You might think "OH THIS WILL BE THE SAME SESSION ID EVERY TIME!", but its not.
            for (var i in rawcookies) {
                let cookie = new Cookie(rawcookies[i]);
                if (cookie.key === "PHPSESSID") { //When we find the PHPSESSID return it in the call back.
                    callback(false, cookie.value);
                }
            }
        }
    });
};