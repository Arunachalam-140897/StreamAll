const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('../utils/errorHandler');

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new AppError('No token provided', 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database to ensure they still exist
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        throw new AppError('User no longer exists', 401);
      }

      // Check if user has required role
      if (roles.length && !roles.includes(user.role)) {
        throw new AppError('Access denied', 403);
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        next(new AppError('Invalid token', 403));
      } else if (error.name === 'TokenExpiredError') {
        next(new AppError('Token expired', 403));
      } else {
        next(error);
      }
    }
  };
};

module.exports = authMiddleware;
