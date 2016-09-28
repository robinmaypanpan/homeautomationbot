/**
 * Returns a giphy that matches the query
 */
"use strict";

const Telegram = require('telegram-node-bot');
const {TelegramBaseController} = Telegram;

var giphyApi = require('giphy-api')();

const routes = {
    '/sticker': 'sticker',
    '/giphy': 'giphy'
};

class GiphyController extends TelegramBaseController {
    sticker($) {
        const {query} = $;
        giphyApi.search({
            q: query,
            api: 'stickers'
        }).then((result) => {
            const {data} = result;
            $.sendMessage(data[0].url);
        }).catch((err) => {
            console.error(err);
            $.sendMessage("Something broke.");
        });
    }

    giphy($) {
        const {query} = $;
        giphyApi.random({
            tag: query,
            rating: 'pg',
            fmt: 'json'
        }).then((result) => {
            const {data} = result;
            $.sendMessage(data.url);
        }).catch((err) => {
            console.error(err);
            $.sendMessage("Something broke.");
        });
    }

    get routes() {
        return routes;
    }
}

module.exports = {
    controller: GiphyController,
    commands: Object.keys(routes),
    help: {
        heading: 'Fun',
        lines: [
            '/giphy [search] - Search giphy for a gif that matches your search',
            '/sticker [search] - Seach giphy for a sticker'
        ]
    }
};