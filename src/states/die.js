define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game, dieText, dieTimeoutText, openTime, time, totalTimeout, timeRemaining;

    return {
        // Intro
        init: function () {
            // Shortcut variables.
            game = this.game;
        },

        update: function () {
            timeRemaining = totalTimeout - (game.time.now - openTime);
            if(timeRemaining < 0) timeRemaining = 0;
            dieTimeoutText.text = 'Restart in ' + Math.round(timeRemaining/1000);
        },
        
        // Main
        create: function () {
            openTime = game.time.now;
            totalTimeout = 3000;

            dieText = game.add.text(game.width / 2, game.height / 2, 'You died :(', {align: 'center', fill: '#ff0000'});
            dieText.anchor.set(0.5);

            dieTimeoutText = game.add.text(game.width / 2, (game.height / 2) + 50, '', {align: 'center', fill: '#ff0000'});
            dieTimeoutText.anchor.set(0.5);

            game.input.keyboard.onPressCallback = function () {
                if(timeRemaining) return;
                game.input.keyboard.onPressCallback = null;
                this.game.state.start('Play');
            };
            // Gamepad input setup
            game.input.gamepad.start();
            game.input.gamepad.pad1.onDownCallback = function (buttonCode, value) {
                if(timeRemaining) return;
                this.game.state.start('Play');
            };
        }
    };
});