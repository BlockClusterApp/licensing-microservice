const Feature = require('../../schema/features-schema');
const License = require('../../schema/license-schema');

const Features = {};

Features.fetchFeatures = async () => Feature.find().sort({ createdAt: -1 });

Features.add = async (name, activated = false) => {
  if (!name) {
    return Promise.reject(new Error('Feature name is required'));
  }
  try {
    const feature = new Feature({ name, active: activated || true });
    await feature.save();
    await License.updateMany(
      {
        [`servicesIncluded.${name}`]: {
          $exists: false,
        },
      },
      {
        $set: {
          [`servicesIncluded.${name}`]: activated,
        },
      }
    );
    return Feature.findById(feature._id);
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = Features;
