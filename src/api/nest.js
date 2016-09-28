/**
 * This is our local api for accessing the nest thermostat.
 */
"use strict";

const nest = require('unofficial-nest-api');
const configModule = require('../util/config');

configModule.requireConfigKey('nest_username', 'Please enter a username for your Nest account: ');
configModule.requireConfigKey('nest_password', 'Please enter a password for your Nest account: ');

const config = configModule.getConfig();

const USERNAME = config.nest_username;
const PASSWORD = config.nest_password;

// Convert the where_id into an actual human readable name.
function whereIdToName(data, where_id) {
    const {where} = data;
    const structureId = nest.getStructureId();
    const {wheres} = where[structureId];

    return wheres
        .filter((it) => it.where_id === where_id)
        .map((it) => it.name)[0];
}

// Return a list of thermostat objects whose temperatures can be set.
function listThermostats(data){
    const thermostats = [];
    for (var deviceId in data.device) {
        if (data.device.hasOwnProperty(deviceId)) {
            const device = data.device[deviceId];
            const sharedDevice = data.shared[deviceId];
            const thermostat = {
                name: whereIdToName(data, device.where_id),
                temp: nest.ctof(sharedDevice.current_temperature),
                targetTemp: nest.ctof(sharedDevice.target_temperature),
                setTemperature(temp) {
                    nest.setTemperature(deviceId, nest.ftoc(temp));
                }
            };
            thermostats.push(thermostat);
        }
    }
    return Promise.resolve(thermostats);
}

function averageTemperature(thermostats) {
    const sum = thermostats
        .map((thermostat) => thermostat.temp)
        .reduce(((total,currentValue) =>  total + currentValue), 0);

    return Promise.resolve(sum / thermostats.length);
}

function loginAndFetch() {
    return new Promise((resolve, reject) => {
        nest.login(USERNAME, PASSWORD, function (err) {
            if (err) {
                reject(err);
            } else {
                nest.fetchStatus(function (data) {
                    resolve(data);
                });
            }
        });
    });
}

function getThermostats() {
    return loginAndFetch()
        .then(listThermostats);
}

function getHouseTemperature() {
    return getThermostats()
        .then(averageTemperature);
}

module.exports = {
    // Returns objects representing each thermostat in the house
    getThermostats,
    // Returns the current average temperature of the house.
    getHouseTemperature
};