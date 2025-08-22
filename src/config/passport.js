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

    // CREATE NEW USER - Use real name for both name and username
    const now = new Date();
    const proExpiry = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours from now
    
    // Extract real name from Google profile
    const realName = profile.displayName || 
                    (profile.name?.givenName + ' ' + profile.name?.familyName) || 
                    'Google User';
    
    // Handle username uniqueness - if same name exists, add number
    let uniqueUsername = realName;
    let counter = 1;
    
    while (await User.findOne({ username: uniqueUsername })) {
      uniqueUsername = `${realName} ${counter}`;
      counter++;
    }

    const newUser = new User({
      googleId: profile.id,
      name: realName,           // "John Doe"
      username: uniqueUsername, // "John Doe" (or "John Doe 1" if duplicate)
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
        displayName: realName,
        preferences: {}
      }
    });

    await newUser.save();
    console.log('🎉 NEW GOOGLE USER WITH REAL NAME:', newUser.username);
    return done(null, newUser);
  } catch (error) {
    console.error('Google Auth Error:', error);
    return done(error, null);
  }
}));

module.exports = passport;
