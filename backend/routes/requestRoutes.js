const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimitMiddleware');
const { validate, createRequestValidation, paginationValidation } = require('../middlewares/validationMiddleware');

// Base authentication and rate limiting for all routes
router.use(authMiddleware());
router.use(apiLimiter);

// Fixed routes first (more specific routes before generic ones)
router.get('/my-requests', validate(paginationValidation), requestController.getUserRequests);
router.get('/', 
  authMiddleware(['admin']), 
  validate(paginationValidation), 
  requestController.getAllRequests
);
router.post('/', validate(createRequestValidation), requestController.createRequest);

// Parameterized routes last
router.patch('/:id',
  authMiddleware(['admin']),
  requestController.updateRequestStatus
);

module.exports = router;