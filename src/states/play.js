define([
    'phaser',
    'player',
    'enemy',
    'villager',
    'platform',
    'object-layer-helper',
    'health-display',
    'karma-display',
    'health-powerup'
], function (Phaser, Player, Enemy, Villager, Platform, ObjectLayerHelper, HealthDisplay, KarmaDisplay, HealthPowerup) { 
    'use strict';

    // Shortcuts
    var game, moveKeys, pad1, player, enemies, villagers, map, collisionLayer, platforms, exitDoor, healthDisplay, karmaDisplay, collectables;

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

            var self = this;

            // Player set-up
            player = new Player(game, 0, 0);
            player.events.onOutOfBounds.add(this.playerOutOfBounds, this);
            player.events.onDamage.add(this.onPlayerDamage);
            player.events.onHeal.add(this.onPlayerHeal);
            player.events.onExalt.add(this.onPlayerExalt);
            player.events.onCensure.add(this.onPlayerCensure);

            // Make player accessible via game object.
            game.player = player;

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
            map.addTilesetImage('platformertiles', 'platformertiles');
            map.addTilesetImage('moon', 'moon');
            map.addTilesetImage('cave', 'cave');
            
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

            // Insert enemies
            enemies = ObjectLayerHelper.createObjectsByType(game, 'enemy', map, 'enemies', Enemy);
            enemies.forEach(this.registerEnemyEvents, this);
            game.add.existing(enemies);

            // Insert villagers
            villagers = ObjectLayerHelper.createObjectsByType(game, 'villager', map, 'villagers', Villager);
            villagers.forEach(this.registerVillagerEvents, this);
            game.add.existing(villagers);

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

            // Collectables
            collectables = ObjectLayerHelper.createObjectsByType(game, 'health-powerup', map, 'collectables', HealthPowerup);
            game.add.existing(collectables);
            
            // HUD
            
            // Health Display
            healthDisplay = new HealthDisplay(game, 10, 10, 'health-bar-cap-left', 'health-bar-middle', 'health-bar-cap-right', 'health-bar-fill');
            game.add.existing(healthDisplay);
            healthDisplay.setMaxHealth(player.maxHealth);
            healthDisplay.updateDisplay(player.health);
            
            // Karma Display
            karmaDisplay = new KarmaDisplay(game, 10, 10, 'karma-bar-cap-left', 'karma-bar-middle', 'karma-bar-cap-right', 'karma-bar-fill');
            game.add.existing(karmaDisplay);
            karmaDisplay.setMinKarma(player.minKarma);
            karmaDisplay.setMaxKarma(player.maxKarma);
            karmaDisplay.updateDisplay(player.karma);

            
            
            
            // Keyboard input set-up
            moveKeys = game.input.keyboard.createCursorKeys();
            moveKeys.up.onDown.add(function () {
                player.jump();
            });

            game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(function () {
                player.attack();
            });

            game.input.keyboard.addKey(Phaser.Keyboard.ALT).onDown.add(function () {
                player.nextWeapon();
            });
            
            // Gamepad input setup
            game.input.gamepad.start();
            pad1 = game.input.gamepad.pad1;
            pad1.onDownCallback = function (buttonCode, value) {
                switch (buttonCode) {
                    case Phaser.Gamepad.XBOX360_A:
                        player.jump();
                        break;
                    case Phaser.Gamepad.XBOX360_B:
                        player.attack();
                        break;
                    case Phaser.Gamepad.XBOX360_Y:
                        // Check to see if player has reached the exit door.
                        if(game.physics.arcade.overlap(player, exitDoor)) {
                            self.playerExits();
                        }
                        break;
                    case Phaser.Gamepad.XBOX360_X:
                        player.nextWeapon();
                        break;
                    default:
                        break;
                }
            };
            
            // Camera
            game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);

        },

        render: function () {
            var body = player.weapon.getCollidables();
            // if(body) game.debug.body(body);
        },

        update: function () {
            // Collide with platforms.
            game.physics.arcade.collide(player, platforms);

            // Check to see if weapons are colliding with enemies.
            game.physics.arcade.overlap(player.weapon.getCollidables(), enemies, player.weapon.onHit);
            game.physics.arcade.overlap(player.weapon.getCollidables(), villagers, player.weapon.onHit);
            // Check to see if weapons are colliding collision layer.
            game.physics.arcade.collide(player.weapon.getCollidables(), collisionLayer, player.weapon.onHitTerrain);

            // Collide player + enemies.
            game.physics.arcade.overlap(player, enemies, this.onPlayerCollidesEnemy);
            
            // Collide player + collectables.
            game.physics.arcade.overlap(player, collectables, this.onPlayerCollidesCollectable);

            // Collide objects with map.  Do this after other collision checks
            // so objects aren't pushed through walls.
            game.physics.arcade.collide(player, collisionLayer);
            game.physics.arcade.collide(enemies, collisionLayer);
            game.physics.arcade.collide(villagers, collisionLayer);
            game.physics.arcade.collide(collectables, collisionLayer);

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

        shutdown: function () {
            // This prevents occasional momentary "flashes" during state transitions.
            game.camera.unfollow();
            pad1.onDownCallback = undefined;
        },
        
        registerEnemyEvents: function (enemy) {
            enemy.events.onDeath.add(this.onEnemyDeath, this);
            enemy.events.onDrop.add(this.onEnemyDrop, this);
        },
        
        registerVillagerEvents: function (villager) {
            villager.events.onDeath.add(this.onVillagerDeath, this);
        },
        
        onPlayerCollidesEnemy: function (player, enemy) {
            player.damage(4, enemy);
        },
        
        onEnemyDeath: function (enemy) {
            player.exalt(1, enemy);
        },

        onEnemyDrop: function (enemy, item) {
            collectables.add(item);
        },
        
        onVillagerDeath: function (villager) {
            player.censure(1, villager);
        },

        onPlayerDamage: function (totalHealth, amount) {
            // Update HUD
            healthDisplay.updateDisplay(player.health);

            // Is the player dead?
            if(totalHealth <= 0) {
                game.camera.unfollow();
                game.stateTransition.to('Die', true);
            }
        },

        onPlayerHeal: function (totalHealth, amount) {
            // Update HUD
            healthDisplay.updateDisplay(player.health);
        },

        onPlayerExalt: function (totalKarma, amount) {
            // Update HUD
            karmaDisplay.updateDisplay(player.karma);
        },

        onPlayerCensure: function (totalKarma, amount) {
            // Update HUD
            karmaDisplay.updateDisplay(player.karma);
        },
        
        onPlayerCollidesCollectable: function (player, collectable) {
            collectable.useOn(player);
            collectable.destroy();
        },
        
        playerOutOfBounds: function() {
            // Switch to the "death" state.
            game.stateTransition.to('Die', true);
        },

        playerExits: function () {
            // Switch to the "win" state.
            game.stateTransition.to('Play', true, false, exitDoor.properties.mapLink);
        }
    };
});