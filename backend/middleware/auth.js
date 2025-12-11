const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'healthcare-secret-key-2025';

/**
 * JWT Authentication Middleware
 * Verifies the JWT token and attaches user info to request
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    const payload = decoded || {};
    req.user = {
      userId: payload.userId || payload._id,
      email: payload.email,
      role: payload.role || 'patient'
    };
    req.userId = req.user.userId; // For backward compatibility
    
    next();
  });
};

/**
 * Alias for authenticateToken (for backward compatibility)
 */
const auth = authenticateToken;

module.exports = {
  authenticateToken,
  auth
};
