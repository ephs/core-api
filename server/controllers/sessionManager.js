const ephsCoreBridge = require("../util/ephsCoreBridge");

module.exports.getPastSessions = function (req, res) {
    ephsCoreBridge.getPastSessions(function (err, sessions) {
        res.json({
            "error": "false",
            "error_code": "",
            "data": JSON.stringify(sessions)
        });
    }, req.payload.sessID);
};