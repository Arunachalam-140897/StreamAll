const mongoose = require('mongoose');

const personalVaultSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mediaPath: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['photo', 'video'],
    required: true
  },
  isEncrypted: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for quick lookups by owner
personalVaultSchema.index({ ownerId: 1, createdAt: -1 });

module.exports = mongoose.model('PersonalVault', personalVaultSchema);