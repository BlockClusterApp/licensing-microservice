const VersionModel = require('../../schema/version-schema');

const saveVersion = async (version, app) => {
  const savable = new VersionModel({
    version_tag: version,
    app,
  });
  savable.save((error, saved) => {
    if (error) {
      throw error;
    }
    return saved;
  });
};

module.exports = {
  saveVersion,
};
