const User = require('../models/User');

/**
 * Role-Based Access Control Middleware
 * Checks if the authenticated user has one of the allowed roles
 * 
 * @param {string[]} allowedRoles - Array of roles that can access the route
 * @returns {Function} Express middleware function
 */
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated first
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Fetch user from database to get current role
      const user = await User.findById(req.user.userId).select('role');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Admin has access to everything
      if (user.role === 'admin') {
        req.user.role = user.role;
        return next();
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
        });
      }

      // Attach role to request object
      req.user.role = user.role;
      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify role access'
      });
    }
  };
};

/**
 * Check if user has any of the specified roles (helper function)
 */
const hasRole = (userRole, ...allowedRoles) => {
  if (userRole === 'admin') return true;
  return allowedRoles.includes(userRole);
};

module.exports = {
  requireRole,
  hasRole
};


