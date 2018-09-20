const ephsCoreBridge = require("../util/ephsCoreBridge");

module.exports.getPastSessions = function (req, res) {
    ephsCoreBridge.getPastSessions(function (err, sessions) {
        if (err) {
            res.status(500);
            res.json({
                "error": "true",
                "error_code": "chk_logs"
            });
        }
        {
            res.status(401);
            res.json({
                "error": "false",
                "sessions": JSON.stringify(sessions)
            });
        }
    }, req.payload.sessID);
};

module.exports.getAvailableSessions = function (req, res) {
    ephsCoreBridge.getAvailableSessions(function (err, sessions) {
        if (err) {
            res.status(500);
            res.json({
                "error": "true",
                "error_code": "chk_logs"
            });
        }
        {
            res.status(401);
            res.json({
                "error": "false",
                "sessions": JSON.stringify(sessions)
            });
        }
    }, req.payload.sessID);
};