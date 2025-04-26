const express = require('express');
const router = express.Router();
const rssController = require('../controllers/rssController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimitMiddleware');
const { validate, addFeedValidation } = require('../middlewares/validationMiddleware');

// All RSS routes require admin authentication and rate limiting
router.use(authMiddleware(['admin']));
router.use(apiLimiter);

// Fixed routes first
router.get('/', rssController.getAllFeeds);
router.post('/', validate(addFeedValidation), rssController.addFeed);

// Parameterized routes last
router.delete('/:id', rssController.deleteFeed);
router.get('/:id/items', rssController.getFeedItems);

module.exports = router;