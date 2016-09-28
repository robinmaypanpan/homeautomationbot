/**
 *
 */
/**
 * Periodically checks for notifications
 */
"use strict";

const databaseApi = require('../api/database');

function checkForNotifications({sendMessage}) {
    console.log('Checking for notifications');
    databaseApi.getData('notification')
        .then((notifications) => {
            if (notifications.length > 0) {
                return databaseApi.clearData('notification')
                    .then(() => {
                        const messages = notifications.map((it) => it.data);
                        sendMessage(messages.join('\n'));
                        return Promise.resolve();
                    });
            }
        })
        .catch((err) => console.error(err));

}

module.exports = checkForNotifications;