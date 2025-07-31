const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../utils/cloudinary');
const { updateSubscriptionStatus } = require('../helpers/subscription');

// Register

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({
        message: 'Username or email already in use.',
        success: false,
        error: true
      });
    }
    const passwordHash = await bcrypt.hash(password, 10);

    // New code: Grant pro trial for 24hrs
    const now = new Date();
    const proExpires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24hr from now

    const user = new User({
      username,
      email,
      passwordHash,
      subscription: {
        plan: 'pro',
        startedAt: now,
        expiresAt: proExpires,
      }
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully!',
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        subscription: user.subscription
      },
      success: true,
      error: false
    });
  } catch (error) {
    console.error('[Register] Error:', error.message);
    res.status(400).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};



// Login

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials.',
        success: false,
        error: true
      });
    }
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid credentials.',
        success: false,
        error: true
      });
    }

    // Update pro status if expired
    await updateSubscriptionStatus(user);

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        subscription: user.subscription
      },
      success: true,
      error: false
    });
  } catch (error) {
    console.error('[Login] Error:', error.message);
    res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};


// Get profile of logged-in user
exports.getProfile = async (req, res) => {
  try {
    let user = await User.findById(req.user._id, '-passwordHash');
    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
        success: false,
        error: true
      });
    }
    user = await updateSubscriptionStatus(user);

    res.json({
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        subscription: user.subscription,
        profile: user.profile,
        createdAt: user.createdAt
      },
      success: true,
      error: false
    });
  } catch (error) {
    console.error('[GetProfile] Error:', error.message);
    res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};



// This controller is for a route: PATCH /api/users/avatar
exports.updateAvatar = async (req, res) => {
  try {
    // Check if file is attached
    if (!req.file) {
      return res.status(400).json({
        message: 'Please upload an image file.',
        success: false,
        error: true
      });
    }

    // Upload to Cloudinary from buffer
    const result = await cloudinary.uploader.upload_stream(
      { folder: 'avatars', resource_type: 'image' },
      async (error, uploaded) => {
        if (error || !uploaded) {
          return res.status(500).json({
            message: 'Cloudinary upload failed.',
            success: false,
            error: true
          });
        }

        const user = await User.findByIdAndUpdate(
          req.user._id,
          { avatar: uploaded.secure_url },
          { new: true, select: '-passwordHash' }
        );

        if (!user) {
          return res.status(404).json({
            message: 'User not found.',
            success: false,
            error: true
          });
        }

        res.json({
          message: 'Avatar updated successfully.',
          data: { avatar: user.avatar },
          success: true,
          error: false
        });
      }
    );

    // Pipe the file buffer to Cloudinary's upload stream
    result.end(req.file.buffer);

  } catch (error) {
    console.error('[UpdateAvatar] Error:', error.message);
    res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};


