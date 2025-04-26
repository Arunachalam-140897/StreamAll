const { Notifications, User } = require('../models');
const { AppError } = require('../utils/errorHandler');
const { Op } = require('sequelize');

class NotificationService {
  static async create(userId, message, type = 'info') {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return Notifications.create({
      userId,
      message,
      type
    });
  }

  static async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 20, isRead } = options;
    const where = { userId };
    
    if (typeof isRead === 'boolean') {
      where.isRead = isRead;
    }

    return Notifications.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });
  }

  static async markAsRead(notificationId, userId) {
    const notification = await Notifications.findOne({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    return notification.update({ isRead: true });
  }

  static async markAllAsRead(userId) {
    return Notifications.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );
  }

  static async deleteNotification(notificationId, userId) {
    const notification = await Notifications.findOne({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    await notification.destroy();
    return { message: 'Notification deleted successfully' };
  }

  static async cleanupOldNotifications(days) {
    if (!days || days < 1) {
      throw new AppError('Invalid number of days', 400);
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await Notifications.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate
        },
        isRead: true
      }
    });

    return {
      message: `Deleted ${result} old notifications`,
      count: result
    };
  }
}

module.exports = NotificationService;