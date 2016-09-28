/**
 * Returns a youtube video of a steven universe song
 */
"use strict";

const Telegram = require('telegram-node-bot');
const {TelegramBaseController} = Telegram;

const youtubeApi = require('../api/youtube');

class StevenUniverseKaraoke extends TelegramBaseController {
    handle($) {
        youtubeApi.searchFirstVideo('Steven Universe song ' + $.query)
            .then((result) => {
                $.sendMessage(result.url);
            }).catch((err) => {
                console.error(err);
                $.sendMessage("Um. Guys? I think I saw something in the warp tubes.");
            });
    }

}

module.exports = {
    controller: StevenUniverseKaraoke,
    commands: [
        '/sing',
        '/song',
        '/singsu',
        '/stevenUniverse'
    ],
    help: {
        heading: 'Fun',
        lines: [
            '/song [search] - Search youtube for a Steven Universe song'
        ]
    }
};