/**
 * Interface to the hue lighting API.
 */
"use strict";

const hue = require('node-hue-api');
const {HueApi} = hue;
const configModule = require('../util/config');

configModule.requireConfigKey('hue_bridge_id', 'Please enter a Bridge ID for Hue: ');
configModule.requireConfigKey('hue_user_description', 'Please enter a User Description for Hue: ');
configModule.requireConfigKey('hue_username', 'Please enter a Username for Hue: ');

const colorList = [
    {
        name: 'Red',
        rgb: [255, 0, 0],
        brightness: 80
    },
    {
        name: 'Blue',
        brightness:15,
        rgb: [0,0,0]
    },
    {
        name: 'Green',
        rgb: [51, 204, 51],
        brightness: 25
    },
    {
        name: 'Yellow',
        rgb: [255,255,0]
    },
    {
        name: 'White',
        rgb: [255,255,255]
    },
    {
        name: 'Purple',
        rgb: [92, 0, 153]
    },
    {
        name: 'Black',
        off: true,
        brightness:0,
        rgb: [0,0,0]
    },
    {
        name: 'Gray',
        rgb: [179, 179, 204],
        brightness: 10
    },
    {
        name: 'Orange',
        rgb: [255, 153, 0]
    },
    {
        name: 'Brown',
        rgb: [96, 64, 32],
        brightness:30
    }
];

// const presets = [
//     'trans',
//     'underwater',
//     'rave',
//     'thunderstorm'
// ];

const config = configModule.getConfig();

const constants = {
    bridgeId: config.hue_bridge_id,
    userDescription: config.hue_user_description,
    username: config.hue_username
};

let raveIntervals = {};

function findBridge() {
    return hue.nupnpSearch()
        .then((result) => {
            const bridge = result.find((bridge) => bridge.id === constants.bridgeId);
            return Promise.resolve(bridge);
        });
}

function buildLightStateFromUpdate(update) {
    const lightState = hue.lightState;

    let state = lightState.create();

    if (update.off) {
        state = state.on(false);
    } else if (update.on) {
        state = state.on(true);
    }

    if (update.brightness !== undefined) {
        state = state.brightness(update.brightness);
    }

    if (update.rgb) {
        state = state.rgb(update.rgb);
    }

    return state;
}

function getGroups() {
    return findBridge()
        .then((bridge) => {
            const api = new HueApi(bridge.ipaddress, constants.username);
            return api.groups();
        });
}

