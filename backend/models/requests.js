const mongoose = require('mongoose');

const requestsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  request: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'fulfilled', 'closed'],
    default: 'open',
    required: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for quick lookups
requestsSchema.index({ userId: 1, createdAt: -1 });
requestsSchema.index({ status: 1 });

module.exports = mongoose.model('Requests', requestsSchema);