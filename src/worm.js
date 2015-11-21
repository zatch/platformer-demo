define([
    'phaser',
    'entity',
    'health-powerup',
    'behaviors/pacer'
], function (Phaser, Entity, HealthPowerup, Pacer) { 
    'use strict';

    // Shortcuts
    var game, self, sightLine;

    function Worm (_game, x, y) {
        game = _game;
        self = this;

        // Initialize sprite
        Entity.call(this, game, x, y, 'velma-worm');
        
        this.animations.add('walk', [0,1,2,3,4,5], 5);
       // this.animations.add('attack', [4,5,6]);

        this.bodyFrameData = [
            [46,4,1,19],
            [23,16,20,7],
            [26,3,17,20],
            [26,3,17,20],
            [23,16,20,7],
            [46,4,1,19]
        ];
        
        // Which way is the dude or dudette facing?
        this.facing = 'right';

        // Initialize public properites.
        // Fastest possible movement speeds.
        this.body.maxVelocity.x = 500;
        this.body.maxVelocity.y = 10000;
        this.body.drag.x = 800;
        this.body.drag.y = 0;
        
        // Initial health.
        this.health = this.maxHealth = 1;
        
        // The horizontal acceleration that is applied when moving.
        this.moveAccel = 1200;

        // AI
        this.targetPosition = new Phaser.Point();
        this.sightLine = new Phaser.Line();
        this.maxMoveSpeed = new Phaser.Point(75, 1000);
        this.bearing = new Phaser.Point();
        this.distanceToPlayer = new Phaser.Point();

        this.behavior = {
            pacer: new Pacer(this, game.player)
        };
        
    }

    Worm.prototype = Object.create(Entity.prototype);
    Worm.prototype.constructor = Worm;

    Worm.prototype.update = function () {
    
        // Adjust body to match animation frame.
        var bfd = this.bodyFrameData[this.animations.frame];
        this.body.setSize(bfd[0],
                          bfd[1],
                          bfd[2]*this.anchor.x*this.scale,
                          bfd[3]*this.anchor.y);
        
        Phaser.Point.subtract(game.player.position, this.position, this.distanceToPlayer);

        // Don't continue to accelerate unless force is applied.
        this.stopMoving();

        // Apply behaviors.
        this.behavior.pacer.update();

        // Update direction
        if (this.facing === 'right') {
            this.scale.x = 1; //facing default direction
        }
        else {
            this.scale.x = -1; //flipped
        }
        
        // Call up!
        Entity.prototype.update.call(this);
    };

    Worm.prototype.revive = function () {
        // Call up!
        Entity.prototype.revive.call(this);
        
        this.body.checkCollision.up = true;
        this.body.checkCollision.down = true;
        this.body.checkCollision.left = true;
        this.body.checkCollision.right = true;
    };

    Worm.prototype.canSee = function (target, line) {
        line.start.x = this.x;
        line.start.y = this.y;
        line.end.x = target.x;
        line.end.y = target.y;
        var tiles = game.collisionLayer.getRayCastTiles(line, null, true);

        if(tiles.length) return false;
        return true;
    };

    Worm.prototype.moveLeft = function () {
        // Temporarily disable input after knockback.
        if(this.knockbackTimeout > game.time.now) return;

        if(this.body.velocity.x <=  -this.maxMoveSpeed.x) this.body.velocity.x = -this.maxMoveSpeed.x;
        
        this.animations.play('walk');
        
        // Face away from wall.
        if(this.body.onWall() && this.body.blocked.left) {
            this.facing = 'right';
        }
        // Face normally.
        else {
            this.facing = 'left';
        }
        
        // Wait for drag to stop us if switching directions.
        if (this.body.acceleration.x > 0) {
            this.body.acceleration.x = 0;
        }
        if (this.body.velocity.x <= 0 && this.animations.frame === 4) {
            this.body.acceleration.x = -this.moveAccel;
        }
    };

    Worm.prototype.moveRight = function () {
        // Temporarily disable input after knockback.
        if(this.knockbackTimeout > game.time.now) return;

        if(this.body.velocity.x >= this.maxMoveSpeed.x) this.body.velocity.x = this.maxMoveSpeed.x;
        
        this.animations.play('walk');
        
        // Face away from wall and slide down wall slowly.
        if(this.body.onWall() && this.body.blocked.right) {
            this.facing = 'left';
            if (this.body.velocity.y > 0) {
                this.body.velocity.y = 50;
            }
        }
        // Face normally and fall normally.
        else {
            this.facing = 'right';
        }
        
        // Wait for drag to stop us if switching directions.
        if (this.body.acceleration.x < 0) {
            this.body.acceleration.x = 0;
        }
        if (this.body.velocity.x >= 0 && this.animations.frame === 4) {
            this.body.acceleration.x = this.moveAccel;
        }
    };

    Worm.prototype.stopMoving = function () {
        this.body.acceleration.x = 0;
    };
    
    Worm.prototype.handleDeath = function () {
        // Drop loot.
        if (Math.random() < 0.05) {
            var healthPowerup = new HealthPowerup(game, this.x, this.y);
            this.events.onDrop.dispatch(this, healthPowerup);
        }

        this.body.checkCollision.up = false;
        this.body.checkCollision.down = false;
        this.body.checkCollision.left = false;
        this.body.checkCollision.right = false;
        
        Entity.prototype.handleDeath.apply(this);
    };

    return Worm;

});