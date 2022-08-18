//jshint esversion:6
require( "dotenv" ).config()
const express = require( "express" );
const bodyParser = require( "body-parser" );
const ejs = require( "ejs" );
const mongoose = require( "mongoose" );
const bcrypt = require( "bcrypt" );
const saltRounds = 10;

const app = express();

//DB Connection, schema creation and model( collection )
mongoose.connect( "mongodb://localhost:27017/userDb" );

const userSchema = new mongoose.Schema({

    email: String,
    password: String
});
const User = new mongoose.model( "User", userSchema );

//express, ejs and body parser settings
app.use( express.static( "public" ));
app.set( "view engine", "ejs" );
app.use( bodyParser.urlencoded( 
    {extended: true }
));


app.get( "/", function( req, res ){

    res.render("home");

});

app.get( "/login", function( req, res ){

    res.render("Login");
});

app.post( "/login", function( req, res ){

    const username = req.body.username;
    const password = req.body.password;

    User.findOne(
        {email: username}, function( err, foundUser ){

            if( err ){
                console.log( err );
            } else {

                if( foundUser ){
                    bcrypt.compare(password, foundUser.password, function( err, result ) {

                        if(result === true){
                            res.render( "secrets");
                        }
                    })
                        
                    
                }
            }
        })
});

app.get( "/register", function( req, res ){

    res.render("Register");
});

app.listen( 3000, function(){

    console.log("server running on port 3000");
});

app.post( "/register", function( req, res ){

    bcrypt.hash(req.body.password, saltRounds, function( err, hash ){
        
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
    
        newUser.save( function( err ){
    
            if( err ){
                console.log( err );
            } else {
                res.render( "secrets" )
            }
        });

    })

    
})