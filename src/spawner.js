define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game, self;

    function Spawner (_game, x, y) {
        game = _game;
        self = this;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y);
        this.anchor.set(0.5);
        
        // Spawn settings
        this.maxSpawned = 3;
        this.spawnRate = 500; // Delay to spawn, in ms
        
        // Internal counters
        this.nextPossibleSpawnTime = 0;
        this.spawnCount = 0;

        // Signals
        this.events.onSpawn = new Phaser.Signal();
    }

    Spawner.prototype = Object.create(Phaser.Sprite.prototype);
    Spawner.prototype.constructor = Spawner;

    Spawner.prototype.update = function () {
        if (this.inCamera) {
            // Attempt to spawn when the spawner is within the camera bounds.
            this.spawn();
        }
        else {
            // Reset spawn count when not within the camera.
            this.spawnCount = 0;
        }

        // Call up!
        Phaser.Sprite.prototype.update.call(this);
    };

    Spawner.prototype.spawn = function () {
        if (game.time.now >= this.nextPossibleSpawnTime && this.spawnCount < this.maxSpawned) {
            this.events.onSpawn.dispatch(this, 'enemy');
            this.spawnCount++;
            this.nextPossibleSpawnTime = game.time.now + this.spawnRate;
        }
    };

    return Spawner;

});