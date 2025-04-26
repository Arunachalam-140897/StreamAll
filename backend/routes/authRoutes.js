const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');
const { validate, loginValidation } = require('../middlewares/validationMiddleware');

// Apply rate limiting and validation to login route
router.post('/login', 
  authLimiter,
  validate(loginValidation),
  authController.login
);

// Only admins can create users, with validation
router.post('/register', 
  authMiddleware(['admin']), 
  validate(loginValidation),
  authController.register
);

module.exports = router;
