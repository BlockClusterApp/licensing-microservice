const { MongoClient } = require('mongodb');
const Config = require('../config');

let cachedDB;

module.exports = async () => new Promise((resolve) => {
  if (cachedDB != null) {
    return resolve(cachedDB);
  }
  MongoClient.connect(
    Config.mongo.url, { useNewUrlParser: true },
    (err, client) => {
      if (err) {
        throw new Error('Cannot connect to mongo', err);
      }
      cachedDB = client.db(Config.mongo.db);
      return resolve(cachedDB);
    },
  );
  return undefined;
});
