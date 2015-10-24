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

            // When in full-screen mode, take up as much of the screen as 
            // possible while maintaining game proportions.
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        },

        create: function () {
            menuText = game.add.text(game.width / 2, game.height / 2, 'Press "F" for fullscreen.\nPress any other key/button to play', {align: 'center', fill: '#fff'});
            menuText.anchor.set(0.5);

            game.input.keyboard.onPressCallback = function (key, event) {
                switch(key) {
                    // Reserved keys (that won't start the game.)
                    case 'f':
                    case 'F':
                        if(game.scale.isFullScreen) {
                            game.scale.stopFullScreen();
                        } else {
                            game.scale.startFullScreen();
                        }
                        break;

                    // "Any other key" starts the game.
                    default:
                        game.input.keyboard.onPressCallback = null;
                        this.game.state.start('Play');
                }
            };
            // Gamepad input setup
            game.input.gamepad.start();
            game.input.gamepad.pad1.onDownCallback = function (buttonCode, value) {
                this.game.state.start('Play');
            };
        }
    };
});