const ephsCoreBridge = require("../util/ephsCoreBridge");

module.exports.getPastSessions = function (req, res) {
    ephsCoreBridge.getPastSessions(function (err, sessions) {
        res.json({
            "error": "false",
            "sessions": JSON.stringify(sessions)
        });
    }, req.payload.sessID);
};

module.exports.getAvailableSessions = function (req, res) {
    ephsCoreBridge.getAvailableSessions(function (err, sessions) {
        res.json({
            "error": "false",
            "sessions": JSON.stringify(sessions)
        });
    }, req.payload.sessID);
};