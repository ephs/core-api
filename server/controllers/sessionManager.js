const ephsCoreBridge = require("../util/ephsCoreBridge");

module.exports.getSignedupSessions = function (req, res) {
    console.log(req.body.test);
    res.status(200);
    res.json({
        "token": "yes"
    });
    ephsCoreBridge.getSessions({}, "j1n5215cd457bu4oe9t42u0j31");
};