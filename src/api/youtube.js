/**
 * Provides an interface to youtube.
 */
"use strict";

const YouTube = require('youtube-node');

const YOUTUBE_PREFACE = 'https://www.youtube.com/watch?v=';

const configModule = require('../util/config');

configModule.requireConfigKey('youtube_key', 'Please enter a YouTube key: ');

const config = configModule.getConfig();

const KEY = config.youtube_key;

function searchFirstVideo(query) {
    return new Promise((resolve, reject) => {
        const youTube = new YouTube();

        youTube.setKey(KEY);

        youTube.search(query, 1, function(error, result) {
            if (error) {
                console.error(error);
                reject(error);
            } else if (!result.items || result.items.length === 0) {
                console.error('No results in search');
                reject('No results in search');
            } else {
                const {videoId} = result.items[0].id;

                resolve({
                    url: YOUTUBE_PREFACE + videoId
                });
            }
        });
    });
}

module.exports = {
    searchFirstVideo
};