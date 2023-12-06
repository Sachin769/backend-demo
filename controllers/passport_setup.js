"use strict"
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
passport.serializeUser(function(user,done){
    console.log("serialize");
    done(null,user);
});
passport.deserializeUser(function(user,done){
    console.log("desralize");
    done(null,user);
});


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret : process.env.GOOGLE_CLIENT_SECRET,
    callbackURL : process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback : true,
},function(request,accesToken,refreshToken,profile,done){
    profile.user_type = request.query.state;
    return done(null,profile);
}));
