const mongoose = require('mongoose');

const notificationsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  }
}, {
  timestamps: true
});

// Indexes for common queries
notificationsSchema.index({ userId: 1, createdAt: -1 });
notificationsSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notifications', notificationsSchema);