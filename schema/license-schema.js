const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const redis = require('../boot/redis');

const LicenseSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      unique: 'Client ID already Exists.',
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
      ecrRepositories: [
        {
          RepoType: String,
          Arn: String,
          RegistryId: String,
        },
      ],
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
          PolicyId: String,
          AccessKeyId: String,
          CreateDate: Date,
          SecretAccessKey: String,
          Status: String,
          UserName: String,
        },
      ],
    },
    clientMeta: {
      // some brief description may be
      type: String,
    },
    clientLogo: {
      // if exist
      type: String,
    },
    servicesIncluded: {
      /**
       * so in this we can d like below:
       * {payment: true}
       * {voucher: true}
       * */
      type: Object,
    },
    agentMeta: {
      daemonVersion: String,
      webAppVersion: String,
      shouldDaemonDeployWebApp: Boolean,
    },
  },
  {
    collection: 'clients',
    timestamps: true,
  }
);
LicenseSchema.plugin(beautifyUnique);
LicenseSchema.index({
  'licenseDetails.licenseKey': 1,
});

LicenseSchema.statics.findClientIdFromLicenceKey = async function fetchFromCache(licenceKey) {
  const key = `client/${licenceKey}`;
  let clientId = await redis.get(key);
  if (!clientId) {
    const licence = await this.findOne({ 'licenseDetails.licenseKey': licenceKey });
    clientId = licence.clientId; // eslint-disable-line
    await redis.setex(key, 60 * 60 * 24, clientId);
  }
  return clientId;
};

const LicenseModel = mongoose.model('license', LicenseSchema);

module.exports = LicenseModel;
