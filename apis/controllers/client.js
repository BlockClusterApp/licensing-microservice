const License = require('../../schema/license-schema');

const Client = {};

Client.fetchClusterConfig = async licenceKey => {
  const result = {};
  const license = await License.findOne({
    'licenseDetails.licenseKey': licenceKey,
  });

  if (!license) {
    return result;
  }
  result['licence`yaml'] = `key: ${licenceKey}`;

  if (!license.clusterConfig) {
    return {};
  }
  const cluster = {
    clusters: license.clusterConfig.clusters,
  };

  const { webapp } = license.clusterConfig;

  result['cluster-config.json'] = cluster;
  result['config.json'] = webapp;
  return result;
};

Client.addNamespace = async (clientId, namespace) => {
  const license = await License.findOne({ _id: clientId });
  if (license.clusterConfig && license.clusterConfig.clusters && license.clusterConfig.clusters[namespace]) {
    return Promise.reject(new Error('Already exists'));
  }

  await License.updateOne(
    {
      _id: clientId,
    },
    {
      $set: {
        [`clusterConfig.clusters.${namespace}`]: {},
      },
    }
  );

  const newLicense = await License.findOne({ _id: clientId });
  return newLicense.clusterConfig;
};

module.exports = Client;
