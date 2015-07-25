define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game, winText;

    return {
        // Intro
        init: function () {
            // Shortcut variables.
            game = this.game;
        },
        
        // Main
        create: function () {
            winText = game.add.text(game.width / 2, game.height / 2, 'You Win!', {align: 'center', fill: '#00ff00'});
            winText.anchor.set(0.5);
        }
    };
});