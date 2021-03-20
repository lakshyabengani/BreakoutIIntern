var express = require('express');
var router = express.Router();
var auth = require('../controllers/Auth');
var profile = require('../controllers/Profile');
var authenticate = require('../middlewares/Authenticate');

router.post('/signup', (req, res, next) => auth.signup(req,res));

router.post('/login' , (req,res,next) => auth.login(req,res));

router.get('/profile',authenticate.verifyUser,(req,res,next) => profile.getProfile(req,res));

router.patch('/profile',authenticate.verifyUser,(req,res,next) => profile.patchProfile(req,res));

module.exports = router;
