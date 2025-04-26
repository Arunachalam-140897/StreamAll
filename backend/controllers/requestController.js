const { Requests, Notifications } = require('../models');
const { AppError } = require('../utils/errorHandler');
const { catchAsync } = require('../utils/errorHandler');

exports.createRequest = catchAsync(async (req, res) => {
  const request = await Requests.create({
    userId: req.user.id,
    request: req.body.request
  });

  res.status(201).json({
    status: 'success',
    data: request
  });
});

exports.getAllRequests = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;

  const requests = await Requests.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit)
  });

  res.json({
    status: 'success',
    data: requests
  });
});

exports.getUserRequests = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const requests = await Requests.findAndCountAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit)
  });

  res.json({
    status: 'success',
    data: requests
  });
});

exports.updateRequestStatus = catchAsync(async (req, res) => {
  const { status, notes } = req.body;
  const request = await Requests.findByPk(req.params.id);

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  await request.update({ status, notes });

  // Create notification for the user
  await Notifications.create({
    userId: request.userId,
    message: `Your request "${request.request}" has been ${status}`,
    type: status === 'fulfilled' ? 'success' : 'info'
  });

  res.json({
    status: 'success',
    data: request
  });
});