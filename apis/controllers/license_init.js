const moment = require('moment');
const License = require('../../schema/license-schema');

// by default will license expiry will be set to exact 1month of the creation.

function randomString(length) {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
  let result = '';
  for (let i = length; i > 0; i -= 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const generateNewLicense = async (clientObjectId, NO_MONTHS = 1) => {
  const licenseExpiry = moment()
    .add(NO_MONTHS, 'months')
    .toDate();

  const findQuery = { _id: clientObjectId };
  const indexB = randomString(4);
  const indexA = randomString(6);
  const indexC = randomString(4);
  const indexD = randomString(4);
  const licenseKey = `${indexA.toLocaleUpperCase()}-${indexB.toLocaleUpperCase()}-${indexC.toLocaleUpperCase()}-${indexD.toLocaleUpperCase()}`;
  const updateQuery = {
    licenseDetails: {
      licenseKey,
      licenseCreated: new Date(),
      licenseExpiry,
    },
  };

  try {
    await License.update(findQuery, {
      $set: updateQuery,
    });
  } catch (error) {
    return error;
  }
  return updateQuery;
};

module.exports = {
  generateNewLicense,
};
