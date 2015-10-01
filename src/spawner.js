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
        Phaser.Sprite.call(this, game, x, y, 'spawner');
            
        // Spawn settings
        this.maxSpawned = 1;
        this.spawnRate = 500; // Delay to spawn, in ms
        
        // Internal counters
        this.nextPossibleSpawnTime = 0;
        this.spawnCount = 0;
        this.lastSpawnCount = 0;

        // Signals
        this.events.onSpawn = new Phaser.Signal();
        
        game.physics.enable(this);
        this.body.immovable = true;
        this.body.allowGravity = false;
    }

    Spawner.prototype = Object.create(Phaser.Sprite.prototype);
    Spawner.prototype.constructor = Spawner;

    Spawner.prototype.update = function () {
        
        
       // if (this.inCamera) {
            // Attempt to spawn when the spawner is within the camera bounds.
       //     this.spawn();
            //console.log(this.width, this.height);
            //console.log(game.width, game.height);
           // console.log(this.width, this.height);
       // }
       // else {
            // Reset spawn count when not within the camera.
            //this.spawnCount = 0;
       // }

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