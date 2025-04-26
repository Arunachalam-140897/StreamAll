const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimitMiddleware');
const { validate, updateConfigValidation } = require('../middlewares/validationMiddleware');

// All config routes require admin authentication and rate limiting
router.use(authMiddleware(['admin']));
router.use(apiLimiter);

router.get('/', configController.getConfig);
router.post('/', validate(updateConfigValidation), configController.updateConfig);

module.exports = router;