/**
 *
 */
"use strict";

const databaseApi = require('../api/database');
const moment = require('moment');

function checkForReminders({tg}) {
    console.log('Checking for reminders');
    databaseApi.getData('reminder')
        .then((reminders) => {
            reminders.forEach((reminder) => {
                const {time, author, message, target, chat} = reminder.data;
                const now = Date.now();
                if (time < now) {
                    const dateOfReminder = new moment(reminder.timestamp).fromNow();

                    if (target === 'group') {
                        const groupMessage =  author._firstName +
                            " asked me on " + dateOfReminder +
                            " to remind you " + message;
                        tg.api.sendMessage(chat._id, groupMessage);
                    } else {
                        const selfMessage = "You asked me " + dateOfReminder +
                            " to remind you " + message;
                        tg.api.sendMessage(author._id, selfMessage);
                    }
                    databaseApi.removeData(reminder);
                }
            });
        })
        .catch((err) => {
            console.error('Error loading reminders');
            console.error(err);
        });
}

module.exports = checkForReminders;