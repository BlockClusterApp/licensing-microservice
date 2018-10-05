const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
  clientId: {
    type: Number,
  },
  createdAt: {
    type: Date,
  },
  licenseDetails: {
    type: {
      licenseKey: String,
      licenseCreated: Date,
      licenseExpiry: Date,
    },
  },
  access_key: String,
  clientDetails: {
    type: {
      clientName: String,
      emailId: String,
      phone: String,
    },
  },
  status: {
    type: Boolean,
  },
});

const LicenceModel = mongoose.model('licence', LicenseSchema);

module.exports = LicenceModel;
