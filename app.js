//jshint esversion:6
require( "dotenv" ).config()
const express = require( "express" );
const bodyParser = require( "body-parser" );
const ejs = require( "ejs" );
const mongoose = require( "mongoose" );
const session = require( "express-session" );
const passport = require( "passport" );
const passportLocalMongoose = require( "passport-local-mongoose" );
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

//express, ejs and body parser settings
app.use( express.static( "public" ));
app.set( "view engine", "ejs" );
app.use( bodyParser.urlencoded( 
    { extended: true }
));

app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false,
    //cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

//DB Connection, schema creation and model( collection )
mongoose.connect( "mongodb://localhost:27017/userDb" );

const userSchema = new mongoose.Schema({

    email: String,
    password: String,
    googleId: String
});

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model( "User", userSchema );

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://www.example.com/auth/google/secrets"
  //userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get( "/", function( req, res ){

    res.render("home");

});
app.route( "/login" )

    .get( function( req, res ){

        res.render("Login");
    })

    .post( function( req, res ){

        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        req.logIn(user, function( err ){

            if( err ){
                console.log( err );
            } else {
                passport.authenticate("local")( req, res, function(){

                    res.redirect( "/secrets" );
                });
            }
        })

    });

app.route( "/register" )
    
    .get( function( req, res ){

        res.render("Register");
    })

    .post( function( req, res ){

        User.register({username: req.body.username}, req.body.password, function( err, newUser ){

            if( err ){
                console.log( err );
                res.redirect( "/register" )
            } else {
                passport.authenticate( "local" )( req, res, function(){
                    res.redirect( "/secrets" );
                });
            }
        })
    });

app.route( "/secrets" )
    
    .get(function( req, res ){
        if( req.isAuthenticated()){
            res.render( "secrets" );
        } else {
            res.redirect( "/login" );
        }
    });

app.route( "/logout" )

    .get(function( req, res ){

        req.logOut( function( err ){
           if( err ) console.log( err );
        });
        res.redirect( "/" );
    });

app.listen( 3000, function(){

    console.log("server running on port 3000");
});