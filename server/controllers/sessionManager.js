const ephsCoreBridge = require("../util/ephsCoreBridge");

module.exports.getPastSessions = function (req, res) {
    ephsCoreBridge.getPastSessions(function (err, sessions) {
        if (err) {
            res.json({
                "error": "true",
                "error_code": "chk_logs"
            });
        }
        {
            res.json({
                "error": "false",
                "sessions": sessions
            });
        }
    }, req.payload.sessID);
};

module.exports.getAvailableSessions = function (req, res) {
    ephsCoreBridge.getAvailableSessions(function (err, sessions) {
        if (err) {
            res.json({
                "error": "true",
                "error_code": "chk_logs"
            });
        }
        {
            res.json({
                "error": "false",
                "sessions": sessions
            });
        }
    }, req.payload.sessID);
};

module.exports.getSignedupSessions = function (req, res) {
    ephsCoreBridge.getSignedupSessions(function (err, sessions) {
        if (err) {
            res.json({
                "error": "true",
                "error_code": "chk_logs"
            });
        }
        {
            res.json({
                "error": "false",
                "sessions": sessions
            });
        }
    }, req.payload.sessID);
};