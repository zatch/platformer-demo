define([
    'phaser',
    'states/menu',
    'states/play',
    'states/win',
    'states/die'
], function (Phaser, Menu, Play, Win, Die) { 
    'use strict';

    function Game() {    
        console.log('Making the Game');    
    }
    
    Game.prototype = {
        constructor: Game,

        start: function() {
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, '', { 
                preload: this.preload, 
                create: this.create 
            });
        },

        preload: function() {
            this.game.load.image('logo', 'assets/phaser.png');
        },
        
        create: function() {
            // Add states to our game.
            this.game.state.add('Menu', Menu);
            this.game.state.add('Play', Play);
            this.game.state.add('Win', Win);
            this.game.state.add('Die', Die);

            // Now that everything is loaded, show the menu.
            this.game.state.start('Menu');
        }
    };
    
    return Game;
});