/**
 * Rolls dice, flips coins, and does anything else deemed worthy of randomness!
 */
"use strict";

const Telegram = require('telegram-node-bot');
const {TelegramBaseController} = Telegram;

const routes = {
    '/rollDie': 'rollDie',
    '/rollADie': 'rollDie',
    '/roll': 'rollDie',
    '/flipCoin': 'flipCoin'
};

const Roll = require('roll');
const roll = new Roll();

class DieRoller extends TelegramBaseController {
    flipCoin($) {
        const value = Math.floor(Math.random() * 2);
        const coinSide = value === 1 ? 'Heads' : 'Tails';
        $.sendMessage(coinSide);
    }

    rollDie($) {
        let formula = $.query;
        if (typeof $.query !== 'string') {
            formula = '1d6';
        }
        formula = formula.trim();

        if (roll.validate(formula)) {
            const {result} = roll.roll(formula);
            $.sendMessage(result);
        } else {
            $.sendMessage("I don't know how to roll those dice. They look funny.");
        }
    }

    get routes() { return routes; }
}

module.exports = {
    controller: DieRoller,
    commands: Object.keys(routes),
    help: {
        heading: 'Fun',
        lines: [
            '/flipCoin - Returns heads or tails',
            '/roll [die formula] - Rolls the indicated die formula'
        ]
    }
};