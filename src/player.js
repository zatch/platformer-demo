define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game;

    function Player (_game, x, y) {
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'player');
        this.anchor.set(0.5);

        // Enable physics.
        game.physics.enable(this);
        this.body.collideWorldBounds = true;
        this.checkWorldBounds = true;

        // Initialize public properites.
        // Fastest possible movement speeds.
        this.body.maxVelocity.x = 350;
        this.body.maxVelocity.y = 10000;
        this.body.drag.x = 800;
        this.body.drag.y = 0;
        
        // Initial jump speed
        this.jumpSpeed = 500;
        // The horizontal acceleration that is applied when moving.
        this.moveAccel = 300;

        // Number of times the player can be hit by an enemy.
        this.health = 10;

        // Invulnerability
        this.invulnerable = false;
        this.invulnerableTimer = 0;

        this.knockback = new Phaser.Point();

        // Signals
        this.events.onHeal = new Phaser.Signal();
        this.events.onDamage = new Phaser.Signal();
        
        // Gives the player a grace period to jump immediately after falling.
        this.edgeTimer = 0;
        this.ableToJump = false;
        this.wasAbleToJump = false;
    }

    function onBlinkLoop (){
        if(game.time.now - this.invulnerableTimer > 1500) {
            this.blinkTween.start(0);
            this.blinkTween.pause();
            this.invulnerable = false;
            this.alpha = 1;
        }
    }

    Player.prototype = Object.create(Phaser.Sprite.prototype);
    Player.prototype.constructor = Player;

    Player.prototype.heal = function (amount, source) {
        amount = Math.abs(amount || 1);
        this.health += amount;
        this.events.onHeal.dispatch(this.health, amount);
    };

    Player.prototype.damage = function (amount, source) {

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
        Phaser.Point.subtract(this.position, source.position, this.knockback);
        Phaser.Point.normalize(this.knockback, this.knockback);
        this.knockback.setMagnitude(400);

        Phaser.Point.add(this.body.velocity, this.knockback, this.body.velocity);
        this.knockback.set(0);

    };
    
    Player.prototype.preUpdate = function () {
        // Store and reset jump flag.
        this.wasAbleToJump = this.ableToJump;
        this.ableToJump = false;
        
        // Call to super.
        return Phaser.Sprite.prototype.preUpdate.call(this);
    };
    
    Player.prototype.update = function () {
        // Set flag if we can jump.
        this.ableToJump =   this.body.onFloor() ||
                            this.body.touching.down ||
                            (this.body.onWall() && this.body.blocked.left) ||
                            (this.body.onWall() && this.body.blocked.right);
        // Update edgeTimer if qualified to.
        if (!this.ableToJump && this.wasAbleToJump) {
            this.edgeTimer = this.game.time.time + 150;
        }
    };
    
    Player.prototype.jump = function () {
        if (this.ableToJump || this.game.time.time < this.edgeTimer) {
            // Clear jump flag and edge timer.
            this.ableToJump = this.wasAbleToJump = false;
            this.edgeTimer = this.game.time.time;
            
            // Lift off! Apply vertical acceleration.
            this.body.velocity.y = -this.jumpSpeed;
            
            // Horizontal acceleration for wall jump.
            if(this.body.onWall()) {
                // Jump off of left wall.
                if (this.body.blocked.left) {
                    this.body.velocity.x = this.body.maxVelocity.x/3; // TODO: Find a more appropriate way to calculate vx when wall jumping.
                }
                // Jump off of right wall.
                else {
                    this.body.velocity.x = -this.body.maxVelocity.x/3; // TODO: Find a more appropriate way to calculate vx when wall jumping.
                }
            }
        }
    };

    Player.prototype.moveLeft = function () {
        // Face away from wall and slide down wall slowly.
        if(this.body.onWall() && this.body.blocked.left) {
            this.frame = 0;
            if (this.body.velocity.y > 0) {
                this.body.velocity.y = 50;
            }
        }
        // Face normally and fall normally.
        else {
            this.frame = 1;
        }
        
        // Wait for drag to stop us if switching directions.
        if (this.body.acceleration.x > 0) {
            this.body.acceleration.x = 0;
        }
        if (this.body.velocity.x <= 0) {
            this.body.acceleration.x = -this.moveAccel;
        }
    };

    Player.prototype.moveRight = function () {
        // Face away from wall and slide down wall slowly.
        if(this.body.onWall() && this.body.blocked.right) {
            this.frame = 1;
            if (this.body.velocity.y > 0) {
                this.body.velocity.y = 50;
            }
        }
        // Face normally and fall normally.
        else {
            this.frame = 0;
        }
        
        // Wait for drag to stop us if switching directions.
        if (this.body.acceleration.x < 0) {
            this.body.acceleration.x = 0;
        }
        if (this.body.velocity.x >= 0) {
            this.body.acceleration.x = this.moveAccel;
        }
    };

    Player.prototype.stopMoving = function () {
        this.body.acceleration.x = 0;
    };

    return Player;

});