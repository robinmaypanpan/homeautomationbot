/**
 *
 */
"use strict";

const http = require('http');
const configModule = require('../util/config');
const CryptoJS = require("crypto-js");
const urlencode = require('urlencode');

configModule.requireConfigKey('personality_forge_api_key', 'Please enter the api key for Personality Forge: ');
configModule.requireConfigKey('personality_forge_api_secret', 'Please enter the api secret for Personality Forge: ');

const config = configModule.getConfig();

const apiKey = config.personality_forge_api_key;
const api_secret = config.personality_forge_api_secret;

function chat($, messageText) {
    const messageObject = {
        "message": {
            "message": messageText,
            "chatBotID": 145624,
            "timestamp": Date.now()
        },
        "user": {
            "firstName": $.message.from._firstName,
            "lastName": $.message.from._lastName,
            "gender": "f",
            "externalID": $.message.from._id
        }
    };

    const messageJson = JSON.stringify(messageObject);

    const hash = CryptoJS.HmacSHA256(messageJson, api_secret);

    const options = {
        host: 'www.personalityforge.com',
        path: '/api/chat/?apiKey=' + apiKey + '&hash=' + hash + '&message=' + urlencode(messageJson)
    };

    return new Promise((resolve, reject) => {
        http.get(options, function(response) {
            // Continuously update stream with data
            let body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {
                // Data reception is done, do whatever with it!
                const json = JSON.parse(body);
                if (!body || !json || !json.success || json.errorMessage) {
                    reject(json && json.errorMessage);
                } else {
                    resolve(json.message.message);
                }
            });
        });
    });
}

module.exports = {
    chat
};