const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const LicenseSchema = new mongoose.Schema(
  {
    clientId: {
      type: {
        type: Number,
        unique: 'Client ID already Exists.',
      },
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
      emailId: {
        type: String,
        unique: 'Email already Exists.',
      },
      phone: {
        type: String,
        unique: 'Phone already Exists.',
      },
    },
    status: {
      type: Boolean,
      default: true,
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
LicenseSchema.plugin(beautifyUnique);
LicenseSchema.index({
  'licenseDetails.license_key': 1,
});

const LicenseModel = mongoose.model('license', LicenseSchema);

module.exports = LicenseModel;
