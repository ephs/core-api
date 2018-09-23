const ephsCoreBridge = require("../util/ephsCoreBridge");

module.exports.joinSession = function (req, res) {
    ephsCoreBridge.joinSession(function (err) {
        if (err) {
            res.json({
                "error": "true",
                "error_code": "chk_logs"
            });
        }
        {
            res.json({
                "error": "false",
            });
        }
    }, req.payload.sessID, req.body.id, req.body.weekStart, req.body.weekEnd, req.body.date, req.body.startTime, req.body.endTime);
};

module.exports.leaveSession = function (req, res) {
    ephsCoreBridge.leaveSession(function (err) {
        if (err) {
            res.json({
                "error": "true",
                "error_code": "chk_logs"
            });
        }
        {
            res.json({
                "error": "false",
            });
        }
    }, req.payload.sessID, req.body.id);
};

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