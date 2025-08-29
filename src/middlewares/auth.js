// middlewares/auth.js - Fixed version
const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No token provided', 
        success: false, 
        error: true 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fix: Make sure this matches your JWT payload structure
    req.user = { _id: decoded.id || decoded._id }; // Handle both cases
    next();
  } catch (err) {
    console.error('[Auth Middleware] Error:', err.message);
    res.status(401).json({
      message: 'Invalid or expired token', 
      success: false, 
      error: true 
    });
  }
};
