const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimitMiddleware');
const { validate, startDownloadValidation } = require('../middlewares/validationMiddleware');

// All download routes require admin authentication and rate limiting
router.use(authMiddleware(['admin']));
router.use(apiLimiter);

router.post('/', validate(startDownloadValidation), downloadController.startDownload);
router.get('/:id', downloadController.getDownloadStatus);
router.delete('/:id', downloadController.cancelDownload);

module.exports = router;