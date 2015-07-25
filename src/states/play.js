define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game;

    return {
        // Intro
        init: function () {
            // Shortcut variables.
            game = this.game;
        },

        preload: function () {},
        loadUpdate: function () {},
        loadRender: function () {},
        
        // Main
        create: function () {
            // Create map.
            var map = this.game.add.tilemap('Map1');
            
            // Add images to map.
            map.addTilesetImage('Sci-Fi-Tiles_A2', 'Sci-Fi-Tiles_A2');
            map.addTilesetImage('Sci-Fi-Tiles_A4', 'Sci-Fi-Tiles_A4');
            map.addTilesetImage('Sci-Fi-Tiles_A5', 'Sci-Fi-Tiles_A5');
            map.addTilesetImage('Sci-Fi-Tiles_B', 'Sci-Fi-Tiles_B');
            map.addTilesetImage('Sci-Fi-Tiles_C', 'Sci-Fi-Tiles_C');
            map.addTilesetImage('Sci-Fi-Tiles_D', 'Sci-Fi-Tiles_D');
            map.addTilesetImage('Sci-Fi-Tiles_E', 'Sci-Fi-Tiles_E');
            
            // Add layers to map.
            map.createLayer('backdrop')
               .resizeWorld(); // Base world size on the backdrop.
            map.createLayer('background-decoration');
            map.createLayer('foreground-structure');
            // Insert player here?
            map.createLayer('foreground-decoration');
            
            // Physics?
            
            // Assign impasasble tiles for collision.
            map.setCollision([48,49,50,51,64,65,66,67], true, 'foreground-structure');
        },
        update: function () {},
        preRender: function () {},
        render: function () {},
        resize: function () {},

        // Pause
        paused: function () {},
        pauseUpdate: function () {},
        resumed: function () {},
        
        // Outro
        shutdown: function () {}
    };
});