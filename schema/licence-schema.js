const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema(
  {
    clientId: {
      type: Number,
    },
    licenseDetails: {
      type: {
        licenseKey: String,
        licenseCreated: Date,
        licenseExpiry: Date,
      },
    },
    access_key: {
      type: String,
      select: false,
    },
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
  },
  {
    collection: 'clients',
    timestamps: true,
  }
);

const LicenceModel = mongoose.model('licence', LicenseSchema);

module.exports = LicenceModel;
