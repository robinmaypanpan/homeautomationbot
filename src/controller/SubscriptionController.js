/**
 * This controls who is and isn't subscribed
 */
"use strict";

const databaseApi = require('../api/database');

const Telegram = require('telegram-node-bot');
const {TelegramBaseController} = Telegram;

const routes = {
    '/subscribe': 'subscribe',
    '/unsubscribe': 'unsubscribe'
};

class SubscriptionController extends TelegramBaseController {
    subscribe($) {
        const {chatId} = $;
        databaseApi.getData('subscription')
            .then((subscriptions) => {
                if (subscriptions.some((it) => it.data === chatId)) {
                    $.sendMessage("This chat is already subscribed!");
                } else {
                    databaseApi.writeData('subscription', chatId)
                        .then(() => $.sendMessage('This chat is now subscribed!'))
                        .catch((err) => {
                            console.error(err);
                            $.sendMessage("I'm really sorry, but I can't subscribe you for some reason.");
                        });
                }
            })
            .catch((err) => {
                console.error(err);
                $.sendMessage("I'm really sorry, but I can't subscribe you for some reason.");
            });
    }

    unsubscribe($) {
        const {chatId} = $;
        databaseApi.getData('subscription')
            .then((subscriptions) => {
                const thisSubscription = subscriptions
                    .find((it) => it.data === chatId);

                if (thisSubscription) {
                    return databaseApi.removeData(thisSubscription);
                } else {
                    return Promise.resolve(false);
                }
            })
            .then(() => $.sendMessage('This chat is now unsubscribed!'))
            .catch((err) => {
                console.error(err);
                $.sendMessage("I'm really sorry, but I can't unsubscribe you for some reason.");
            });
    }

    get routes() {
        return routes;
    }
}

module.exports = {
    controller: SubscriptionController,
    commands: Object.keys(routes),
    help: {
        heading: 'Bot Control',
        lines: [
            '/subscribe - Register this chat as a place to send notifications',
            '/unsubscribe - Unregister this chat as a place to send notifications'
        ]
    }
};