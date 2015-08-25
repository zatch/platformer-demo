define([
    'phaser',
    'player',
    'platform',
    'object-layer-helper'
], function (Phaser, Player, Platform, ObjectLayerHelper) { 
    'use strict';

    // Shortcuts
    var game, moveKeys, pad1, player, map, collisionLayer, platforms, exitDoor;

    return {
        // Intro
        init: function (mapName) {
            // Shortcut variables.
            game = this.game;

            // Set map name.
            map = mapName || 'Map1';
        },
        
        // Main
        create: function () {

            // Player set-up
            player = new Player(game, 144, 736);
            player.events.onOutOfBounds.add(this.playerOutOfBounds, this);

            // Create map.
            map = this.game.add.tilemap(map);
            
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
            collisionLayer = map.createLayer('foreground-structure');
            
            // Spawn point
            var spawnPoint = ObjectLayerHelper.createObjectByName(game, 'player_spawn', map, 'spawns');

            // Insert player here?
            game.add.existing(player);
            player.x = spawnPoint.x;
            player.y = spawnPoint.y;

            map.createLayer('foreground-decoration');

            // Physics engine set-up
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.physics.arcade.gravity.y = 1000;
            
            //  We check bounds collisions against all walls other than the bottom one
            game.physics.arcade.checkCollision.down = false;
            // Assign impasasble tiles for collision.
            map.setCollisionByExclusion([], true, 'foreground-structure');


            // Create win trigger
            exitDoor = ObjectLayerHelper.createObjectByName(game, 'door_exit', map, 'triggers');
            game.physics.enable(exitDoor);
            exitDoor.body.allowGravity = false;
            exitDoor.body.immovable = true;
            game.add.existing(exitDoor);

            // Platforms
            platforms = ObjectLayerHelper.createObjectsByType(game, 'platform', map, 'platforms', Platform);
            game.add.existing(platforms);
            platforms.callAll('start');

            // Keyboard input set-up
            moveKeys = game.input.keyboard.createCursorKeys();
            moveKeys.up.onDown.add(function () {
                player.jump();
            });
            
            // Gamepad input setup
            game.input.gamepad.start();
            pad1 = game.input.gamepad.pad1;
            pad1.onDownCallback = function (buttonCode, value) {
                switch (buttonCode) {
                    case Phaser.Gamepad.XBOX360_A:
                        player.jump();
                        break;
                    default:
                        break;
                }
            };
            
            // Camera
            game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);

        },

        update: function () {
            // Collide with platforms.
            game.physics.arcade.collide(player, platforms);
            
            // Collide player with map.
            game.physics.arcade.collide(player, collisionLayer);

            // Check to see if player has reached the exit door.
            if(game.physics.arcade.overlap(player, exitDoor) && moveKeys.down.isDown) {
                this.playerExits();
            }

            // Player movement controls
            if(moveKeys.up.isDown) {
                // player.jump();
            }
            if(moveKeys.left.isDown ||
               pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) ||
               pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
                player.moveLeft();
            } else if (moveKeys.right.isDown ||
               pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) ||
               pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
                player.moveRight();
            } else {
                player.stopMoving();
            }
        },
        
        playerOutOfBounds: function() {
            // This prevents occasional momentary "flashes" during state transitions.
            game.camera.unfollow();

            // Switch to the "death" state.
            game.stateTransition.to('Die', true);
        },

        playerExits: function () {
            // This prevents occasional momentary "flashes" during state transitions.
            game.camera.unfollow();

            // Switch to the "win" state.
            game.stateTransition.to('Play', true, false, exitDoor.properties.mapLink);
        }
    };
});