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
        redis.addMetric(req.clientId, type, `${name}/${container.name}`, container.usage);
      });
    });
  }
  return true;
};

module.exports = {
  consume,
};
