/**
 * Interface for our local database.  Since this is pretty simple, we can just open and close
 * a json file for now.
 */
"use strict";

const Datastore = require('nedb');
const db = new Datastore({ filename: './datastore' });

let isLoaded = false;

function loadDatabase() {
    if (isLoaded) {
        return Promise.resolve();
    } else {
        return new Promise((resolve, reject) => {
            db.loadDatabase(function (err) {    // Callback is optional
                if (err) {
                    reject(err);
                } else {
                    isLoaded = true;
                    resolve();
                }
            });
        });
    }
}

function _getData(type) {
    return function() {
        return new Promise((resolve, reject) => {
            db.find({type}, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
}

function _writeData(type, data) {
    return function() {
        return new Promise((resolve, reject) => {
            const dataToInsert = {
                type,
                data,
                timestamp: Date.now()
            };

            const callback = (err, newDoc) => {
                if (err) reject(err);
                else resolve(newDoc);
            };

            db.insert(dataToInsert, callback);
        });
    }
}

function _writeMultiData(type, dataArray) {
    const timestamp = Date.now();
    const dataToWrite = dataArray.map((data) => {
        return {
            type,
            data,
            timestamp
        };
    });
    return function() {
        return new Promise((resolve, reject) => {
            const callback = (err, newDoc) => {
                if (err) reject(err);
                else resolve(newDoc);
            };

            db.insert(dataToWrite, callback);
        });
    }
}

function _clearData(type) {
    return function() {
        return new Promise((resolve, reject) => {
            db.remove({type}, {multi: true}, function (err, numRemoved) {
                if (err) reject(err);
                else resolve(numRemoved);
            });
        });
    }
}

function _removeDataById(id) {
    return function() {
        return new Promise((resolve, reject) => {
            db.remove({_id: id}, {}, (err, numRemoved) => {
                if (err) reject(err);
                else resolve(numRemoved);
            });
        });
    }
}

function writeData(type, data) {
    return loadDatabase()
        .then(_writeData(type, data));
}

function writeMultiData(type, dataArray) {
    return loadDatabase()
        .then(_writeMultiData(type, dataArray));
}

function getData(type) {
    return loadDatabase()
        .then(_getData(type));
}

function clearData(type) {
    return loadDatabase()
        .then(_clearData(type));
}

function removeData(data) {
    return loadDatabase()
        .then(_removeDataById(data._id))
}

function pickOutJustData(object) {
    if (object.length && object.length > 0) {
        if (object.map) {
            return Promise.resolve(object.map((it) => it.data));
        } else {
            return Promise.resolve(object[0].data);
        }
    } else {
        return Promise.resolve(object.data);
    }
}

function pickFirstResult(object) {
    return Promise.resolve(object && object.length > 0 ? object[0] : undefined);
}

module.exports = {
    getData,
    writeData,
    writeMultiData,
    clearData,
    removeData,
    pickOutJustData,
    pickFirstResult
};