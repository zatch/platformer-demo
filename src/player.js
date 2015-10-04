define([
    'phaser',
    'sword',
    'bow',
    'claw-arm'
], function (Phaser, Sword, Bow, ClawArm) { 
    'use strict';

    // Shortcuts
    var game;

    function Player (_game, x, y) {
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'player');
        this.anchor.set(0.5);

        // Which way is the player facing?
        this.facing = 'right';

        // Enable physics.
        game.physics.enable(this);
        this.body.collideWorldBounds = true;
        this.checkWorldBounds = true;

        // Initialize public properites.
        // Fastest possible movement speeds.
        this.body.maxVelocity.x = 500;
        this.body.maxVelocity.y = 10000;
        this.body.drag.x = 1500;
        this.body.drag.y = 0;
        
        // Initial jump speed
        this.jumpSpeed = 500;
        // The horizontal acceleration that is applied when moving.
        this.moveAccel = 800;

        // Number of times the player can be hit by an enemy.
        this.maxHealth = 20;
        this.health = 20;

        // Equip weapons
        this.weapons = [
            new Sword(game, 0, 0),
            new Bow(game, 4, 4),
            new ClawArm(game, 0, 0)
        ];

        for(var i=0; i<this.weapons.length; i++) {
            this.addChild(this.weapons[i]);
        }

        // Invulnerability
        this.invulnerable = false;
        this.invulnerableTimer = 0;

        // Knockback
        this.knockback = new Phaser.Point();
        this.knockbackTimeout = game.time.now;
        this.maxMoveSpeed = new Phaser.Point(300, 10000);

        // Signals
        this.events.onHeal = new Phaser.Signal();
        this.events.onDamage = new Phaser.Signal();

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
    
    // Update children.
    Player.prototype.update = function () {
        if (this.facing === 'right') {
            this.scale.x = 1; //facing default direction
        }
        else {
            this.scale.x = -1; //flipped
        }

        // Update weapons.
        for(var w=0; w<this.weapons.length; w++) {
            this.weapons[w].facing = this.facing;
            this.weapons[w].update();
        }

        Phaser.Sprite.prototype.update.call(this);
    };

    Player.prototype.attackSword = function () {
        this.weapons[0].use();
    };

    Player.prototype.attackBow = function () {
        this.weapons[1].use();
    };
    
    Player.prototype.attackClaw = function () {
        this.weapons[2].use();
    };

    Player.prototype.heal = function (amount, source) {
        amount = Math.abs(amount || 1);
        this.health += amount;
        if (this.health > this.maxHealth) this.health = this.maxHealth;
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

        // Zero out current velocity
        this.body.velocity.set(0);

        Phaser.Point.add(this.body.velocity, this.knockback, this.body.velocity);
        this.knockback.set(0);

        // Temporarily disable input after knockback.
        this.knockbackTimeout = game.time.now + 500;

    };
    
    Player.prototype.jump = function () {
        // Temporarily disable input after knockback.
        if(this.knockbackTimeout > game.time.now) return;
        
        // Normal jumping
        if(this.body.onFloor() || this.body.touching.down) {
            this.body.velocity.y = -this.jumpSpeed;
        }

        // Wall jumping.
        else if(this.body.onWall() && this.body.blocked.left) {
            this.body.velocity.y = -this.jumpSpeed;
            this.body.velocity.x = this.maxMoveSpeed.x;  // TODO: Find a more appropriate way to calculate vx when wall jumping.
        }

        else if(this.body.onWall() && this.body.blocked.right) {
            this.body.velocity.y = -this.jumpSpeed;
            this.body.velocity.x = -this.maxMoveSpeed.x;  // TODO: Find a more appropriate way to calculate vx when wall jumping.
        }
    };

    Player.prototype.moveLeft = function () {
        // Temporarily disable input after knockback.
        if(this.knockbackTimeout > game.time.now) return;

        if(this.body.velocity.x <=  -this.maxMoveSpeed.x) this.body.velocity.x = -this.maxMoveSpeed.x;
        
        // Face away from wall and slide down wall slowly.
        if(this.body.onWall() && this.body.blocked.left && !(this.body.onFloor() || this.body.touching.down)) {
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
        if (this.body.acceleration.x > 0 && this.body.touching.bottom) {
            this.body.acceleration.x *= -1;
        }
        if (this.body.velocity.x <= 0 && this.body.touching.bottom) {
            this.body.acceleration.x = -this.moveAccel;
        } else {
            this.body.acceleration.x = -this.moveAccel;
        }
    };

    Player.prototype.moveRight = function () {
        // Temporarily disable input after knockback.
        if(this.knockbackTimeout > game.time.now) return;

        if(this.body.velocity.x >=  this.maxMoveSpeed.x) this.body.velocity.x = this.maxMoveSpeed.x;

        // Face away from wall and slide down wall slowly.
        if(this.body.onWall() && this.body.blocked.right && !(this.body.onFloor() || this.body.touching.down)) {
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
        if (this.body.acceleration.x < 0 && this.body.touching.bottom) {
            this.body.acceleration.x *= -1;
        }
        if (this.body.velocity.x >= 0 && this.body.touching.bottom) {
            this.body.acceleration.x = this.moveAccel;
        } else {
            this.body.acceleration.x = this.moveAccel;
        }
    };

    Player.prototype.stopMoving = function () {
        this.body.acceleration.x = 0;
    };

    return Player;

});