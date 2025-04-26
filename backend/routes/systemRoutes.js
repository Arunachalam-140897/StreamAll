const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimitMiddleware');

// All system routes require admin authentication and rate limiting
router.use(authMiddleware(['admin']));
router.use(apiLimiter);

// Metrics routes (specific before generic)
router.get('/metrics/latest', systemController.getLatestMetrics);
router.get('/metrics', systemController.getMetrics);

// Downloads management routes (specific before generic)
router.get('/downloads/stats', systemController.getDownloadStats);
router.post('/downloads/pause', systemController.pauseDownloads);
router.post('/downloads/resume', systemController.resumeDownloads);
router.post('/downloads/purge', systemController.purgeDownloads);

module.exports = router;