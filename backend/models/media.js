const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['movie', 'series', 'animation']
  },
  genre: {
    type: [String],
    default: []
  },
  type: {
    type: String,
    required: true,
    enum: ['video', 'audio']
  },
  format: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  streamPath: {
    type: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for text search
mediaSchema.index({ title: 'text' });

module.exports = mongoose.model('Media', mediaSchema);