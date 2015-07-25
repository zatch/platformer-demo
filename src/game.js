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
            this.game.load.tilemap('Map1', 'assets/maps/test-map.json', null, Phaser.Tilemap.TILED_JSON);
            
            this.game.load.image('Sci-Fi-Tiles_A2', 'assets/tilesets/Sci-Fi-Tiles_A2.png');
            this.game.load.image('Sci-Fi-Tiles_A4', 'assets/tilesets/Sci-Fi-Tiles_A4.png');
            this.game.load.image('Sci-Fi-Tiles_A5', 'assets/tilesets/Sci-Fi-Tiles_A5.png');
            this.game.load.image('Sci-Fi-Tiles_B',  'assets/tilesets/Sci-Fi-Tiles_B.png');
            this.game.load.image('Sci-Fi-Tiles_C',  'assets/tilesets/Sci-Fi-Tiles_C.png');
            this.game.load.image('Sci-Fi-Tiles_D',  'assets/tilesets/Sci-Fi-Tiles_D.png');
            this.game.load.image('Sci-Fi-Tiles_E',  'assets/tilesets/Sci-Fi-Tiles_E.png');

            this.game.load.spritesheet('player', 'assets/sprites/player.png', 32, 32, 2);
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