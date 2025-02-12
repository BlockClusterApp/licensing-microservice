const bcrypt = require('bcrypt-nodejs');
const randomstring = require('randomstring');
const raven = require('@sentry/node');

const License = require('../../schema/license-schema');
const licensesModule = require('./license_init');
const aws = require('../controllers/aws');
const Email = require('./send-email');

const rollBackClientCreation = async clientObjectId => {
  const deleted = await License.remove({ _id: clientObjectId });
  return deleted;
};

function makeAccessKey() {
  // return `${new Date().getTime()}${randomstring.generate({ readable: false, length: 20 })}`;
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 8; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

const createClient = async clientDetails => {
  async function sendConfidentialMail(_clientDetails, hash, licenceKey) {
    return Email.processAndSend(
      _clientDetails.clientDetails.emailId,
      _clientDetails.clientDetails.clientName,
      'Confidential Secret Key',
      'Secret Key Confidential',
      'email-accessKey.ejs',
      hash,
      licenceKey
    );
  }

  async function generateECRRepository(clientId) {
    try {
      const ecrRepository = await aws.createECRRepository(clientId, 'webapp');
      await License.updateOne(
        {
          clientId,
        },
        {
          $push: {
            'awsMetaData.ecrRepositories': {
              RepoType: 'webapp',
              Arn: ecrRepository.repositoryArn,
              RegistryId: ecrRepository.registryId,
            },
          },
        }
      );
    } catch (err) {
      console.log(err);
      raven.captureException(err);
    }
  }

  const clientId = randomstring.generate({
    charset: 'abcdefghijkmnpqrstuvwxyz23456789',
    length: 10,
  });
  // eslint-disable no-param-reassign
  clientDetails = Object.assign(clientDetails, {
    createdAt: new Date(),
    clientId,
    status: true,
    awsMetadata: {
      user: {},
      ecrRepositories: [],
      policies: [],
      accessKeys: [],
    },
    servicesIncluded: {
      Payments: true,
      SupportTicket: true,
      Vouchers: true,
      Invoice: true,
      CardToCreateNetwork: true,
      Hyperion: true,
      Admin: true,
      Paymeter: false,
    },
  });
  const hashable = makeAccessKey();

  clientDetails.access_key = bcrypt.hashSync(hashable);
  const saveableDoc = new License(clientDetails);
  let created;
  try {
    created = await saveableDoc.save();
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }

  const bindable = { client: created };
  let license;
  if (clientDetails.license.gen_license === true && !Number.isNaN(clientDetails.license.expire)) {
    try {
      license = await licensesModule.generateNewLicense(created._id, !Number.isNaN(clientDetails.license.expire) ? Number(clientDetails.license.expire) : null);
      await generateECRRepository(clientId);
      await sendConfidentialMail(clientDetails, hashable, license.licenceKey);
      return Object.assign(bindable, license);
    } catch (error) {
      console.log(error);
      await rollBackClientCreation(created._id);
      return Promise.reject(error);
    }
  } else {
    await generateECRRepository(clientId);
    await sendConfidentialMail(clientDetails, hashable);
  }

  return bindable;
};

const disableClient = async clientObjectId => {
  const disabled = await License.update(
    { _id: clientObjectId },
    {
      $set: { status: false },
    }
  );
  if (disabled.nModified === 0) {
    return Promise.reject({ message: 'Client Disable Failed. unable to update.', status: 400 });
  }
  return disabled;
};

const getClients = async (query, limit = 20, page = 0) => {
  Object.assign(query, { status: true });
  const allClients = await License.find(query)
    .limit(limit)
    .skip(limit * page)
    .sort({
      createdAt: -1,
    });
  return allClients;
};

const resetclientSecret = async clientId => {
  const hashable = makeAccessKey();
  console.log(hashable);
  const newHash = bcrypt.hashSync(hashable);

  return License.findOne({ _id: clientId })
    .exec()
    .then(data => {
      if (!data) {
        return Promise.reject({
          message: 'client not found!',
          status: 400,
        });
      }
      data.access_key = newHash;
      return data.save(async (error, saved) => {
        if (error) {
          return Promise.reject({
            message: 'Unable to Update new Secret.',
            status: 500,
          });
        }
        await Email.processAndSend(
          data.clientDetails.emailId,
          data.clientDetails.clientName,
          'Confidential Secret Key',
          'Secret Key Confidential',
          'email-accessKey.ejs',
          hashable
        );
        return saved;
      });
    })
    .catch(error => Promise.reject(error));
};
const clientLicenseUpdate = async payload => {
  const clientObjectId = payload.clientId;
  const clientDoc = await License.findOne({ _id: clientObjectId });
  if (clientDoc.licenseDetails && clientDoc.licenseDetails.licenseKey) {
    return Promise.reject({
      message: 'License Key already Exists. cannot update.',
      status: 400,
    });
  }
  let license;
  if (!Number.isNaN(payload.expire)) {
    license = await licensesModule.generateNewLicense(clientObjectId, Number(payload.expire));
  } else {
    license = await licensesModule.generateNewLicense(clientObjectId);
  }
  return license;
};

const patchClient = async body => {
  const allowedKeys = [
    'clientDetails.clientName',
    'clientDetails.phone',
    'clientDetails.emailId',
    'clientMeta',
    'clientLogo',
    'agentMeta.webAppVersion',
    'agentMeta.webAppMigration',
    'agentMeta.shouldWebAppRefreshAWSImageAuth',
    'agentMeta.shouldDaemonDeployWebApp',
    'servicesIncluded',
  ];

  const cleanedObject = {};
  // eslint-disable-next-line no-unused-vars
  const { updatedBy, client } = body;

  Object.keys(client).forEach(clientKey => {
    if (!allowedKeys.includes(clientKey)) {
      return;
    }
    cleanedObject[clientKey] = client[clientKey];
  });

  await License.updateOne(
    {
      _id: client._id,
    },
    {
      $set: {
        ...cleanedObject,
      },
    }
  );

  return License.find({
    _id: client._id,
  });
};

module.exports = {
  createClient,
  clientLicenseUpdate,
  rollBackClientCreation,
  disableClient,
  getClients,
  resetclientSecret,
  patchClient,
};
