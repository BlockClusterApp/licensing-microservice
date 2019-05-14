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

Client.addTokenToCluster = async (clientId, identifier, token) => {
  const license = await License.findOne({ clientId });
  if (!license) {
    return Promise.reject(new Error('Invalid client id'));
  }
  const lic = license.toJSON();
  if (!lic.clusterConfig.clusters) {
    return Promise.reject(new Error('No cluster added'));
  }

  Object.keys(lic.clusterConfig.clusters).forEach(namespace => {
    license.clusterConfig.clusters.get(namespace)[identifier].auth.token = token;
  });

  await license.save();
  return true;
};

Client.addCluster = async (clientId, details) => {
  // eslint-disable-next-line object-curly-newline
  const { masterAPIHost, namespace, workerNodeIP, ingressDomain, identifier, locationName, apiHost } = details;

  if (!/[a-z0-9-]+/.test(identifier)) {
    return Promise.reject(new Error('Identifier should have only small alphabets and numbers and/or hypen'));
  }

  const license = await License.findOne({ _id: clientId });

  if (!license) {
    return Promise.reject(new Error('Invalid license id'));
  }

  if (license.clusterConfig && license.clusterConfig.clusters && license.clusterConfig.clusters.get(namespace) && license.clusterConfig.clusters.get(namespace)[identifier]) {
    return Promise.reject(new Error('Cluster already exists'));
  }

  const obj = {
    masterAPIHost,
    workerNodeIP,
    dynamoDomainName: ingressDomain,
    apiHost,
    locationName,
    locationCode: identifier,
    auth: {
      token: '',
    },
    hyperion: {
      ipfsPort: '0000',
      ipfsClusterPort: '0000',
    },
  };

  if (!license.clusterConfig.clusters) {
    license.clusterConfig.clusters = {};
  }

  if (!license.clusterConfig.clusters.get(namespace)) {
    license.clusterConfig.clusters.set(namespace, {
      [identifier]: obj,
    });
  } else {
    license.clusterConfig.clusters.set(namespace, {
      ...license.clusterConfig.clusters.get(namespace),
      [identifier]: obj,
    });
  }

  await license.save();

  return license;
};

Client.updateCluster = async (clientId, details) => {
  // eslint-disable-next-line object-curly-newline
  const { masterAPIHost, namespace, workerNodeIP, ingressDomain, identifier, locationName, apiHost } = details;

  const license = await License.findOne({ _id: clientId });

  if (!license) {
    return Promise.reject(new Error('Invalid license id'));
  }

  if (!(license.clusterConfig && license.clusterConfig.clusters && license.clusterConfig.clusters.get(namespace) && license.clusterConfig.clusters.get(namespace)[identifier])) {
    return Promise.reject(new Error('Cluster does not exists'));
  }

  const oldConfig = license.clusterConfig.clusters.get(namespace)[identifier];
  license.clusterConfig.clusters.get(namespace)[identifier] = {
    ...oldConfig,
    masterAPIHost,
    workerNodeIP,
    dynamoDomainName: ingressDomain,
    apiHost,
    locationName,
  };

  await license.save();
  return license;
};

Client.addWebappConfig = async (clientId, details) => {
  const { namespace, dynamo, impulse, privatehive, mongo, redis, webapp, rootUrl, ingress, paymeter } = details;
};

module.exports = Client;
