/**
 * Returns a random response from a provided response set.
 */
"use strict";

const Telegram = require('telegram-node-bot');
const {TelegramBaseController} = Telegram;

function createHelpController(modules) {
    const messageBlocks = {};
    modules.forEach((module) => {
        const heading = module.help.heading;
        if (!messageBlocks[heading]) {
            messageBlocks[heading] = [];
        }

        module.help.lines.forEach((line) => {
            messageBlocks[heading].push(line);
        });
    });
    const messageBlockKeys = Object.keys(messageBlocks);
    const messages = [];

    messageBlockKeys.forEach((key) => {
        const messageBlock = messageBlocks[key];
        messages.push(' ');
        messages.push(key);
        messageBlock.forEach((line) => messages.push(line));
    });

    const helpMessage = messages.join('\n');

    class HelpController extends TelegramBaseController {
        handle($) {
            $.sendMessage(helpMessage);
        }
    }

    return HelpController;
}

module.exports = createHelpController;