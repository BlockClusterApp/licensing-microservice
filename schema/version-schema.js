const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema(
  {
    version_tag: String,
    app: String,
  },
  {
    timestamps: true,
  }
);
const VersionHistoryModel = mongoose.model('VersionHistory', VersionSchema);

module.exports = VersionHistoryModel;
