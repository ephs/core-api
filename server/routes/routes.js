const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const config = require('../config/config');
const auth = jwt({
    secret: config.secret,
    userProperty: 'payload'
});

const sessionManager = require('../controllers/sessionManager');
const authManager = require('../controllers/authManager');


router.post('/login', authManager.login);

//router.get('/v1/sessions/available',auth, sessionManager.getSessions);
router.get('/sessions/signedup',sessionManager.getSignedupSessions);
//router.get('/v1/sessions/past',auth, sessionManager.getPast);
//router.post('/v1/sessions/signup',auth, sessionManager.signUp);

module.exports = router;

//Example secured route:
//router.get('/profile', auth, posts);
