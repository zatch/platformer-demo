define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game, dieText;

    return {
        // Intro
        init: function () {
            // Shortcut variables.
            game = this.game;
        },
        
        // Main
        create: function () {
            dieText = game.add.text(game.width / 2, game.height / 2, 'You died :(', {align: 'center', fill: '#ff0000'});
            dieText.anchor.set(0.5);
        }
    };
});