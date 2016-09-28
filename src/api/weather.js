/**
 * Retrieves the weather
 */
"use strict";

const http = require('http');
const querystring = require('querystring');
const configModule = require('../util/config');

configModule.requireConfigKey('weather_client_id', 'Please enter a client ID for Aeris: ');
configModule.requireConfigKey('weather_client_secret', 'Please enter a client secret for Aeris: ');

const config = configModule.getConfig();

const CLIENT_ID = config.weather_client_id;
const CLIENT_SECRET = config.weather_client_secret;

const queryParams = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
};

const options = {
    host: 'api.aerisapi.com',
    path: '/observations/95133?' + querystring.stringify(queryParams)
};

/**
 * Retrieves new weather from Aeris.
 * @returns {Promise}
 */
function getNewWeather() {
    return new Promise((resolve, reject) => {
        http.get(options, function(response) {
            // Continuously update stream with data
            let body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {
                // Data reception is done, do whatever with it!
                var json = JSON.parse(body);
                if (!body || !json || !json.success || json.error) {
                    reject(json && json.error);
                } else {
                    const {ob} = json.response;
                    resolve({
                        temp: ob.tempF,
                        weather: ob.weather,
                        raw: ob
                    });
                }
            });
        });

    });
}

module.exports = {
    getNewWeather
};