const presets = {
    thunderstorm: function(api, myGroup, groupName, interval) {
        const brightnessStates = [
            buildLightStateFromUpdate({on: true, rgb: [96, 96, 32], brightness: 100}),
            buildLightStateFromUpdate({on: true, rgb: [96, 96, 32], brightness: 30}),
            buildLightStateFromUpdate({on: true, rgb: [96, 96, 32], brightness: 10}),
            buildLightStateFromUpdate({on: true, rgb: [96, 64, 32], brightness: 0}),
            buildLightStateFromUpdate({off: true})
        ];

        function strike(lightId) {
            if (!lightId) {
                return;
            }
            
            let currentBrightness = 0;
                
            let strikeInterval = setInterval(function(){
                currentBrightness = currentBrightness + 1;

                if (currentBrightness > brightnessStates.length) {
                    clearInterval(strikeInterval);
                }

                api.setLightState(lightId, brightnessStates[currentBrightness]);       
            }, 50);
        }

        return function () {
            setGroupState(groupName, {on: true, rgb: [0, 0, 0], brightness: 0});
            let randomLight = Math.floor(Math.random() * (myGroup.lights.length + 4));

            strike(myGroup.lights[randomLight]);
        }
    },
    
    trans: function(api, myGroup, groupName, interval) {
        const brightnessStates = [
            buildLightStateFromUpdate({brightness: 0}),
            buildLightStateFromUpdate({brightness: 40}),
            buildLightStateFromUpdate({brightness: 20}),
            buildLightStateFromUpdate({brightness: 100}),
            buildLightStateFromUpdate({brightness: 30}),
            buildLightStateFromUpdate({brightness: 10}),
        ];

        const colorStates = [
            buildLightStateFromUpdate({rgb: [0,0,0]}),
            buildLightStateFromUpdate({rgb: [0,0,0]}),
            buildLightStateFromUpdate({rgb: [15,5,20]}),
            buildLightStateFromUpdate({rgb: [92, 0, 153]})
        ]

        var currentLight = 0;
        var currentColorState = 0;

        return function () {
            currentLight = currentLight + 1;
            
            if (currentLight > myGroup.lights.length) {
                currentLight = 0;
            }

            currentColorState = currentColorState + 1;
            
            if (currentColorState > colorStates.length) {
                currentColorState = 0;
            }

            api.setLightState(myGroup.lights[currentLight], colorStates[currentColorState]);

            myGroup.lights.forEach((lightId) => {
                let random1 = Math.floor(Math.random() * (brightnessStates.length + 1));
                api.setLightState(lightId, brightnessStates[random1]);
            })
        }
    },

    underwater: function(api, myGroup, groupName, interval) {
        const brightnessStates = [
            buildLightStateFromUpdate({brightness: 0}),
            buildLightStateFromUpdate({brightness: 40}),
            buildLightStateFromUpdate({brightness: 20}),
            buildLightStateFromUpdate({brightness: 30}),
            buildLightStateFromUpdate({brightness: 10}),
        ];

        const colorStates = [
            buildLightStateFromUpdate({rgb: [0,0,0]}),
            buildLightStateFromUpdate({rgb: [0,0,0]})
        ]

        var currentLight = 0;
        var currentColorState = 0;

        return function updateStates() {
            currentLight = currentLight + 1;
            
            if (currentLight > myGroup.lights.length) {
                currentLight = 0;
            }

            currentColorState = currentColorState + 1;
            
            if (currentColorState > colorStates.length) {
                currentColorState = 0;
            }

            api.setLightState(myGroup.lights[currentLight], colorStates[currentColorState]);

            myGroup.lights.forEach((lightId) => {
                let random1 = Math.floor(Math.random() * (brightnessStates.length + 1));
                api.setLightState(lightId, brightnessStates[random1]);
            })
        }
    },

    flaming: function(api, myGroup, groupName, interval) {
        const brightnessStates = [
            buildLightStateFromUpdate({rgb: [255,255,0], brightness: 40}),
            buildLightStateFromUpdate({rgb: [255, 0, 0], brightness: 20}),
            buildLightStateFromUpdate({rgb: [255, 153, 0], brightness: 60}),
            buildLightStateFromUpdate({brightness: 30}),
            buildLightStateFromUpdate({brightness: 0}),
        ];

        var currentLight = 0;
        var currentColorState = 0;

        return function () {
            currentLight = currentLight + 1;
            
            if (currentLight > myGroup.lights.length) {
                currentLight = 0;
            }

            currentColorState = currentColorState + 1;
            
            if (currentColorState > colorStates.length) {
                currentColorState = 0;
            }

            api.setLightState(myGroup.lights[currentLight], colorStates[currentColorState]);

            myGroup.lights.forEach((lightId) => {
                let random1 = Math.floor(Math.random() * (brightnessStates.length + 1));
                api.setLightState(lightId, brightnessStates[random1]);
            })
        }
    },

    rave: function(api, myGroup, groupName, interval) {
        const states = [
            buildLightStateFromUpdate({rgb: [0,0,0]}),
            buildLightStateFromUpdate({rgb: [255,255,255]}),
            buildLightStateFromUpdate({rgb: [92, 0, 153]}),
            buildLightStateFromUpdate({rgb: [51, 204, 51], brightness: 25}),
            buildLightStateFromUpdate({rgb: [255, 0, 0],brightness: 80}),
            buildLightStateFromUpdate({brightness: 0}),
            buildLightStateFromUpdate({brightness: 40}),
            buildLightStateFromUpdate({brightness: 80}),
            buildLightStateFromUpdate({brightness: 100})
        ]

        var current = 0;

        return function updateStates() {
            myGroup.lights.forEach((lightId) => {
                let random1 = Math.floor(Math.random() * (states.length + 1));
                api.setLightState(lightId, states[random1]);
            })
        }
    }
};

function party(groupName, preset, interval) {
    groupName = groupName.toLowerCase();

    if (raveIntervals[groupName]) {
        clearInterval(raveIntervals[groupName]);
        raveIntervals[groupName] = null;
    }

    setGroupState(groupName, {on: true, off: false});

    return findBridge().then((bridge) => {
        console.log(bridge);
        const api = new HueApi(bridge.ipaddress, constants.username);
        return api.groups()
            .then((groups) => {
                const myGroup = groups.find((group) => group.name.toLowerCase() === groupName.toLowerCase());

                if (myGroup) {
                    const api = new HueApi(bridge.ipaddress, constants.username);

                    const presetFunc = presets[preset];

                    let updateStates = presetFunc(api, myGroup, groupName, interval);

                    raveIntervals[groupName] = setInterval(updateStates, interval);

                    return Promise.resolve(true);
                } else {
                    return Promise.reject('No applicable group');
                }
            });
        });
}

function stopParty(groupName) {
    groupName = groupName.toLowerCase();

    if (raveIntervals[groupName]) {
        clearInterval(raveIntervals[groupName]);
        raveIntervals[groupName] = null;
    }
}

function setGroupState(groupName, update) {
    return findBridge()
        .then((bridge) => {
            const api = new HueApi(bridge.ipaddress, constants.username);
            return api.groups()
                .then((groups) => {
                    const myGroup = groups.find((group) => group.name.toLowerCase() === groupName.toLowerCase());

                    if (myGroup) {
                        const api = new HueApi(bridge.ipaddress, constants.username);
                        const lightState = buildLightStateFromUpdate(update);

                        if (!update.rgb) {
                            return api.setGroupLightState(myGroup.id, lightState);
                        } else {
                            const allDaPromises = myGroup.lights
                                .map((lightId) => api.setLightState(lightId, lightState));
                            return Promise.all(allDaPromises);
                        }
                    } else {
                        return Promise.reject('No applicable group');
                    }
                });
        });
}

module.exports = {
    setGroupState,
    getGroups,
    colorList,
    party,
    stopParty
    // underwater,
    // thunderstorm,
    // trans,
    // rave,
    // stopRave
};