/**
 * Starts up the periodic checking system.
 */
const checkTheWeather = require('./checkTheWeather');
const checkForNotifications = require('./notifications');
const checkForReminders = require('./checkForReminders');

const distributeMessage = require('../util/messageDistributor');

const ONE_SECOND = 1000;
const ONE_MINUTE = 60;
const LOOP_TIME = ONE_SECOND * ONE_MINUTE * 5;

function startPeriodicChecks(tg) {
    function sendMessage(message) {
        distributeMessage(tg, message);
    }

    function checkStatus() {
        [
            checkForReminders,
            checkTheWeather,
            checkForNotifications
        ].forEach((periodicCheck) => {
            periodicCheck({sendMessage, tg});
        });
    }

    checkStatus();
    setInterval(checkStatus, LOOP_TIME);
}

module.exports = startPeriodicChecks;