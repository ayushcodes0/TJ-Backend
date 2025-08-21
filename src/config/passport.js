// src/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/users/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google Profile:', profile);
    
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      console.log('Existing Google user found:', user.email);
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.provider = 'google';
      await user.save();
      console.log('Linked Google to existing user:', user.email);
      return done(null, user);
    }

    // Create new user
    const newUser = new User({
      googleId: profile.id,
      name: profile.displayName,
      username: `google_${profile.id}`, // Generate unique username
      email: profile.emails[0].value,
      avatar: profile.photos.value,
      provider: 'google',
      passwordHash: 'google_auth', // Placeholder since it's not needed for Google auth
      profile: {
        displayName: profile.displayName,
        preferences: {}
      }
    });

    await newUser.save();
    console.log('New Google user created:', newUser.email);
    return done(null, newUser);
  } catch (error) {
    console.error('Google Auth Error:', error);
    return done(error, null);
  }
}));

module.exports = passport;
