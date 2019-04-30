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

module.exports = Client;
