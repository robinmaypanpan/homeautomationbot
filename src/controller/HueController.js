/**
 * Support modifications to the lights.
 */
"use strict";

const Telegram = require('telegram-node-bot');
const {TelegramBaseController} = Telegram;

const hueApi = require('../api/hue');

const routes = {
    '/lights': 'statusGetter',
    '/turnOn': 'turnOn',
    '/turnOff': 'turnOff',
    '/dim': 'dim',
    '/setColor': 'color',
    '/party': 'party',
    '/stopParty': 'stopParty',
    '/stopparty': 'stopParty'
};

class HueController extends TelegramBaseController {
    statusGetter($) {
        hueApi.getGroups()
            .then((groups) => {
                const groupReports = groups
                    .filter((group) => group.id != '0')
                    .map((group) => {
                        const state = group.state.any_on ? 'on' : 'off';
                        return group.name + ': ' + state;
                    });

                $.sendMessage(groupReports.join('\n'));
            })
            .catch((err) => {
                console.error(err);
                $.sendMessage("I coulnd't talk to the lights!");
            });
    }

    turnOn($) {
        const location = $.query.trim();
        hueApi.setGroupState(location, {on: true})
            .then(() => $.sendMessage("The lights are on!"))
            .catch((err) => {
                $.sendMessage("I couldn't turn those lights on.");
            });
    }

    turnOff($) {
        const location = $.query.trim();
        hueApi.setGroupState(location, {off: true})
            .then(() => $.sendMessage("Lights deactivated!"))
            .catch((err) => {
                console.error(err);
                $.sendMessage("I couldn't turn those lights off.");
            });
    }

    dim($) {
        const trimmedQuery = $.query.trim();
        const lastSpace = trimmedQuery.lastIndexOf(' ');
        const location = trimmedQuery.slice(0, lastSpace);
        const brightness = trimmedQuery.slice(lastSpace + 1);

        hueApi.setGroupState(location, {brightness})
            .then(() => $.sendMessage("Lights dimmed!"))
            .catch((err) => {
                console.error(err);
                $.sendMessage("I couldn't dim those lights.");
            });
    }

    party($){
        // /party family room underwater slow
        // /party family room underwater
        // /party family room
        // /party kitchen
        // /party kitchen underwater

        const words = $.query.trim().split(' ');

        let interval;

        let location = 'family room';
        let preset = 'trans';
        let speed = 'medium';

        let presets = [
            'trans',
            'underwater',
            'rave',
            'thunderstorm'
        ];

        switch (words.length) {
            case 1:
                location = words[0];
                break;
            case 2:
                if (presets.indexOf(words[1]) > -1) {
                    location = words[0];
                    preset = words[1];
                } else {
                    location = words[0] + ' ' + words[1];
                }
                break;
            case 3:
                if (presets.indexOf(words[1]) > -1) {
                    location = words[0];
                    preset = words[1];
                    speed = words[2];
                } else {
                    if (presets.indexOf(words[2]) > -1) {
                        // 3 is preset
                        // 1-2 is location
                        location = words[0] + ' ' + words[1];
                        preset = words[2];
                    }
                }
                break;
            case 4:
                location = words[0] + ' ' + words[1];
                preset = words[2];
                speed = words[3];
                break;
            default:
                return;
                break;
        }

        switch (speed) {
            case 'slow':
                interval = 3000;
                break;
            case 'medium':
                interval = 1200;
                break;
            case 'fast':
                interval = 600;
            case 'hyper':
                interval = 200;
                break;
        }

        hueApi.party(location, preset, interval)
            .then(() => $.sendMessage("Party time in the " + location + "!"))
            .catch((err) => {
                console.error(err);
                $.sendMessage("I couldn't make a party happen. Boo.");
            });
    }

    stopParty($){
        const location = $.query.trim();

        hueApi.stopParty(location);

        hueApi.setGroupState(location, {on: true, rgb: [30, 64, 32], brightness:0})
            .then(() => $.sendMessage("You don't have to go home, but you can't stay here."))
            .catch((err) => {
                console.error(err);
                $.sendMessage("I couldn't change those lights.");
            });
    }

    color($) {
        const trimmedQuery = $.query.trim();
        const lastSpace = trimmedQuery.lastIndexOf(' ');
        const location = trimmedQuery.slice(0, lastSpace);
        const color = trimmedQuery.slice(lastSpace + 1);

        const {colorList} = hueApi;

        const myColorSetting = colorList
            .find((colorSettings) => colorSettings.name.toLowerCase() === color.toLowerCase());

        if (myColorSetting) {
            hueApi.setGroupState(location, myColorSetting)
                .then(() => $.sendMessage("Lights updated!"))
                .catch((err) => {
                    console.error(err);
                    $.sendMessage("I couldn't change those lights.");
                });
        } else {
            $.sendMessage("I don't know what that color is.");
        }
    }

    get routes() {
        return routes;
    }
}

module.exports = {
    controller: HueController,
    commands: Object.keys(routes),
    help: {
        heading: 'Lighting',
        lines: [
            '/lights - Get a list of the lighting groups in the house.',
            '/turnOn [Room] - Turn on the lights in the indicated room',
            '/turnOff [Room] - Turn off the lights in the indicated room',
            '/dim [Room] [Brightness] - Set the brightness to the indicated percentage',
            '/setColor [Room] [Color] - Set the indicated room to the appropriate color',
            '/party [Room] [Preset] [Speed]'
        ]
    }
};