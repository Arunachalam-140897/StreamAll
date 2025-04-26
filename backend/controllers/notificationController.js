const NotificationService = require('../services/notificationService');
const { catchAsync } = require('../utils/errorHandler');

exports.getNotifications = catchAsync(async (req, res) => {
  const { page, limit, isRead } = req.query;
  const notifications = await NotificationService.getUserNotifications(
    req.user.id,
    { 
      page: parseInt(page), 
      limit: parseInt(limit),
      isRead: isRead === 'true'
    }
  );

  res.json({
    status: 'success',
    data: notifications
  });
});

exports.markAsRead = catchAsync(async (req, res) => {
  const notification = await NotificationService.markAsRead(
    req.params.id,
    req.user.id
  );

  res.json({
    status: 'success',
    data: notification
  });
});

exports.markAllAsRead = catchAsync(async (req, res) => {
  await NotificationService.markAllAsRead(req.user.id);

  res.json({
    status: 'success',
    message: 'All notifications marked as read'
  });
});

exports.deleteNotification = catchAsync(async (req, res) => {
  const result = await NotificationService.deleteNotification(
    req.params.id,
    req.user.id
  );

  res.json({
    status: 'success',
    message: result.message
  });
});

exports.cleanupOldNotifications = catchAsync(async (req, res) => {
  const days = parseInt(req.params.days);
  await NotificationService.cleanupOldNotifications(days);
  
  res.json({
    status: 'success',
    message: `Notifications older than ${days} days have been cleaned up`
  });
});