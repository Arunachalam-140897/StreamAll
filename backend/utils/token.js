const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT secret is not configured', 500);
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256'
  });
};

const verifyToken = (token) => {
  if (!token) {
    throw new AppError('No token provided', 401);
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired', 401);
    }
    throw new AppError('Invalid token', 401);
  }
};

module.exports = { generateToken, verifyToken };
