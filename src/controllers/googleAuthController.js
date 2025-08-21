// src/controllers/googleAuthController.js
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const googleAuthController = {
  googleCallback: async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }

      console.log('Google auth successful for user:', req.user.email);
      
      // Generate JWT token
      const token = generateToken(req.user._id);
      
      // Check if this is a NEW user (created within last minute)
      const userCreatedRecently = new Date() - new Date(req.user.createdAt) < 60000;
      const hasProSubscription = req.user.subscription?.plan === 'pro';
      const proIsActive = req.user.subscription?.expiresAt && new Date(req.user.subscription.expiresAt) > new Date();
      
      let redirectPath = '/dashboard';
      
      if (userCreatedRecently && hasProSubscription) {
        // NEW USER WITH PRO TRIAL
        redirectPath = '/dashboard';
        console.log('🎉 NEW Google user with Pro trial → Dashboard');
      } 
      else if (proIsActive) {
        // EXISTING USER WITH ACTIVE PRO
        redirectPath = '/dashboard';
        console.log('✅ Existing Google user with active Pro → Dashboard');
      } 
      else {
        // EXISTING USER WITH EXPIRED/NO PRO
        redirectPath = '/pricing';
        console.log('💰 Existing Google user with expired Pro → Pricing');
      }
      
      res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}&redirect=${redirectPath}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
  },
  getGoogleProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-passwordHash -googleId -__v');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      res.json({
        success: true,
        user: user
      });
    } catch (error) {
      console.error('Get Google profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
};

module.exports = googleAuthController;
