const mongoose = require('mongoose');

const rssFeedsSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  label: {
    type: String,
    required: true
  },
  lastChecked: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for URL uniqueness
rssFeedsSchema.index({ url: 1 }, { unique: true });

module.exports = mongoose.model('RSSFeeds', rssFeedsSchema);