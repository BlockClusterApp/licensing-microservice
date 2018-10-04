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
      license_key: String,
      license_created: Date,
      license_expiry: Date,
    },
  },
  access_key: String,
  licenseToken: [
    {
      access_token: String,
      expireBy: Date,
    },
  ],
  clientDetails: {
    type: {
      client_name: String,
      email_id: String,
      phone: String,
    },
  },
  status: {
    type: Boolean,
  },
});

const LicenceModel = mongoose.model('licence', LicenseSchema);

module.exports = LicenceModel;
