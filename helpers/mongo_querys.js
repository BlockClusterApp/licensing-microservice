
const getMongoDB = require('../lib/mongo_conn');
/**
 * Updates Mongoose Collection
 *
 * @param {String} collectionName
 * Collection name
 * @param {Object}  selector
 * @param {Object} query
 * Update Object with match
 * @returns
 *  Promise
 */
async function updateCollection(collectionName, selector, query) {
  const mongodb = await getMongoDB();

  return new Promise((resolve) => {
    mongodb.collection(collectionName).update(
      selector,
      query,
      (err, result) => {
        if (err) {
          console.log('Mongo Updation error', err.error);
          throw new Error(err);
        }
        resolve(result);
      },
    );
  });
}
/**
 * Insert Doc/Docs in collection
 *
 * @param {String} collectionName
 * Collection name
 * @param {Object} insertDoc
 * @returns
 *  Promise
 */
async function insertCollection(collectionName, insertDoc) {
  const mongodb = await getMongoDB();

  return new Promise((resolve) => {
    mongodb.collection(collectionName).insert(insertDoc, (err, result) => {
      if (err) {
        console.log('Mongo insertion error', err.error);
        throw new Error(err);
      }
      resolve(result);
    });
  });
}
/**
 * Search From Collection| equivalent to find()
 *
 * @param {String} collectionName
 * Collection name
 * @param {Object}  selector
 * @returns
 * Promise
 */
async function findFromCollection(collectionName, selector) {
  const mongodb = await getMongoDB();

  return new Promise((resolve) => {
    mongodb
      .collection(collectionName)
      .find(selector)
      .toArray((err, result) => {
        if (err) {
          console.log('Mongo search error', err.error);
          throw new Error(err);
        }
        resolve(result);
      });
  });
}

async function deleteCollection(collectionName, query, justONe) {
  const mongodb = await getMongoDB();

  return new Promise((resolve) => {
    mongodb.collection(collectionName).remode(query, justONe, (err, result) => {
      if (err) {
        console.log('Mongo Delete Doc error', err.error);
        throw new Error(err);
      }
      resolve(result);
    });
  });
}

module.exports = {
  insertCollection,
  findFromCollection,
  updateCollection,
  deleteCollection,
};
