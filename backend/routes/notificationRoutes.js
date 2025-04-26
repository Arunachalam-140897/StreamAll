const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimitMiddleware');
const { validate, paginationValidation } = require('../middlewares/validationMiddleware');

// All notification routes require authentication and rate limiting
router.use(authMiddleware());
router.use(apiLimiter);

// Routes with pagination validation
router.get('/', 
  validate(paginationValidation), 
  notificationController.getNotifications
);

// Mark notifications as read (exact path before parameterized path)
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

// Admin only routes (cleanup before specific id deletion)
router.delete('/cleanup/:days',
  authMiddleware(['admin']),
  notificationController.cleanupOldNotifications
);
router.delete('/:id',
  authMiddleware(['admin']),
  notificationController.deleteNotification
);

module.exports = router;