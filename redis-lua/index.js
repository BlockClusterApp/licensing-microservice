let fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

fs = Promise.promisifyAll(fs);

module.exports = function initializeLuaScripts(redisClient) {
  function loadScripts(dir) {
    return fs
      .readdirAsync(dir)
      .filter(file => path.extname(file) === '.lua')
      .map(file => {
        const longName = path.basename(file, '.lua');
        const name = longName.split('-')[0];
        const numberOfKeys = Number(longName.split('-')[1]);
        return fs.readFileAsync(path.join(dir, file)).then(lua => ({
          name,
          options: { numberOfKeys, lua: lua.toString() },
        }));
      });
  }
  const scripts = loadScripts(__dirname);
  return scripts.each(command => !console.log(`Loading redis function ${command.name}`) && redisClient.defineCommand(command.name, command.options));
};
