const express = require("express");
const user = express.Router();
const passport = require('passport')
const { isAuthenticated } = require('../helpers/config/passport')
const userController = require("../controllers/user");
const rateLimitMiddleware = require("../helpers/middlewares/rateLimiter");

user.post(
  "/user/auth/signup",
  rateLimitMiddleware,
  userController.postSignUpUser
);

user.get(
  "/user/auth/verify-email/:token",
  isAuthenticated,
  rateLimitMiddleware,
  userController.verifyUserEmail // Move this to the end
);

user.post(
  "/user/auth/login",
  passport.authenticate('local'),
  rateLimitMiddleware,
  userController.postSignInUser
);

user.post(
  "/user/auth/login/google",
  passport.authenticate('local'),
  rateLimitMiddleware,
  userController.postSignInUser
);

user.get('/auth' , passport.authenticate('google', { scope: 
  [ 'email', 'profile' ] 
}),
); 

user.get('/', (req, res) => { 
  res.send("<button><a href='/api/v1/auth'>Login With Google</a></button>") 
}); 


// Auth Callback 
user.get( '/auth/callback', 
    passport.authenticate( 'google', { 
        successRedirect: '/api/v1/auth/callback/success', 
        failureRedirect: '/api/v1/auth/callback/failure'
})); 

// Success  
user.get('/auth/callback/success' , (req , res) => { 
  if(!req.user) 
      res.redirect('/api/v1/auth/callback/failure'); 
  res.send("Welcome " + req.user.email); 
}); 

// failure 
user.get('/api/v1/auth/callback/failure' , (req , res) => { 
  res.send("Error"); 
}) 


module.exports = user;
