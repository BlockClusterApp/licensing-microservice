const mongoose = require('mongoose');

const FeaturesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('features', FeaturesSchema);
