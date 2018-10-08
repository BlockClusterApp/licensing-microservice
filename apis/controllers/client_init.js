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

const createClient = async (clientDetails, queryChain) => {
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
  await Email.processAndSend(
    clientDetails.clientDetails.emailId,
    clientDetails.clientDetails.clientName,
    'Confidential Secret Key',
    'Secret Key Confidential',
    'email-accessKey.ejs',
    hashable
  );
  let license;
  if (queryChain.gen_license === 'true' && !Number.isNaN(queryChain.expire)) {
    try {
      license = await licensesModule.generateNewLisence(created._id, Number(queryChain.expire));
      return Object.assign({ client: created }, license);
    } catch (error) {
      await rollBackClientCreation(created._id);
      return Promise.reject(error);
    }
  } else if (queryChain.gen_license === 'true') {
    try {
      license = await licensesModule.generateNewLisence(created._id);
      return Object.assign({ client: created }, license);
    } catch (error) {
      await rollBackClientCreation(created._id);
      return Promise.reject(error);
    }
  } else {
    return { client: created };
  }
};

const disableClient = async clientObjectId => {
  const disabled = await Licence.update(
    { _id: clientObjectId },
    {
      $set: { status: false },
    }
  );
  if (disabled.nModified === 0) {
    return new Error('Client Disable Failed. unable to update.');
  }
  return disabled;
};

const getClients = async clientObjectIds => {
  const query = {};
  if (clientObjectIds.length) {
    Object.assign(query, { _id: { $in: clientObjectIds } });
  }
  const allClients = await Licence.find(query);
  return allClients;
};

const resetclientSecret = async clientId => {
  const hashable = makeAccessKey();
  console.log(hashable);
  const newHash = bcrypt.hashSync(hashable);
  // mail hashable to the client.
  return Licence.findOneAndUpdate({ _id: clientId }, { $set: { access_key: newHash } })
    .exec()
    .then(data => {
      if (data.nModified !== 1) {
        return {
          status: 500,
          error: 'Unable To Update Secret',
        };
      }
      return data;
    })
    .catch(error => new Error(error));
};
module.exports = {
  createClient,
  rollBackClientCreation,
  disableClient,
  getClients,
  resetclientSecret,
};
