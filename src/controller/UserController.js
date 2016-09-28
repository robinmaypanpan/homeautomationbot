/**
 *
 */
"use strict";

const friendUtil = require('../util/friends');

const Telegram = require('telegram-node-bot');
const {TelegramBaseController} = Telegram;

const routes = {
    '/introduce': 'introduce',
    '/removeFriend': 'removeFriend',
    '/removefriend': 'removeFriend',
    '/addfriend': 'introduce',
    '/addFriend': 'introduce',
    '/addChat': 'addChat',
    '/addchat': 'addChat',
    '/friends': 'listFriends'
};

class UserController extends TelegramBaseController {
    introduce($) {
        const {query, message} = $;
        friendUtil.checkForAnyFriends()
            .then((hasFriends) => {
                if (hasFriends && typeof query === 'string') {
                    return friendUtil.addFriend(query.trim());
                } else if (hasFriends) {
                    // We will not allow strangers to speak to us once we've got at least one friend, so this is someone in the circle.
                    return "You should give me someone to introduce me to!"
                } else {
                    return friendUtil.addFriend(message.from);
                }
            })
            .then((result) => {
                if (typeof result === 'string') {
                    $.sendMessage(result);
                } else if (result) {
                    if (result.addedFriend) {
                        $.sendMessage(result.name + ' has been added to my circle of friends.');
                    } else if (result.alreadyFriends) {
                        $.sendMessage(result.name + ' was already my friend!');
                    }
                } else {
                    $.sendMessage('Sorry, something really weird happened.');
                }
            })
            .catch((err) => {
                console.error(err);
                $.sendMessage('I could not figure out who my friends are. :(');
            });
    }

    // Add a chatroom and every member of the chatroom.
    addChat($) {
        const chat = $.message.chat;
        friendUtil.addChat(chat, $.message.from, $.api)
            .then((result) => {
                if (typeof result === 'string') {
                    $.sendMessage(result);
                } else if (typeof result === 'array' || result.length) {
                    const messages = result.map((it) => {
                        if (it.addedFriend) {
                            return it.name + ' has been added to my circle of friends.';
                        } else if (it.alreadyFriends) {
                            return it.name + ' was already my friend!';
                        }
                    });
                    $.sendMessage(messages.join('\n'));
                } else {
                    $.sendMessage('Sorry, something really weird happened.');
                }
            })
            .catch((err) => {
                console.error(err);
                $.sendMessage('I could not figure out who my friends are. :(');
            });
    }

    removeFriend($) {
        if (typeof $.query === 'string') {
            console.log('Removing friend ' + $.query);
            friendUtil.removeFriend($.query)
                .then((result) => {
                    if (result.removedFriend) {
                        $.sendMessage(result.name + ' has been removed');
                    } else if (result.friendNotFound) {
                        $.sendMessage("I'm not friends with " + result.name);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    $.sendMessage('I could not figure out who my friends are. :(');
                });
        } else {
            $.sendMessage("You need to give me the name of someone to remove!");
        }
    }

    listFriends($) {
        friendUtil.listFriends()
            .then((friends) => {
                const friendNames = friends
                    .map((friend) => friend.data.username || friend.data.queryName)
                    .join(', ');
                $.sendMessage('My friends are ' + friendNames);
            })
            .catch((err) => {
                console.error(err);
                $.sendMessage('I could not figure out who my friends are. :(');
            });
    }

    get routes() {
        return routes;
    }

}

module.exports = {
    controller: UserController,
    commands: Object.keys(routes),
    help: {
        heading: 'Bot Control',
        lines: [
            '/friends - List friends that this bot will talk to.',
            '/introduce [username] - Introduce someone to the bot!',
            '/addChat - Introduce everyone in this chat to the bot, as well as the chatroom itself!',
            '/removeFriend - Remove someone from the circle of friends.'
        ]
    }
};
