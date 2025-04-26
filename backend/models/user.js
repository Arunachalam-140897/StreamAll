const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's media
userSchema.virtual('mediaCreated', {
  ref: 'Media',
  localField: '_id',
  foreignField: 'createdBy'
});

// Virtual for user's requests
userSchema.virtual('requests', {
  ref: 'Requests',
  localField: '_id',
  foreignField: 'userId'
});

// Virtual for user's notifications
userSchema.virtual('notifications', {
  ref: 'Notifications',
  localField: '_id',
  foreignField: 'userId'
});

module.exports = mongoose.model('User', userSchema);