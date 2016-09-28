/**
 * This object gets and updates the weather when appropriate.
 */
"use strict";

const databaseApi = require('../api/database');
const weatherApi = require('../api/weather');
const nestApi = require('../api/nest');

const ONE_SECOND = 1000;
const ONE_MINUTE = 60;
const ONE_HOUR = 60;
const MAX_WAIT_THRESHOLD = ONE_SECOND * ONE_MINUTE * ONE_HOUR;

function evaluateWindowState(weather, houseTemp) {
    if (weather.temp > houseTemp + 1) {
        return 'closed';
    } else if (weather.temp < houseTemp - 1) {
        return 'open';
    } else {
        return 'no change';
    }
}

const windowMessages = {
    open: "It's getting nice and cool out. You should open the windows!",
    closed: "It's getting too warm out! You should close the windows!"
};

function updateWindowState(weather) {
    return function() {
        return Promise.all([
            nestApi.getHouseTemperature(),
            databaseApi.getData('windowState').then(databaseApi.pickOutJustData)
        ]).then(([houseTemp, oldWindowState]) => {
            const newWindowState = evaluateWindowState(weather, houseTemp);
            if (newWindowState !== 'no change' && newWindowState != oldWindowState) {
                return databaseApi.clearData('windowState')
                    .then(() => databaseApi.writeData('windowState', newWindowState))
                    .then(() => databaseApi.writeData('notification', windowMessages[newWindowState]));
            } else {
                return Promise.resolve();
            }
        });
    }
}

// Gets and updates the current stored weather on the system.
function getAndUpdateWeather() {
    return databaseApi.getData('weather')
        .then(databaseApi.pickFirstResult)
        .then((oldWeather) => {
            if(!oldWeather || Date.now() - oldWeather.timestamp > MAX_WAIT_THRESHOLD) {
                console.log('Downloading new weather');
                return weatherApi.getNewWeather()
                    .then((weather) => {
                        return databaseApi.clearData('weather')
                            .then(() => databaseApi.writeData('weather', weather))
                            .then(updateWindowState(weather))
                            .then(() => Promise.resolve(weather));
                    });
            } else {
                return databaseApi.pickOutJustData(oldWeather);
            }
        })
}

module.exports = {
    getAndUpdateWeather
};