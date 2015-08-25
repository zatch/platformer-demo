(function () {
    'use strict';

    requirejs.config({
        baseUrl: "src/",
        
        paths: {
            //  Edit the below path to point to where-ever you have placed the phaser.min.js file
            phaser: 'lib/phaser/build/phaser.min',
            'phaser-transition': 'lib/phaser-state-transition-plugin/dist/phaser-state-transition-plugin.min'
        },

        shim: {
            'phaser': {
                exports: 'Phaser'
            },
            'phaser-transition': {
                deps: ['phaser']
            }
        }
    });
 
    require(['phaser', 'game'], function (Phaser, Game) {
        var game = new Game();
        game.start();
    });
}());