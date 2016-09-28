/**
 * Returns a random response from a provided response set.
 */
"use strict";

const Telegram = require('telegram-node-bot');
const {TelegramBaseController} = Telegram;

function createResponseController(responseSet) {
    class RandomResponseController extends TelegramBaseController {
        handle($) {
            const messageId = Math.floor(Math.random() * responseSet.length);
            $.sendMessage(responseSet[messageId]);
        }
    }
    return RandomResponseController;
}

module.exports = createResponseController;