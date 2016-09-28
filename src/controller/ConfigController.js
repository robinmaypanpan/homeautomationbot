/**
 * Returns a random response from a provided response set.
 */
"use strict";

const Telegram = require('telegram-node-bot');
const {TelegramBaseController} = Telegram;
const configModule = require('../util/config');

const routes = {
    '/setGreeting': 'setGreeting'
};

class ConfigController extends TelegramBaseController {
    setGreeting($) {
        const greeting = $.query.trim();
        configModule.setConfigValue('boot_greeting', greeting);
        $.sendMessage('Set new boot greeting to: ' + greeting);
    }

    get routes() {
        return routes;
    }
}

module.exports = {
    controller: ConfigController,
    commands: Object.keys(routes),
    help: {
        heading: 'Bot Control',
        lines: [
            '/setGreeting [greeting] - Set the message that I send when I boot up'
        ]
    }
};