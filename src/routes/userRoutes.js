// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/userController');
const googleAuthController = require('../controllers/googleAuthController');
const auth = require('../middlewares/auth'); 
const upload = require('../middlewares/upload');

// Existing routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', auth, userController.getProfile);
router.patch('/avatar', auth, upload.single('avatar'), userController.updateAvatar);
router.patch('/username', auth, userController.changeUsername);
router.patch('/password', auth, userController.changePassword);

// Google OAuth routes
router.get('/auth/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
    session: false // Important: disable sessions since we're using JWT
  }),
  googleAuthController.googleCallback
);

// Optional: Get Google user profile
router.get('/auth/google/profile', auth, googleAuthController.getGoogleProfile);

module.exports = router;
