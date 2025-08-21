// src/controllers/googleAuthController.js
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const googleAuthController = {
  // Google OAuth success callback
  googleCallback: async (req, res) => {
    try {
      if (!req.user) {
        console.log('No user in Google callback');
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }

      console.log('Google auth successful for user:', req.user.email);
      
      // Generate JWT token
      const token = generateToken(req.user._id);
      
      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
  },

  // Get user profile after Google auth (optional)
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
