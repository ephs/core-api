const ver = require('../config/ver');

const randomMessages = ["Join EPHS Programming!", "Alec was here", "This was written on 9/19/2018", "American car horns beep in the tone of F.", "The United States has never lost a war in which mules were used.", "YOU were once the youngest person in the world."];

module.exports.onLoad = function (req, res) {
    res.status(200);
    res.json({
        "error": "false",
        "api_version": ver,
        "helloMessage": randomMessages[Math.floor(Math.random()*randomMessages.length)],
        "serverDate": new Date().toISOString()
    });

};