// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/userController');
const googleAuthController = require('../controllers/googleAuthController');
const auth = require('../middlewares/auth'); 
const upload = require('../middlewares/upload');
const { authLimiter } = require('../middlewares/rateLimiter');

// Apply auth rate limiter to sensitive routes only
router.post('/register', authLimiter, userController.register);
router.post('/login', authLimiter, userController.login);

// Profile routes (less restrictive)
router.get('/profile', auth, userController.getProfile);
router.patch('/avatar', auth, upload.single('avatar'), userController.updateAvatar);
router.patch('/username', auth, userController.changeUsername);

// Password change (more restrictive)
router.patch('/password', auth, authLimiter, userController.changePassword);

// Google OAuth routes (apply auth limiter to prevent OAuth abuse)
router.get('/auth/google', 
  authLimiter,
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/auth/google/callback',
  authLimiter,
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
    session: false
  }),
  googleAuthController.googleCallback
);

// Optional: Get Google user profile (no rate limiting needed for GET)
router.get('/auth/google/profile', auth, googleAuthController.getGoogleProfile);

// Update subscription route to handle plan type
router.put('/:id/subscription', auth, userController.updateSubscriptionToPro);

module.exports = router;