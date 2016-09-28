/**
 * Utilities for accessing friends.
 */
"use strict";

const databaseApi = require('../api/database');

function listFriends() {
    return databaseApi.getData('friend');
}

function checkForAnyFriends() {
    return databaseApi.getData('friend')
        .then((friendsInDB) => {
            return friendsInDB && friendsInDB.length > 0;
        });
}

function doesFriendMatch(friendA, friendB) {
    if (friendA.queryName && friendB.queryName) {
        return friendA.queryName === friendB.queryName;
    } else if (friendA.queryName && !friendB.queryName) {
        const {queryName: queryNameA} = friendA;
        return friendB.username === queryNameA ||
            friendB.firstName === queryNameA ||
            friendB.first_name === queryNameA;
    } else if (!friendA.queryName && friendB.queryName) {
        const {queryName: queryNameB} = friendB;
        return friendA.username === queryNameB ||
                friendA.firstName == queryNameB ||
                friendA.first_name === queryNameB;
    } else if (!friendA.queryName && !friendB.queryName) {
        return friendA.id === friendB.id;
    }
}

function checkForFriendship(friendsToCheck) {
    if (typeof friendsToCheck !== 'array' && !friendsToCheck.length) {
        friendsToCheck = [friendsToCheck];
    }
    return databaseApi.getData('friend')
        .then((friendsInDB) => {
            return friendsToCheck.map((friendToCheck) => {
                return friendsInDB && friendsInDB.length > 0 &&
                    friendsInDB.find((friendInDB) => {
                        return doesFriendMatch(friendToCheck, friendInDB.data);
                    });
            });
        });
}

function removeFriend(friend) {
    const friendObject = {
        queryName: friend.trim()
    };
    console.log('Removing friend object ' + JSON.stringify(friendObject));
    return checkForFriendship(friendObject)
        .then((friendsInDB) => {
            console.log('friendsInDB: ' + JSON.stringify(friendsInDB));
            if (!friendsInDB || !friendsInDB.length || !friendsInDB[0]) {
                return Promise.resolve({
                    friendNotFound: true,
                    name: friend
                });
            } else {
                const friendToRemove = friendsInDB[0];
                return databaseApi.removeData(friendToRemove)
                    .then(() => {
                        const {data} = friendToRemove;
                        return {
                            removedFriend: true,
                            name: data.username || data.queryName
                        };
                    });
            }
        });
}

function addFriend(friend) {
    let friendObject = friend;
    if (typeof friend === 'string') {
        friendObject = {
            queryName: friend
        }
    } else {
        friendObject = {
            id: friend.id,
            username: friend.username,
            firstName: friend.firstName,
            lastName: friend.lastName
        };
    }
    return checkForFriendship(friendObject)
        .then((results) => {
            if (!results[0]) {
                return databaseApi.writeData('friend', friendObject)
                    .then(() => {
                        return {
                            addedFriend: true,
                            name: friendObject.queryName || friendObject.username
                        };
                    });
            } else {
                return Promise.resolve({
                    alreadyFriends: true,
                    name: friendObject.queryName || friendObject.username
                });
            }
        });
}

function addChat(chat, from, api) {
    const friendsToConsider = [{
        id: chat.id,
        username: chat.title
    },
    {
        id: from.id,
        username: from.username,
        firstName: from.firstName,
        lastName: from.lastName
    }];
    return api.getChatAdministrators(chat.id)
        .then((admins) => {
            // Add all of the admins to the list as well.
            admins.forEach((admin) => {
                const {user} = admin;
                const newFriend = {
                    id: user.id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName
                };
                friendsToConsider.push(newFriend)
            });

            return checkForFriendship(friendsToConsider)
                .then((friendsInDB) => {
                    const responses = friendsToConsider
                        .map((friend, index) => {
                            const friendInDB = friendsInDB[index];
                            return {
                                addedFriend: !friendInDB,
                                alreadyFriends: !!friendInDB,
                                name: friend.queryName || friend.username || friend.firstName
                            };
                        });
                    const newFriends = friendsToConsider
                        .filter((friend, index) => !friendsInDB[index]);
                    return databaseApi.writeMultiData('friend', newFriends)
                        .then(() => responses);
                });
        })
}

function validateMessage($) {
    const {message: {from, chat}} = $;
    const fromObject = {
        id: from.id,
        username: from.username,
        firstName: from.firstName,
        lastName: from.lastName
    };
    const chatObject = {
        id: chat.id
    };
    return listFriends()
        .then((friends) => {
            const matchingFriend = friends.find((friend) => {
                return doesFriendMatch(friend.data, fromObject) || doesFriendMatch(friend.data, chatObject);
            });

            if (!matchingFriend) {
                return Promise.resolve(false);
            } else if (matchingFriend.data.queryName) {
                // Replace matching friends with better data.
                return Promise.all([
                    databaseApi.removeData(matchingFriend),
                    databaseApi.writeData('friend', fromObject)
                ]).then(() => true);
            } else {
                return Promise.resolve(true);
            }
        });
}


module.exports = {
    checkForAnyFriends,
    checkForFriendship,
    addFriend,
    addChat,
    removeFriend,
    validateMessage,
    listFriends
};