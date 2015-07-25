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
            menuText = game.add.text(game.width / 2, game.height / 2, 'Press Space to Play', {align: 'center'});

            game.input.keyboard.onPressCallback = function () {
                game.state.start('Play');
            };
        }
    };
});