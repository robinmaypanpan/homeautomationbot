/**
 * Appreciates the person
 */
"use strict";

const Telegram = require('telegram-node-bot');
const {TelegramBaseController} = Telegram;

const createRRC = require('./RandomResponseControllerFactory');

const ThanksController = createRRC([
    "You're welcome!",
    "No problem!",
    "Just doing my job. :)",
    "Awww. You're so sweet. <3",
    "I appreciate your gratitude.",
    "No, thank YOU!"
]);

module.exports = {
    controller: ThanksController,
    commands: [
        '/thankyou',
        '/thank'
    ],
    help: {
        heading: 'Fun',
        lines: [
            '/thanks - Expresses gratitude'
        ]
    }
};