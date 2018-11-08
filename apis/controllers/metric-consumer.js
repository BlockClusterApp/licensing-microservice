const redis = require('../../boot/redis');

const consume = async req => {
  const metricObject = req.body;
  const type = Object.keys(metricObject)[0];
  if (type === 'nodes') {
    metricObject.nodes.forEach(obj => {
      redis.addMetric(req.clientId, type, obj.nodeName, JSON.stringify({ timestamp: new Date().getTime(), usage: obj.usage }));
    });
  } else if (type === 'pods') {
    metricObject.pods.forEach(podObj => {
      const name = `${podObj.namespace}/${podObj.podName}`;
      podObj.containers.forEach(container => {
        redis.addMetric(req.clientId, type, `${name}/${container.name}`, JSON.stringify({ timestamp: new Date().getTime(), usage: container.usage }));
      });
    });
  }
  return true;
};

async function fetchMetrics(clientId, type, resourceName) {
  let result = {};
  if (clientId && type && resourceName) {
    const res = await redis.fetchMetric(clientId, type, resourceName);
    result[type] = { [resourceName]: res.map(JSON.parse) };
  } else if (clientId && type) {
    let res = await redis.fetchMetricByType(clientId, type);
    res = JSON.parse(res);
    Object.keys(res).forEach(key => {
      res[key] = res[key].map(JSON.parse);
    });
    result[type] = res;
  } else if (clientId) {
    result = JSON.parse(await redis.fetchMetricByClient(clientId));
    Object.keys(result).forEach(_type => {
      Object.keys(result[_type]).forEach(resource => {
        result[_type][resource] = result[_type][resource].map(JSON.parse);
      });
    });
  }
  return { metrics: result };
}

module.exports = {
  consume,
  fetchMetrics,
};
