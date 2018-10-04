const bcrypt = require("bcrypt-nodejs");
const { LicenseSchema } = require("../schema/client_schema");
const mongo = require("../helpers/mongo_querys");
const licensesModule = require("./license_init");

const rollBackClientCreation = async client_ObjectId => {
  const deleted = await mongo
    .deleteCollection("clients", { _id: client_ObjectId }, true)
    .catch(error => {
      return Promise.reject(error);
    });
  return deleted;
};

function makeAccessKey() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

const createClient = async (clientDetails, queryChain) => {
  clientDetails = Object.assign(clientDetails, {
    createdAt: new Date(),
    client_id: Date.now(),
    status: true
  });
  const hashable = makeAccessKey();
  clientDetails.access_key = bcrypt.hashSync(hashable);
  //mail hashable to the client.
  console.log(hashable,">>>>>")
  const saveableDoc = LicenseSchema.parse(clientDetails);
  let created;
  try {
    created = await mongo.insertCollection("clients", saveableDoc);
  } catch (err) {
    return Promise.reject(err);
  }
  let license;
  if (queryChain.gen_license == "true" && !isNaN(queryChain.expire)) {
    try {
      license = await licensesModule.generateNewLisence(
        created.ops[0]._id,
        Number(queryChain.expire)
      );
      return { client: created, ...license };
    } catch (error_gen_lic) {
      await rollBackClientCreation(created.ops[0]._id);
      return Promise.reject(error_gen_lic);
    }
  } else if (queryChain.gen_license == "true") {
    try {
      license = await licensesModule.generateNewLisence(created.ops[0]._id);
      return { client: created, ...license };
    } catch (error_gen_lic) {
      await rollBackClientCreation(created.ops[0]._id);
      return Promise.reject(error_gen_lic);
    }
  } else {
    return { client: created };
  }
};

const disableClient = async client_ObjectId => {
  const disabled = await mongo
    .updateCollection(
      "clients",
      { _id: client_ObjectId },
      {
        $set: { status: false }
      }
    )
    .catch(error => {
      return Promise.reject(error);
    });
  return disabled;
};

const getClients = async client_ObjectIds => {
  let query = {};
  if (client_ObjectIds.length) {
    Object.assign(query, { _id: { $in: client_ObjectIds } });
  }
  const all_clients = mongo
    .findFromCollection("clients", query)
    .catch(error => {
      return Promise.reject(error);
    });
  return all_clients;
};

module.exports = {
  createClient,
  disableClient,
  getClients
};
