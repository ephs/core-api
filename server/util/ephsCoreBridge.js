//TODO: Wait until Thursday to see how the server handles session join requests.

const request = require('request');
const querystring = require('querystring');
const Cookie = require('request-cookies').Cookie;
const cheerio = require("cheerio");
const Promises = require('bluebird');

const config = require('../config/config');

//There are the tables that CORE displays.

const pastTableFormat = { //The table format that Core displays.
    0: "category", //For example, category is in row 1
    1: "name", //row2
    2: "date", //row3
    3: "startDate", //row4
    4: "endDate", //row5
    5: "startTime", //row6
    6: "endTime", //row7
    7: "firstName", //row8
    8: "lastName", //row9
    9: "attended" //row10
};

const availableTableFormat = { //The table format that Core displays. //This is misleading. This is the typical data return format.
    0: "category", //For example, category is in row 1
    1: "name", //row2
    2: "date", //row3
    3: "openSeats", //row4
    4: "firstName", //row5
    5: "lastName" //row6
};

//SESSID != sessionID.
module.exports.joinSession = function (callback, sessID, sessionID, weekStart, weekEnd, sessionDate, startTime, endTime) { //WHY CORE?!?! We need to provide all this stuff just to join a session?!?!
    //Btw, I could make this way smaller, but it would overwrite all the others sessions they signed for. The school would not like that.
    let form = { //Form that is sent to the CORE server
        sessionId: sessionID,
        checkForScheduleOverlap: 'yes',
        weekStart: weekStart,
        weekEnd: weekEnd,
        sessionDate: sessionDate,
        startTime: startTime,
        endTime: endTime,
        what: "addStudentToSession",
    };

    let formData = querystring.stringify(form); //Build it all!
    let contentLength = formData.length;
    let sessCookie = request.cookie('PHPSESSID=' + sessID);
    request({
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': sessCookie
        },
        uri: config.coreURL, //Core website.
        body: formData,
        method: 'POST',
        port: 443
    }, function (err, response, body) {
        //console.log(body);
        if (!err) {
            callback(false)
        } else {
            callback(true)
        }
    });
};

//SESSID != sessionID.
module.exports.leaveSession = function (callback, sessID, sessionID) {
    let form = { //Form that is sent to the CORE server
        sessionId: sessionID,
        what: "removeStudentFromSession",
    };

    let formData = querystring.stringify(form); //Build it all!
    let contentLength = formData.length;
    let sessCookie = request.cookie('PHPSESSID=' + sessID);
    request({
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': sessCookie
        },
        uri: config.coreURL, //Core website.
        body: formData,
        method: 'POST',
        port: 443
    }, function (err, response, body) {
        if (!err) {
            callback(false)
        } else {
            callback(true)
        }
    });
};

