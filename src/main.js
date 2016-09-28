"use strict";
/**
 * Start up our BOT!
 */

// Pull in my personal polyfills.
require('jsPolyfills');

const configModule = require('./util/config.js');

configModule.initConfig(function(config){
  config = configModule.requireConfigKey('bot_key', 'Please enter a telegram bot key: ');

  const Telegram = require('telegram-node-bot');
  const tg = new Telegram.Telegram(config.bot_key);

  require('./controller')(tg);
  require('./periodic')(tg);

  const distributeMessage = require('./util/messageDistributor');

  //distributeMessage(tg, config.boot_greeting);

  console.log(config.bot_name + ' is up and running.'); 
}, function(error) {
  console.log('Something went wrong.', error);
});

