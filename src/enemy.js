define([
    'phaser',
    'health-powerup',
    'hunter'
], function (Phaser, HealthPowerup, Hunter) { 
    'use strict';

    // Shortcuts
    var game, self, sightLine;

    function Enemy (_game, x, y) {
        game = _game;
        self = this;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'enemy');
        this.anchor.set(0.5);

        // Which way is the dude or dudette facing?
        this.facing = 'right';

        // Enable physics.
        game.physics.enable(this);
        this.body.collideWorldBounds = true;
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;

        // Initialize public properites.
        // Fastest possible movement speeds.
        this.body.maxVelocity.x = 400;
        this.body.maxVelocity.y = 10000;
        this.body.drag.x = 800;
        this.body.drag.y = 0;
        
        // Initial health.
        this.health = 2;

        // Initial jump speed
        this.jumpSpeed = 500;
        // The horizontal acceleration that is applied when moving.
        this.moveAccel = 100;

        // Number of times the player can be hit by an enemy.
        this.health = 3;

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
            hunter: new Hunter(this, game.player)
        };
        
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

    Enemy.prototype = Object.create(Phaser.Sprite.prototype);
    Enemy.prototype.constructor = Enemy;

    Enemy.prototype.update = function () {

        Phaser.Point.subtract(game.player.position, this.position, this.distanceToPlayer);

        // Don't continue to accelerate unless force is applied.
        this.stopMoving();

        // Apply behaviors.
        this.behavior.hunter.update();

        // Update direction
        if (this.facing === 'right') {
            this.scale.x = 1; //facing default direction
        }
        else {
            this.scale.x = -1; //flipped
        }
        
        // Call up!
        Phaser.Sprite.prototype.update.call(this);
    };

    Enemy.prototype.canSee = function (target, line) {
        line.start.x = this.x;
        line.start.y = this.y;
        line.end.x = target.x;
        line.end.y = target.y;
        var tiles = game.collisionLayer.getRayCastTiles(line, null, true);

        if(tiles.length) return false;
        return true;
    };

    Enemy.prototype.damage = function (amount, source) {

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

    Enemy.prototype.shouldJump = function () {
        // If the player is higher than enemy and enemy...
        if(game.player.position.y+game.player.height < this.position.y+this.height) return true;

        // If player is within attack range, there is a 5% change enemy will jump;
        if(this.distanceToPlayer.getMagnitude() < 64 && Math.random() < 0.05) return true;

        // ...else don't jump.
        return false;
    };
    
    Enemy.prototype.jump = function () {
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

    Enemy.prototype.moveLeft = function () {
        // Temporarily disable input after knockback.
        if(this.knockbackTimeout > game.time.now) return;

        if(this.body.velocity.x <=  -this.maxMoveSpeed.x) this.body.velocity.x = -this.maxMoveSpeed.x;

        // Face away from wall and slide down wall slowly.
        if(this.body.onWall() && this.body.blocked.left) {
            this.facing = 'right';
            if (this.body.velocity.y > 0) {
                this.body.velocity.y = 50;
            }
        }
        // Face normally and fall normally.
        else {
            this.facing = 'left';
        }
        
        // Wait for drag to stop us if switching directions.
        if (this.body.acceleration.x > 0) {
            this.body.acceleration.x = 0;
        }
        if (this.body.velocity.x <= 0) {
            this.body.acceleration.x = -this.moveAccel;
        }
    };

    Enemy.prototype.moveRight = function () {
        // Temporarily disable input after knockback.
        if(this.knockbackTimeout > game.time.now) return;

        if(this.body.velocity.x >= this.maxMoveSpeed.x) this.body.velocity.x = this.maxMoveSpeed.x;
        
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
        if (this.body.velocity.x >= 0) {
            this.body.acceleration.x = this.moveAccel;
        }
    };

    Enemy.prototype.stopMoving = function () {
        this.body.acceleration.x = 0;
    };
    
    Enemy.prototype.handleDeath = function () {
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

    return Enemy;

});