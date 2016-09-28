/**
 * Controls forwarding chat messages to the chat api system for allowing the AI to
 * "Talk intelligently"
 */
"use strict";

const Telegram = require('telegram-node-bot');
const {TelegramBaseController} = Telegram;

const chatApi = require('../api/chat');

class ChatController extends TelegramBaseController {
    handle($) {
        const {message} = $;
        if (message.chat.type === 'private') {
            chatApi.chat($, message.text)
                .then((response) => {
                    $.sendMessage(response);
                }).catch((err) => {
                    console.error(JSON.stringify(err));
                    $.sendMessage(err);
                });
        }
    }
}

module.exports = ChatController;
