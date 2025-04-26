const mongoose = require('mongoose');

const downloadsSchema = new mongoose.Schema({
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'downloading', 'done', 'error'],
    default: 'pending',
    required: true
  },
  sourceType: {
    type: String,
    enum: ['rss', 'magnet', 'direct', 'file'],
    required: true
  },
  sourceUrl: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  error: {
    type: String
  },
  aria2_gid: {
    type: String
  }
}, {
  timestamps: true
});

// Index for looking up downloads by mediaId
downloadsSchema.index({ mediaId: 1 });

module.exports = mongoose.model('Downloads', downloadsSchema);