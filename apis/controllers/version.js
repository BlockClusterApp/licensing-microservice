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

const searchVersion = async query => {
  const executable = {};
  if (query) {
    Object.assign(executable, query);
  }
  return VersionModel.find(executable).exec();
};

const getLatest = async app => VersionModel.findOne({ app })
  .sort({ createdAt: -1 })
  .exec();
module.exports = {
  saveVersion,
  searchVersion,
  getLatest,
};
