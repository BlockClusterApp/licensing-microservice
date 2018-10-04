const { LicenseSchema } = require('../schema/client_schema');
const mongo = require('../helpers/mongo_querys');
const licensesModule = require('./license_init');

const rollBackClientCreation = async (clientObjectId) => {
  const deleted = await mongo
    .deleteCollection('clients', { _id: clientObjectId }, true)
    .catch(error => Promise.reject(error));
  return deleted;
};

const createClient = async (clientDetails, queryChain) => {
  // eslint-disable-next-line no-param-reassign
  clientDetails = Object.assign(clientDetails, {
    createdAt: new Date(),
    client_id: Date.now(),
    status: true,
  });
  const saveableDoc = LicenseSchema.parse(clientDetails);
  let created;
  try {
    created = await mongo.insertCollection('clients', saveableDoc);
  } catch (err) {
    return Promise.reject(err);
  }
  let license;
  if (queryChain.gen_license === 'true' && !Number.isNaN(queryChain.expire)) {
    try {
      license = await licensesModule.generateNewLisence(
        created.ops[0]._id,
        Number(queryChain.expire),
      );
      return { client: created, ...license };
    } catch (error) {
      await rollBackClientCreation(created.ops[0]._id);
      return Promise.reject(error);
    }
  } else if (queryChain.gen_license === 'true') {
    try {
      license = await licensesModule.generateNewLisence(created.ops[0]._id);
      return { client: created, ...license };
    } catch (error) {
      await rollBackClientCreation(created.ops[0]._id);
      return Promise.reject(error);
    }
  } else {
    return { client: created };
  }
};

const disableClient = async (clientObjectId) => {
  const disabled = await mongo
    .updateCollection(
      'clients',
      { _id: clientObjectId },
      {
        $set: { status: false },
      },
    )
    .catch(error => Promise.reject(error));
  return disabled;
};

const getClients = async (clientObjectIds) => {
  const query = {};
  if (clientObjectIds.length) {
    Object.assign(query, { _id: { $in: clientObjectIds } });
  }
  const allClients = mongo.findFromCollection('clients', query).catch(error => Promise.reject(error));
  return allClients;
};

module.exports = {
  createClient,
  disableClient,
  getClients,
};