module.exports.getSignedupSessions = function (callback, sessID) {
    corePOST("displaySignupScreen", sessID, function (err, response, body) {
        const $ = cheerio.load(body);
        if ($('#classesAssignedToTbl .tblHeader strong').text() === "Sessions Active For ()") { //CORE's amazing way of telling us we are not authenticated.
            callback(true, "")
        } else {
            let classes = [];
            let getClasses = new Promises(() => { //Create a promise and wait for it to finish.
                if ($("#classesAssignedToTbl tbody tr td").text() === "No active sessions found") { //Make sure there are actually classes there
                    return;
                }
                $('#classesAssignedToTbl tbody tr').each(function () {
                    let i = 0;
                    let classData = {};
                    $(this.children).each(function () {
                        if (this.name === "td") {
                            if (i === 0) { //Ok, the first td is the plus button, and the second is a useless info button.
                                let jsFunction = $(this.children[0]).attr('onclick'); //Get the first child (the image) and get the javascript
                                classData["id"] = jsFunction.substring((getPosition(jsFunction, "'", 1) + 1), getPosition(jsFunction, "'", 2));
                            } else if (i === 1) { //Ok, this is the info button. We need a little bit of data from here.
                                classData["classroom"] = $(this.children[0]).attr('classroom');
                            }else if (i >= 2) {
                                let text = $(this).text().trim();
                                classData[availableTableFormat[i - 2]] = text; //Off set the classformat value by two because of the mentioned redundant tds.
                            }
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

module.exports.getAvailableSessions = function (callback, sessID) { //This is by far the worst. We need to parse a random javascript function to get additional info about the session.
    corePOST("displaySignupScreen", sessID, function (err, response, body) {
        const $ = cheerio.load(body);
        if ($('#classesAssignedToTbl .tblHeader strong').text() === "Sessions Active For ()") { //CORE's amazing way of telling us we are not authenticated.
            callback(true, "")
        } else {
            let classes = [];
            let getClasses = new Promises(() => { //Create a promise and wait for it to finish.
                if ($("#classesNotAssignedToTbl1 tbody tr td").text() === "No available sessions found") { //Make sure there are actually classes there
                    return;
                }
                $('#classesNotAssignedToTbl1 tbody tr').each(function () {
                    let i = 0;
                    let classData = {};
                    $(this.children).each(function () {
                        if (this.name === "td") {
                            if (i === 0) { //Ok, the first td is the plus button, and the second is a useless info button.
                                let jsFunction = $(this.children[0]).attr('onclick'); //Get the first child (the image) and get the javascript. This is the thing I mentioned earlier.
                                classData["id"] = jsFunction.substring((getPosition(jsFunction, "'", 1) + 1), getPosition(jsFunction, "'", 2)); //Get the session ID
                                classData["weekStart"] = jsFunction.substring((getPosition(jsFunction, "'", 5) + 1), getPosition(jsFunction, "'", 6)); //Get weekStart
                                classData["weekEnd"] = jsFunction.substring((getPosition(jsFunction, "'", 7) + 1), getPosition(jsFunction, "'", 8)); //Get weekEnd
                                classData["startTime"] = jsFunction.substring((getPosition(jsFunction, "'", 11) + 1), getPosition(jsFunction, "'", 12)); //Get weekEnd
                                classData["endTime"] = jsFunction.substring((getPosition(jsFunction, "'", 13) + 1), getPosition(jsFunction, "'", 14)); //Get weekEnd
                            } else if (i === 1) { //Ok, this is the info button. We need a little bit of data from here.
                                classData["classroom"] = $(this.children[0]).attr('classroom');
                            }else if (i >= 2) {
                                let text = $(this).text().trim();
                                classData[availableTableFormat[i - 2]] = text; //Off set the classformat value by two because of the mentioned redundant tds.
                            }
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

module.exports.getPastSessions = function (callback, sessID) {

    corePOST("displayPastClasses", sessID, function (err, response, body) {
        const $ = cheerio.load(body);
        if ($('#pastClassesAssignedToTbl .tblHeader strong').text() === "Past Sessions Assigned To ()") { //CORE's amazing way of telling us we are not authenticated.
            callback(true, "");
        } else {
            let classes = [];
            let getClasses = new Promises(() => { //Create a promise and wait for it to finish.
                if ($("#pastClassesAssignedToTbl tbody tr td").text() === "No past sessions found") {
                    return;
                }
                $('#pastClassesAssignedToTbl tbody tr').each(function () {
                    let i = 0;
                    let classData = {};
                    $(this.children).each(function () {
                        if (this.name === "td") {
                            classData[pastTableFormat[i]] = $(this).text().trim();
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

    //This dosen't use getSessionData() because we need to be unauthenticated.
    request({
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded',
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

function corePOST(what, sessID, callback) {
    let form = { //Form that is sent to the CORE server
        what: what,
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
        },
        uri: config.coreURL, //Core website.
        body: formData,
        method: 'POST',
        port: 443
    }, function (err, response, body) { //Callback
        callback(err, response, body);
    });
}

function getPosition(string, subString, index) { //For getting available post ids.
    return (string.split(subString, index).join(subString).length);
}