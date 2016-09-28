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
    '/flipCoin': 'flipCoin',
    '/coin': 'flipCoin',
    '/magic8ball': 'eightBall',
    '/8ball': 'eightBall',
    '/magic8Ball': 'eightBall'
};

const Roll = require('roll');
const roll = new Roll();

const eightBallAnswers = [
    'It is certain',
    'It is decidedly so',
    'Without a doubt',
    'Yes, definitely',
    'You may rely on it',
    'As I see it, yes',
    'Most likely',
    'Outlook good',
    'Yes',
    'Signs point to yes',
    'Reply hazy try again',
    'Ask again later',
    'Better not tell you now',
    'Cannot predict now',
    'Concentrate and ask again',
    "Don't count on it",
    'My reply is no',
    'My sources say no',
    'Outlook not so good',
    'Very doubtful'
];

const coinAnswers = [
    'Heads',
    'Tails'
];

function pickRandomAnswer(answers) {
    const value = Math.floor(Math.random() * answers.length);
    const answer = answers[value];
    return answer;

}

class DieRoller extends TelegramBaseController {
    eightBall($) {
        const answer = pickRandomAnswer(eightBallAnswers);
        $.sendMessage(answer);
    }

    flipCoin($) {
        const answer = pickRandomAnswer(coinAnswers);
        $.sendMessage(answer);
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
            '/coin - Returns heads or tails',
            '/roll [die formula] - Rolls the indicated die formula',
            '/8ball - Shakes the magic 8 ball'
        ]
    }
};