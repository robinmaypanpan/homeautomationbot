/**
 * Returns a random response from a provided response set.
 */
"use strict";

const Telegram = require('telegram-node-bot');
const {TelegramBaseController} = Telegram;

function createHelpController(modules) {
    const messageBlocks = {};

    function createHelpMessage() {
        // Build the default message block
        const defaultMessageBlocks = [];

        defaultMessageBlocks.push("I am a bot that can do many things!");
        defaultMessageBlocks.push("Please type /help [topic] to learn more about what I can do.");
        defaultMessageBlocks.push(' ');
        defaultMessageBlocks.push("Available topics are:");
        messageBlockKeys.forEach((heading) => defaultMessageBlocks.push(heading));

        return defaultMessageBlocks.join('\n');
    }

    function sendTopicMessage(heading) {
        const messages = [];

        const messageBlock = messageBlocks[heading];
        messages.push(heading);
        messageBlock.forEach((line) => messages.push(line));

        return messages.join('\n');
    }

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

    const defaultHelpMessage = createHelpMessage();

    class HelpController extends TelegramBaseController {
        handle($) {
            if (typeof $.query === 'string') {
                const queryString = $.query.trim().toLowerCase();
                const heading = messageBlockKeys.find((heading) => {
                    return heading.toLowerCase() === queryString;
                });
                if (heading) {
                    $.sendMessage(sendTopicMessage(heading));
                } else {
                    $.sendMessage(defaultHelpMessage);
                }
            } else {
                $.sendMessage(defaultHelpMessage);
            }

        }
    }

    return HelpController;
}

module.exports = createHelpController;