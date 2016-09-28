/**
 * Returns a youtube video that matches the search query.
 */
"use strict";

const Telegram = require('telegram-node-bot');
const {TelegramBaseController} = Telegram;

const youtubeApi = require('../api/youtube');

class YoutubeController extends TelegramBaseController {
    handle($) {
        youtubeApi.searchFirstVideo($.query)
            .then((result) => {
                $.sendMessage(result.url);
            }).catch((err) => {
                console.error(err);
                $.sendMessage("Um. Guys? I think I saw something in the warp tubes.");
            });
    }

}

module.exports = {
    controller: YoutubeController,
    commands: [
        '/youtube',
        '/youTube',
        '/YouTube'
    ],
    help: {
        heading: 'Fun',
        lines: [
            '/youtube [search] - Search youtube for something'
        ]
    }
};