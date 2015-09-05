define([
    'phaser',
    'phaser-transition',
    'states/menu',
    'states/play',
    'states/win',
    'states/die'
], function (Phaser, PhaserState, Menu, Play, Win, Die) { 
    'use strict';

    function Game() {    
        console.log('Making the Game');    
    }
    
    Game.prototype = {
        constructor: Game,

        start: function() {
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, '', { 
                preload: this.preload, 
                create: this.create,
                init: this.init
            });

        },

        init: function () {
            this.game.stateTransition = this.game.plugins.add(Phaser.Plugin.StateTransition);

            this.game.stateTransition.configure({
                duration: Phaser.Timer.SECOND * 0.8,
                ease: Phaser.Easing.Exponential.InOut,
                properties: {
                    alpha: 0,
                    scale: {
                        x: 1.4,
                        y: 1.4
                    }
                }
            });
        },

        preload: function() {
            this.game.load.tilemap('Map1', 'assets/maps/test-map-1.json', null, Phaser.Tilemap.TILED_JSON);
            this.game.load.tilemap('Map2', 'assets/maps/test-map-2.json', null, Phaser.Tilemap.TILED_JSON);
            
            this.game.load.image('Sci-Fi-Tiles_A2', 'assets/tilesets/Sci-Fi-Tiles_A2.png');
            this.game.load.image('Sci-Fi-Tiles_A4', 'assets/tilesets/Sci-Fi-Tiles_A4.png');
            this.game.load.image('Sci-Fi-Tiles_A5', 'assets/tilesets/Sci-Fi-Tiles_A5.png');
            this.game.load.image('Sci-Fi-Tiles_B',  'assets/tilesets/Sci-Fi-Tiles_B.png');
            this.game.load.image('Sci-Fi-Tiles_C',  'assets/tilesets/Sci-Fi-Tiles_C.png');
            this.game.load.image('Sci-Fi-Tiles_D',  'assets/tilesets/Sci-Fi-Tiles_D.png');
            this.game.load.image('Sci-Fi-Tiles_E',  'assets/tilesets/Sci-Fi-Tiles_E.png');
            this.game.load.image('platformertiles',  'assets/tilesets/platformertiles.png');
            this.game.load.image('cave',  'assets/tilesets/cave_32.png');
            
            // HUD
            this.game.load.image('health-bar-cap-left', 'assets/hud/health-bar-cap-left.png');
            this.game.load.image('health-bar-middle', 'assets/hud/health-bar-middle.png');
            this.game.load.image('health-bar-cap-right', 'assets/hud/health-bar-cap-right.png');
            this.game.load.image('health-bar-fill', 'assets/hud/health-bar-fill.png');

            this.game.load.spritesheet('player', 'assets/sprites/player.png', 32, 32, 2);
            this.game.load.spritesheet('enemy', 'assets/sprites/enemy.png', 32, 32, 2);
            this.game.load.spritesheet('villager', 'assets/sprites/villager.png', 24, 24, 1);
            this.game.load.spritesheet('platform', 'assets/sprites/platform.png', 96, 8, 1);
            this.game.load.spritesheet('sword', 'assets/sprites/sword.png', 32, 7, 2);
            this.game.load.spritesheet('arrow', 'assets/sprites/arrow.png', 32, 7, 2);
            this.game.load.spritesheet('sword-swipe', 'assets/sprites/sword-swipe.png', 60, 76, 10);
            
            // Power-ups
            this.game.load.spritesheet('health-powerup', 'assets/sprites/health-powerup.png', 16, 16, 5);
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