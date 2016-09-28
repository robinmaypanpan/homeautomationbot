/**
 * Returns a random response from a provided response set.
 */
"use strict";

const Telegram = require('telegram-node-bot');
const {TelegramBaseController} = Telegram;
const moment = require('moment');

const databaseApi = require('../api/database');
const chrono = require('chrono-node');
function remindSomeone($, target) {
    const {query} = $;
    const now = moment();
    var results = chrono.parse(query);

    if (!results || results.length === 0) {
        $.sendMessage("Sorry, I didn't understand when you wanted me to remind you about that.");
        return;
    }
    
    var firstResult = results[0];

    // If we parsed a weekday in the past, let's force it to be the same day next week
    if (firstResult.start.knownValues.hasOwnProperty('weekday') && moment(firstResult.start.date()).diff(now) < 0) {
        results = chrono.parse(query, now.add(7,'days').toDate());
        firstResult = results[0];
    }

    const {message} = $;

    const payload = {
        target,
        chat: message.chat,
        author: message.from,
        message: query.slice(0, firstResult.index).trim(),
        time: firstResult.start.date()
    };

    databaseApi.writeData('reminder', payload)
        .then(() => {
            const payloadDate = moment(payload.time);
            const readableDate = payloadDate.fromNow();

            var message = "Got it! I'll remind you " + payload.message + " " + readableDate;

            if (now.diff(payloadDate, 'days')) {
                var readableTime = payloadDate.format('LT');

                if (readableTime == '12:00 PM') {
                    readableTime = 'noon';
                }

                if (readableTime == '12:00 AM') {
                    readableTime = 'midnight';
                }

                message = message + ' at ' + readableTime;
            }
            
            $.sendMessage(message);
        })
        .catch((err) => {
            console.error(err);
            $.sendMessage("My memory is being funny. I can't remember that. :(");
        });
}

class ReminderController extends TelegramBaseController {
    handle($) {
        const {message} = $;
        if (message.chat.type === 'private' ||
            message.text.startsWith('/remindMe') ||
            message.text.startsWith('/remindme')) {
            remindSomeone($, 'self');
        } else {
            remindSomeone($, 'group');
        }

    }
}

module.exports = {
    controller: ReminderController,
    commands: [
        '/remindme',
        '/remindus',
        '/remindMe',
        '/remindUs',
        '/reminder'
    ],
    help: {
        heading: 'Reminders',
        lines: [
            '/remindUs to [do something] [at some time] - Set a group reminder',
            '/remindMe to [do something] [at some time] - Set a personal reminder'
        ]
    }
};