const passport = require('passport')
const { Strategy: LocalStrategy } = require('passport-local')
const { Strategy: GoogleStrategy } = require('passport-google-oauth2')
const User = require('../../models/user')

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  let user
  try {
    user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      let user
      try {
        user = await User.findOne({ email: email.toLowerCase() })
      } catch (err) {
        if (err) {
          return done(err)
        }
      }

      if (!user) {
        return done(null, false, { msg: `Email ${email} not found.` })
      }

      let isMatch
      try {
        isMatch = await user.comparePassword(password)
      } catch (err) {
        if (err) {
          return done(err)
        }
      }

      if (isMatch) {
        return done(null, user)
      }

      return done(null, false, { msg: 'Invalid email or password.' })
    }
  )
)

passport.use(new GoogleStrategy({ 
  clientID:process.env.GOOGLE_CLIENT_SECRET, // Your Credentials here. 
  clientSecret:process.env.GOOGLE_CLIENT_SECRET, // Your Credentials here. 
  callbackURL:process.env.CALL_BACK_URL, 
  passReqToCallback:true
}, 
function(request, accessToken, refreshToken, profile, done) { 
  return done(null, profile); 
} 
));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.send({
    status: 401,
    loggedIn: false,
    msg: 'You are not authorized to access this Url'
  })
}


