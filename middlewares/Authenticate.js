var passport = require('passport');
var JWTStratergy = require('passport-jwt').Strategy;
var ExtractJWT = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var config = require('../config');
var Manager = require('../models/Manager');
var Worker = require('../models/Worker');

exports.getToken = function(user){
    return jwt.sign(user,config.secretKey,{expiresIn:3600});
};

var options ={};
options.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
options.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JWTStratergy(options,
    (jwt_payload,done)=>{
        console.log('JWT payload : ',jwt_payload);
        if(jwt_payload.type == "Manager"){
            Manager.findOne({_id : jwt_payload._id},(err,user)=>{
                if(err){
                    return done(err,false);
                }
                else if(user){

                    return done(null,user);
                }
                else{
                    return done(null,false);
                }
            });
        }else{
            Worker.findOne({_id : jwt_payload._id},(err,user)=>{
                if(err){
                    return done(err,false);
                }
                else if(user){

                    return done(null,user);
                }
                else{
                    return done(null,false);
                }
            });
        }
    }));

exports.verifyUser = passport.authenticate('jwt',{session:false});