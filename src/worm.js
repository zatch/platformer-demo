define([
    'phaser',
    'health-powerup',
    'behaviors/pacer'
], function (Phaser, HealthPowerup, Pacer) { 
    'use strict';

    // Shortcuts
    var game, self, sightLine;

    function Worm (_game, x, y) {
        game = _game;
        self = this;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'velma-worm');
        this.anchor.set(0.5);
        
        this.animations.add('walk', [0,1,2,3,4,5], 5);
       // this.animations.add('attack', [4,5,6]);

        // Which way is the dude or dudette facing?
        this.facing = 'right';

        // Enable physics.
        game.physics.enable(this);
        this.body.collideWorldBounds = true;
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;

        // Initialize public properites.
        // Fastest possible movement speeds.
        this.body.maxVelocity.x = 500;
        this.body.maxVelocity.y = 10000;
        this.body.drag.x = 800;
        this.body.drag.y = 0;
        
        // Initial health.
        this.health = this.maxHealth = 1;

        // Initial jump speed
        this.jumpSpeed = 500;
        // The horizontal acceleration that is applied when moving.
        this.moveAccel = 1200;

        // Invulnerability
        this.invulnerable = false;
        this.invulnerableTimer = 0;

        // Knockback
        this.knockback = new Phaser.Point();
        this.knockbackTimeout = game.time.now;

        // Signals
        this.events.onHeal = new Phaser.Signal();
        this.events.onDamage = new Phaser.Signal();
        this.events.onDeath = new Phaser.Signal();
        this.events.onDrop = new Phaser.Signal();

        // AI
        this.targetPosition = new Phaser.Point();
        this.sightLine = new Phaser.Line();
        this.maxMoveSpeed = new Phaser.Point(75, 1000);
        this.bearing = new Phaser.Point();
        this.distanceToPlayer = new Phaser.Point();

        this.knockback = new Phaser.Point();
        this.knockbackTimeout = 0;

        this.behavior = {
            pacer: new Pacer(this, game.player)
        };
        
        this.offCameraKillTimer = game.time.create(false);
        this.offCameraKillTimer.start(); 
        
    }

    function onBlinkLoop (){
        if(game.time.now - this.invulnerableTimer > 500) {
            this.blinkTween.start(0);
            this.blinkTween.pause();
            this.invulnerable = false;
            this.alpha = 1;
            if (!this.alive) {
                this.kill();
            }
        }
    }

    Worm.prototype = Object.create(Phaser.Sprite.prototype);
    Worm.prototype.constructor = Worm;

    Worm.prototype.update = function () {

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
        Phaser.Sprite.prototype.update.call(this);
        
        if (this.alive) {
            
            if (!this.inCamera) {
                // Auto-kill if off camera for too long.
                this.offCameraKillTimer.add(2000, this.kill, this);
            }
            else {
                // Cancel auto-kill if returned to the camera.
                this.offCameraKillTimer.removeAll();
            }
        }
    };

    Worm.prototype.revive = function () {
        // Call up!
        Phaser.Sprite.prototype.revive.call(this);
        
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

    Worm.prototype.damage = function (amount, source) {

        // Can currently take damage?
        if(this.invulnerable) return;

        amount = Math.abs(amount || 1);
        this.health -= amount;
        this.events.onDamage.dispatch(this.health, amount);

        // Temporary invulnerability.
        this.invulnerable = true;
        this.invulnerableTimer = game.time.now;
        
        // Visual feedback to show player was hit and is currently invulnerable.
        this.blinkTween = game.add.tween(this);
        this.blinkTween.to({alpha: 0}, 80, null, true, 0, -1, true);
        this.blinkTween.onLoop.add(onBlinkLoop, this);

        // Knockback force
        Phaser.Point.subtract({x: this.position.x, y: this.position.y-20}, source.position, this.knockback);
        Phaser.Point.normalize(this.knockback, this.knockback);
        this.knockback.setMagnitude(500);

        // Zero out current velocity
        this.body.velocity.set(0);

        Phaser.Point.add(this.body.velocity, this.knockback, this.body.velocity);
        this.knockback.set(0);

        // Temporarily disable input after knockback.
        this.knockbackTimeout = game.time.now + 500;
        
        if (this.health === 0) {
            this.handleDeath();
        }
    };

    Worm.prototype.shouldJump = function () {
        // If the player is higher than enemy and enemy...
        if(game.player.position.y+game.player.height < this.position.y+this.height) return true;

        // If player is within attack range, there is a 5% change enemy will jump;
        if(this.distanceToPlayer.getMagnitude() < 64 && Math.random() < 0.05) return true;

        // ...else don't jump.
        return false;
    };
    
    Worm.prototype.jump = function () {
        // Temporarily disable input after knockback.
        if(this.knockbackTimeout > game.time.now) return;
        
        // Normal jumping
        if(this.body.onFloor() || this.body.touching.down) {
            this.body.velocity.y = -this.jumpSpeed;
        }

        // Wall jumping.
        if(this.body.onWall() && this.body.blocked.left) {
            this.body.velocity.y = -this.jumpSpeed;
            this.body.velocity.x = this.maxMoveSpeed.x; // TODO: Find a more appropriate way to calculate vx when wall jumping.
        }

        if(this.body.onWall() && this.body.blocked.right) {
            this.body.velocity.y = -this.jumpSpeed;
            this.body.velocity.x = -this.maxMoveSpeed.x; // TODO: Find a more appropriate way to calculate vx when wall jumping.
        }
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
        this.events.onDeath.dispatch(this);

        // Drop loot.
        if (Math.random() < 0.5) {
            var healthPowerup = new HealthPowerup(game, this.x, this.y);
            this.events.onDrop.dispatch(this, healthPowerup);
        }

        this.body.checkCollision.up = false;
        this.body.checkCollision.down = false;
        this.body.checkCollision.left = false;
        this.body.checkCollision.right = false;
    };

    return Worm;

});