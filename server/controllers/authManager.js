const ephsCoreBridge = require("../util/ephsCoreBridge");

module.exports.login = function (req, res) {
    console.log(req.body.test);
    res.status(200);
    res.json({
        "token": "yes"
    });
    ephsCoreBridge.login(function (err, sessID) {
            console.log(err);
            console.log(sessID);
        }, "asd1", "asd123"
    );
};