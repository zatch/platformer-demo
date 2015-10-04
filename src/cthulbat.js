define([
    'phaser',
    'health-powerup',
    'behaviors/cthulbat-behavior'
], function (Phaser, HealthPowerup, CthulbatBehavior) { 
    'use strict';

    // Shortcuts
    var game, self, sightLine;

    function Cthulbat (_game, x, y) {
        game = _game;
        self = this;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'enemy');
        this.anchor.set(0.5);

        // Which way is the dude or dudette facing?
        this.facing = 'right';

        // Enable physics.
        game.physics.enable(this);
        this.body.allowGravity = false;
        this.body.collideWorldBounds = true;
        this.body.checkCollision.up = false;
        this.body.checkCollision.down = false;
        this.body.checkCollision.left = false;
        this.body.checkCollision.right = false;
        
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        

        // Initialize public properites.
        // Fastest possible movement speeds.
        this.body.maxVelocity.x = 500;
        this.body.maxVelocity.y = 500;
        this.body.drag.x = 10000;
        this.body.drag.y = 10000;
        
        // Initial health.
        this.health = this.maxHealth = 2;

        // Initial jump speed
        this.jumpSpeed = 500;
        // The horizontal acceleration that is applied when moving.
        this.moveAccel = 100;

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
        this.bearing = new Phaser.Point();
        this.distanceToPlayer = new Phaser.Point();

        this.knockback = new Phaser.Point();
        this.knockbackTimeout = 0;

        this.behavior = {
            cthulbat: new CthulbatBehavior(this, game.player)
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

    Cthulbat.prototype = Object.create(Phaser.Sprite.prototype);
    Cthulbat.prototype.constructor = Cthulbat;

    Cthulbat.prototype.update = function () {

        Phaser.Point.subtract(game.player.position, this.position, this.distanceToPlayer);

        // Don't continue to accelerate unless force is applied.
        this.stopMoving();

        // Apply behaviors.
        this.behavior.cthulbat.update();

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

    Cthulbat.prototype.revive = function () {
        // Call up!
        Phaser.Sprite.prototype.revive.call(this, this.maxHealth);
        
        // Zero out all movement.
        this.body.acceleration.set(0);
        this.body.velocity.set(0);
        
        // Restore flight.
        this.body.allowGravity = false;
    };

    Cthulbat.prototype.canSee = function (target, line) {
        line.start.x = this.x;
        line.start.y = this.y;
        line.end.x = target.x;
        line.end.y = target.y;
        var tiles = game.collisionLayer.getRayCastTiles(line, null, true);

        if(tiles.length) return false;
        return true;
    };

    Cthulbat.prototype.damage = function (amount, source) {

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
    
    Cthulbat.prototype.attack = function () {
        // Temporarily disable input after knockback.
        if(this.knockbackTimeout > game.time.now) return;
        
        this.body.acceleration.set(0);
        game.physics.arcade.accelerateToObject(this, game.player, 500);
    };

    Cthulbat.prototype.moveLeft = function () {
        // Temporarily disable input after knockback.
        if(this.knockbackTimeout > game.time.now) return;

        this.body.acceleration.set(0);
        game.physics.arcade.accelerateToObject(this, game.player, 100);
        this.facing = 'left';
    };

    Cthulbat.prototype.moveRight = function () {
        // Temporarily disable input after knockback.
        if(this.knockbackTimeout > game.time.now) return;
        
        this.body.acceleration.set(0);
        game.physics.arcade.accelerateToObject(this, game.player, 100);
        this.facing = 'right';
    };

    Cthulbat.prototype.stopMoving = function () {
        this.body.acceleration.set(0);
    };
    
    Cthulbat.prototype.handleDeath = function () {
        this.events.onDeath.dispatch(this);

        // Drop loot.
        if (Math.random() < 0.5) {
            var healthPowerup = new HealthPowerup(game, this.x, this.y);
            this.events.onDrop.dispatch(this, healthPowerup);
        }
        
        // Stop trying to fly.
        this.body.allowGravity = true;
    };

    return Cthulbat;

});