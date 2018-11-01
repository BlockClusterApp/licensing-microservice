const Redis = require('ioredis');

const loadLuaScripts = require('../redis-lua');
const config = require('../config');

let redisClient;

function initializeRedis() {
  redisClient = new Redis({
    port: config.redis.port,
    host: config.redis.host,
  });

  redisClient.on('connect', () => {
    console.log('Redis connected');
  });
  loadLuaScripts(redisClient);
}

initializeRedis();

module.exports = redisClient;
