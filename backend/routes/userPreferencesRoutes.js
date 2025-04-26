const express = require('express');
const router = express.Router();
const userPreferencesController = require('../controllers/userPreferencesController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimitMiddleware');

// All preferences routes require authentication and rate limiting
router.use(authMiddleware());
router.use(apiLimiter);

router.get('/', userPreferencesController.getPreferences);
router.patch('/', userPreferencesController.updatePreferences);

router.patch('/streaming-quality', userPreferencesController.updateStreamingQuality);
router.patch('/notifications', userPreferencesController.updateNotificationSettings);
router.patch('/ui', userPreferencesController.updateUiPreferences);
router.patch('/offline-mode', userPreferencesController.toggleOfflineMode);
router.patch('/download-limit', userPreferencesController.setMaxDownloadSize);

module.exports = router;