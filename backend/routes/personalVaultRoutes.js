const express = require('express');
const router = express.Router();
const personalVaultController = require('../controllers/personalVaultController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimitMiddleware');
const { validate, addVaultItemValidation, paginationValidation } = require('../middlewares/validationMiddleware');

// Apply both authentication and rate limiting to all vault routes
router.use(authMiddleware(['admin']));
router.use(apiLimiter);

router.post('/', validate(addVaultItemValidation), personalVaultController.addVaultItem);
router.get('/', validate(paginationValidation), personalVaultController.getAllVaultItems);
router.get('/:id', personalVaultController.getVaultItem);
router.delete('/:id', personalVaultController.deleteVaultItem);

module.exports = router;