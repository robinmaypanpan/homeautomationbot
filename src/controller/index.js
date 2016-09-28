/**
 * Starts up all of the response controllers to respond to static messaging.
 */
"use strict";
const consolidatedModules = [
    require('./ConfigController'),
    require('./SubscriptionController'),
    require('./UserController'),
    require('./NestController'),
    require('./HueController'),
    require('./ReminderController'),
    require('./StevenUniverseKaraoke'),
    require('./ThanksController'),
    require('./GiphyController'),
    require('./YoutubeController'),
    require('./DieRoller')
];

const HelpController = require('./HelpController')(consolidatedModules);
const friendUtil = require('../util/friends');

function startResponseControllers(tg) {
    tg.before(($, callback) => {
        friendUtil.validateMessage($)
            .then((result) => {
                callback(result)
            })
            .catch((err) => console.error(err));
    });

    let router = tg.router;

    consolidatedModules.forEach((module) => {
        if (!module.commands || !module.controller) {
            throw new Error('Module ' + (module.help && module.help.heading) + ' incorrectly setup');
        }
        router.when(module.commands, new module.controller());
    });

    router.when([
        '/help',
        '/h',
        '/?'
    ], new HelpController());
}

module.exports = startResponseControllers;