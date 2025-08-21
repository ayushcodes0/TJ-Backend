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
      console.log('Existing Google user found - NO PRO TRIAL:', user.email);
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      // Link Google account to existing user - NO PRO TRIAL (already registered)
      user.googleId = profile.id;
      user.provider = 'google';
      await user.save();
      console.log('Linked Google to existing user - NO PRO TRIAL:', user.email);
      return done(null, user);
    }

    // CREATE NEW USER - ASSIGN 24-HOUR PRO TRIAL
    const now = new Date();
    const proExpiry = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours from now

    const newUser = new User({
      googleId: profile.id,
      name: profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName || 'Google User',
      username: `google_${profile.id}`,
      email: profile.emails[0].value,
      avatar: profile.photos?.value || '',
      provider: 'google',
      passwordHash: 'google_auth_placeholder',
      
      // ASSIGN PRO TRIAL FOR 24 HOURS
      subscription: {
        plan: 'pro',
        startedAt: now,
        expiresAt: proExpiry
      },
      
      profile: {
        displayName: profile.displayName || 'Google User',
        preferences: {}
      }
    });

    await newUser.save();
    console.log('🎉 NEW GOOGLE USER WITH 24H PRO TRIAL:', newUser.email);
    console.log('Pro expires at:', proExpiry);
    return done(null, newUser);
  } catch (error) {
    console.error('Google Auth Error:', error);
    return done(error, null);
  }
}));

module.exports = passport;
