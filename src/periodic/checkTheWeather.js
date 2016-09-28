/**
 * Periodically checks the weather.
 */
"use strict";

const weatherUtil = require('../util/weatherRetriever');

function checkTheWeather() {
    console.log('Checking the weather');
    weatherUtil.getAndUpdateWeather()
        .catch((err) => console.error(err));
}

module.exports = checkTheWeather;