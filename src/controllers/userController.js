const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    const user = new User({ username, email, passwordHash });
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully!',
      token, 
      data: { id: user._id, username: user.username, email: user.email },
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
    
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      message: 'Login successful!',
      token,
      data: { id: user._id, username: user.username, email: user.email },
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
    const user = await User.findById(req.user._id, '-passwordHash');
    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
        success: false,
        error: true
      });
    }
    res.json({
      data: user,
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


exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar || typeof avatar !== "string") {
      return res.status(400).json({
        message: "Invalid or missing avatar URL.",
        success: false,
        error: true
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, select: "-passwordHash" }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
        error: true
      });
    }

    res.json({
      message: "Avatar updated successfully.",
      data: { avatar: user.avatar },
      success: true,
      error: false
    });
  } catch (error) {
    console.error("[UpdateAvatar] Error:", error.message);
    res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};

