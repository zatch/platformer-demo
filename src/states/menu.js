define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game, menuText;

    return {
        // Intro
        init: function () {
            game = this.game;
        },

        create: function () {
            menuText = game.add.text(game.width / 2, game.height / 2, 'Press Any Key to Play', {align: 'center', fill: '#fff'});
            menuText.anchor.set(0.5);

            game.input.keyboard.onPressCallback = function () {
                game.input.keyboard.onPressCallback = null;
                this.game.state.start('Play');
            };
            // Gamepad input setup
            game.input.gamepad.start();
            game.input.gamepad.pad1.onDownCallback = function (buttonCode, value) {
                this.game.state.start('Play');
            };
        }
    };
});