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

  if (license.clusterConfig && license.clusterConfig.clusters && license.clusterConfig.clusters[namespace] && license.clusterConfig.clusters[namespace][identifier]) {
    return Promise.reject(new Error('Cluster already exists'));
  }

  console.log(license);

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

  const res = await license.save();
  console.log(res);
  return license;
};

module.exports = Client;
