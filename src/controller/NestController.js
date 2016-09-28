/**
 * Returns a random response from a provided response set.
 */
"use strict";

const Telegram = require('telegram-node-bot');
const {TelegramBaseController} = Telegram;

const {getThermostats} = require('../api/nest');
const {getAndUpdateWeather} = require('../util/weatherRetriever');

const routes = {
    '/setTemps': 'tempSetter',
    '/setTemp': 'tempSetter',
    '/getTemp': 'statusGetter',
    '/getTemps': 'statusGetter',
    '/temps': 'statusGetter',
    '/temp': 'statusGetter',
    '/nest': 'statusGetter'
};

const names = {
    Upstairs: [
        'up',
        'upper',
        'higher',
        'upstairs',
        'bedroom',
        'bedrooms',
        'office',
        'master'
    ],
    Downstairs: [
        'down',
        'downstairs',
        'lower',
        'ground',
        'family',
        'living',
        'dining'
    ]
};

function getCanonicalName(name) {
    if (!name) return undefined;
    const lowercaseName = name.toLowerCase();
    if (names.Upstairs.filter((it) => it === lowercaseName)) {
        return 'Upstairs';
    } else if (names.Downstairs.filter((it) => it === lowercaseName)) {
        return 'Downstairs';
    }
}

function setTemperature($, temp, where) {
    const canonicalName = getCanonicalName(where);
    if (!where) {
        $.sendMessage("Ok, I'll set the temperature to " + temp + "ºF, throughout the house");
    } else {
        $.sendMessage("Ok, I'll set the " + canonicalName + " temperature to " + temp + "ºF");
    }
    getThermostats()
        .then((thermostats) => {
            if (where) {
                thermostats = thermostats.filter((it) => it.name === canonicalName);
            }

            thermostats.forEach((thermostat) => {
                thermostat.setTemperature(temp);
            });

            if (!where) {
                $.sendMessage("The house temperatures have been set to " + temp + "ºF");
            } else {
                $.sendMessage("The temperature " + where + " is now set to " + temp + "ºF");
            }
        })
        .catch((err) => {
            console.error(err.message);
            $.sendMessage('Uh... Something screwed up. I can\'t talk to Nest');
        });
}

class NestController extends TelegramBaseController {
    statusGetter($) {
        Promise.all([
                getThermostats(),
                getAndUpdateWeather()
            ])
            .then(([thermostats, weather]) => {
                const messages = [];
                messages.push("Here are the temperatures at the house");
                messages.push('Outside temperature is ' + weather.temp + 'ºF');
                thermostats.forEach((thermostat) => {
                    messages.push(thermostat.name + ' is at ' + thermostat.temp + 'ºF and is set to ' + thermostat.targetTemp + 'ºF');
                });

                $.sendMessage(messages.join('\n'));
            })
            .catch((err) => {
                console.error(err.message);
                $.sendMessage('Something went wrong. Sorry.');
            });
    }

    tempSetter($) {
        const args = $.query.trim().split(' ');

        const temp = args.length > 0 ? args[0] : undefined;
        const where = args.length > 1 ? args[1] : undefined;

        if (isNaN(temp) && !where) {
            $.sendMessage('Uh... Try again with a temperature, maybe?');
        } else if (isNaN(temp)) {
            setTemperature($, where, temp);
        } else {
            setTemperature($, temp, where);
        }
    }

    get routes() {
        return routes;
    }
}

module.exports = {
    controller: NestController,
    commands: Object.keys(routes),
    help: {
        heading: 'HVAC',
        lines: [
            '/temps - Get the current temperatures in the house',
            '/setTemp [temperature] [location] - Set the temperature in a specific location of the house',
            '/setTemps [temperature] - Set the temperature throughout the house'
        ]
    }
};