/**
 * This file distributes messages to anyone that is subscribed.
 */
"use strict";

const databaseApi = require('../api/database');

const DEBUG_CHATID = -1001095103473;

function distributeMessage(tg, message) {
    console.log('Distributing message ' + message);
    databaseApi.getData('subscription')
        .then((subscriptions) => {
            subscriptions
                .map((it) => it.data)
                .forEach((id) => tg.api.sendMessage(id, message));
        }).catch((err) => {
            console.error(err);
            tg.api.sendMessage(DEBUG_CHATID, 'DEBUG_ONLY:' + message);
        });
}

module.exports = distributeMessage;