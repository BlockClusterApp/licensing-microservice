const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema(
  {
    clientId: {
      type: Number,
    },
    licenseDetails: {
      licenseKey: String,
      licenseCreated: Date,
      licenseExpiry: Date,
    },
    access_key: {
      type: String,
      select: false,
    },
    daemonTokens: [
      {
        access_token: String,
        isValid: Boolean,
      },
    ],
    clientDetails: {
      clientName: String,
      emailId: String,
      phone: String,
    },
    status: {
      type: Boolean,
    },
    awsMetaData: {
      user: {
        Arn: String,
        CreateDate: Date,
        Path: String,
        UserId: String,
        UserName: String,
      },
      policies: [
        {
          PolicyName: String,
          PolicyId: String,
          Arn: String,
          Path: String,
          DefaultVersionId: String,
          AttachmentCount: Number,
          PermissionsBoundaryUsageCount: Number,
          IsAttachable: Boolean,
          Description: String,
          CreateDate: Date,
          UpdateDate: Date,
        },
      ],
      accessKeys: [
        {
          AccessKeyId: String,
          CreateDate: Date,
          SecretAccessKey: String,
          Status: String,
          UserName: String,
        },
      ],
    },
  },
  {
    collection: 'clients',
    timestamps: true,
  }
);

LicenseSchema.index({
  'licenseDetails.licence_key': 1,
});

const LicenceModel = mongoose.model('licence', LicenseSchema);

module.exports = LicenceModel;
