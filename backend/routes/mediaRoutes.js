const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const authMiddleware = require('../middlewares/authMiddleware');
const { mediaUploadLimiter, apiLimiter } = require('../middlewares/rateLimitMiddleware');
const { validate, createMediaValidation, paginationValidation } = require('../middlewares/validationMiddleware');

// Apply general rate limiting to all routes
router.use(apiLimiter);

// Fixed routes first
router.get('/', validate(paginationValidation), mediaController.getAllMedia);
router.post('/', 
  authMiddleware(['admin']), 
  mediaUploadLimiter,
  validate(createMediaValidation), 
  mediaController.uploadMedia
);

// Parameterized routes last, ordered by specificity
router.get('/:id/stream', authMiddleware(), mediaController.streamMedia);
router.get('/:id', mediaController.getMedia);
router.patch('/:id', authMiddleware(['admin']), validate(createMediaValidation), mediaController.updateMedia);
router.delete('/:id', authMiddleware(['admin']), mediaController.deleteMedia);

module.exports = router;