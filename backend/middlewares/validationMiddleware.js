const { validationResult, body, param, query } = require('express-validator');
const { AppError } = require('../utils/errorHandler');

const validate = validations => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      throw new AppError(errorMessages.join(', '), 400);
    }
    next();
  };
};

// Auth validation rules
const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Media validation rules
const createMediaValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('category')
    .isIn(['movie', 'series', 'animation'])
    .withMessage('Invalid category'),
  body('genre')
    .isArray()
    .withMessage('Genre must be an array')
    .notEmpty()
    .withMessage('At least one genre is required'),
  body('type')
    .isIn(['video', 'audio'])
    .withMessage('Invalid media type')
];

// Request validation rules
const createRequestValidation = [
  body('request')
    .trim()
    .notEmpty()
    .withMessage('Request content is required')
    .isLength({ max: 1000 })
    .withMessage('Request must be less than 1000 characters')
];

// RSS Feed validation rules
const addFeedValidation = [
  body('url')
    .trim()
    .notEmpty()
    .withMessage('Feed URL is required')
    .isURL()
    .withMessage('Invalid URL format'),
  body('label')
    .trim()
    .notEmpty()
    .withMessage('Feed label is required')
    .isLength({ max: 100 })
    .withMessage('Label must be less than 100 characters')
];

// Personal Vault validation rules
const addVaultItemValidation = [
  body('type')
    .isIn(['photo', 'video'])
    .withMessage('Invalid vault item type'),
  body('isEncrypted')
    .optional()
    .isBoolean()
    .withMessage('isEncrypted must be a boolean value')
];

// Download validation rules
const startDownloadValidation = [
  body('mediaId')
    .isUUID()
    .withMessage('Invalid media ID'),
  body('sourceType')
    .isIn(['rss', 'magnet', 'direct', 'file'])
    .withMessage('Invalid source type'),
  body('sourceUrl')
    .trim()
    .notEmpty()
    .withMessage('Source URL is required')
];

// Pagination validation rules
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Config validation rules
const updateConfigValidation = [
  body('key')
    .trim()
    .notEmpty()
    .withMessage('Config key is required'),
  body('value')
    .notEmpty()
    .withMessage('Config value is required')
];

module.exports = {
  validate,
  loginValidation,
  createMediaValidation,
  createRequestValidation,
  addFeedValidation,
  addVaultItemValidation,
  startDownloadValidation,
  paginationValidation,
  updateConfigValidation
};