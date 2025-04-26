const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimitMiddleware');

// All backup routes require admin authentication and rate limiting
router.use(authMiddleware(['admin']));
router.use(apiLimiter);

router.get('/download', backupController.createBackup);
router.post('/restore', backupController.restore);

module.exports = router;