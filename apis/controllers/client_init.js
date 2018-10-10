const bcrypt = require('bcrypt-nodejs');
const Licence = require('../../schema/licence-schema');
const licensesModule = require('./license_init');
const Email = require('./send-email');

const rollBackClientCreation = async clientObjectId => {
  const deleted = await Licence.remove({ _id: clientObjectId });
  return deleted;
};

function makeAccessKey() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 8; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

const createClient = async clientDetails => {
  // eslint-disable no-param-reassign
  clientDetails = Object.assign(clientDetails, {
    createdAt: new Date(),
    clientId: Date.now(),
    status: true,
  });
  const hashable = makeAccessKey();
  console.log(hashable);
  clientDetails.access_key = bcrypt.hashSync(hashable);
  const saveableDoc = new Licence(clientDetails);
  let created;
  try {
    created = await saveableDoc.save();
  } catch (err) {
    return Promise.reject(err);
  }

  const bindable = { client: created };
  let license;
  if (clientDetails.license.gen_license === true && !Number.isNaN(clientDetails.license.expire)) {
    try {
      license = await licensesModule.generateNewLisence(created._id, !Number.isNaN(clientDetails.license.expire) ? Number(clientDetails.license.expire) : null);
      await Email.processAndSend(
        clientDetails.clientDetails.emailId,
        clientDetails.clientDetails.clientName,
        'Confidential Secret Key',
        'Secret Key Confidential',
        'email-accessKey.ejs',
        hashable,
        license.licenseKey
      );
      return Object.assign(bindable, license);
    } catch (error) {
      await rollBackClientCreation(created._id);
      return Promise.reject(error);
    }
  }
  await Email.processAndSend(
    clientDetails.clientDetails.emailId,
    clientDetails.clientDetails.clientName,
    'Confidential Secret Key',
    'Secret Key Confidential',
    'email-accessKey.ejs',
    hashable
  );
  return bindable;
};

const disableClient = async clientObjectId => {
  const disabled = await Licence.update(
    { _id: clientObjectId },
    {
      $set: { status: false },
    }
  );
  if (disabled.nModified === 0) {
    return Promise.reject({ error: 'Client Disable Failed. unable to update.', status: 400 });
  }
  return disabled;
};

const getClients = async (query, limit = 20, page = 0) => {
  Object.assign(query, { status: true });
  const allClients = await Licence.find(query)
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

  return Licence.findOne({ _id: clientId })
    .exec()
    .then(data => {
      if (!data) {
        return Promise.reject({
          error: 'client not found!',
          status: 400,
        });
      }
      data.access_key = newHash;
      return data.save(async (error, saved) => {
        if (error) {
          return Promise.reject({
            error: 'Unable to Update new Secret.',
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
  const clientDoc = await Licence.findOne({ _id: clientObjectId });
  if (clientDoc.licenseDetails && clientDoc.licenseDetails.licenseKey) {
    return Promise.reject({
      error: 'License Key already Exists. cannot update.',
      status: 400,
    });
  }
  let license;
  if (!Number.isNaN(payload.expire)) {
    license = await licensesModule.generateNewLisence(clientObjectId, Number(payload.expire));
  } else {
    license = await licensesModule.generateNewLisence(clientObjectId);
  }
  return license;
};

module.exports = {
  createClient,
  clientLicenseUpdate,
  rollBackClientCreation,
  disableClient,
  getClients,
  resetclientSecret,
};
