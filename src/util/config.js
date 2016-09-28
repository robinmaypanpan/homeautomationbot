const fs = require('fs');
const prompt = require('prompt-sync')();
const readlineSync = require('readline-sync');

module.exports.initConfig = function(done, err) {
  try {
    fs.accessSync('config.json');
    done(require('../../config.json'));
  } catch (e) {
    if (e.syscall == 'access') {
      console.log('Config does not exist... copying from default config.');
      fs.writeFileSync('config.json', fs.readFileSync('default.config.json'));
      done(require('../../config.json'));
    } else {
      if (err) {
        err(e);  
      }
    }
  }
};

module.exports.promptUserForConfigValue = function(key, prompt) {
  var value = readlineSync.question(prompt);

  return module.exports.setConfigValue(key, value);
};

module.exports.requireConfigKey = function(key, prompt) {
  if (!module.exports.getConfigValue(key)) {
    return module.exports.promptUserForConfigValue(key, prompt);
  } else {
    return module.exports.getConfig();
  }
};

module.exports.getConfig = function() {
  return JSON.parse(fs.readFileSync('config.json').toString());
};

module.exports.getConfigValue = function(key) {
  return module.exports.getConfig()[key];
};

module.exports.setConfigValue = function(key, value) {
  var configObject = module.exports.getConfig();

  configObject[key] = value;
  
  fs.writeFileSync('config.json', JSON.stringify(configObject, null, '\t'));

  return configObject;
};

