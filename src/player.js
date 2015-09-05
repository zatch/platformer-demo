define([
    'phaser',
    'sword',
    'bow'
], function (Phaser, Sword, Bow) { 
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
        this.body.maxVelocity.x = 300;
        this.body.maxVelocity.y = 10000;
        this.body.drag.x = 1500;
        this.body.drag.y = 0;
        
        // Initial jump speed
        this.jumpSpeed = 500;
        // The horizontal acceleration that is applied when moving.
        this.moveAccel = 800;

        // Number of times the player can be hit by an enemy.
        this.maxHealth = 10;
        this.health = 10;

        // Equip weapons
        this.weaponIndex = 0;
        this.allWeapons = [
            new Sword(game, 0, 0),
            new Bow(game, 0, 0)
        ];

        // this.allWeapons.forEach(this.addChild);
        for(var i=0; i<this.allWeapons.length; i++) {
            this.addChild(this.allWeapons[i]);
            this.allWeapons[i].kill();
        }

        this.setWeapon(this.allWeapons[this.weaponIndex]);

        // Invulnerability
        this.invulnerable = false;
        this.invulnerableTimer = 0;

        // Knockback
        this.knockback = new Phaser.Point();
        this.knockbackTimeout = game.time.now;

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
        if(this.weapon) this.weapon.update();
        Phaser.Sprite.prototype.update.call(this);
    };

    Player.prototype.setWeapon = function (weapon) {
        if(this.weapon) this.weapon.kill();
        this.weapon = weapon;
        this.weapon.revive();
    };

    Player.prototype.nextWeapon = function () {
        this.weaponIndex += 1;
        if(this.weaponIndex > this.allWeapons.length - 1) this.weaponIndex = 0;
        this.setWeapon(this.allWeapons[this.weaponIndex]);
    };

    Player.prototype.previousWeapon = function () {
        this.weaponIndex -= 1;
        if(this.weaponIndex < 0) this.weaponIndex = this.allWeapons.length - 1;
        this.setWeapon(this.allWeapons[this.weaponIndex]);
    };

    Player.prototype.attack = function () {
        if(this.weapon) this.weapon.use();
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
        if(this.body.onWall() && this.body.blocked.left) {
            this.body.velocity.y = -this.jumpSpeed;
            this.body.velocity.x = this.body.maxVelocity.x; // TODO: Find a more appropriate way to calculate vx when wall jumping.
        }

        if(this.body.onWall() && this.body.blocked.right) {
            this.body.velocity.y = -this.jumpSpeed;
            this.body.velocity.x = -this.body.maxVelocity.x; // TODO: Find a more appropriate way to calculate vx when wall jumping.
        }
    };

    Player.prototype.moveLeft = function () {
        // Temporarily disable input after knockback.
        if(this.knockbackTimeout > game.time.now) return;
        
        // Face away from wall and slide down wall slowly.
        if(this.body.onWall() && this.body.blocked.left) {
            this.facing = 'right';
            this.frame = 0;
            if (this.body.velocity.y > 0) {
                this.body.velocity.y = 50;
            }
        }
        // Face normally and fall normally.
        else {
            this.facing = 'left';
            this.frame = 1;
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

        // Face away from wall and slide down wall slowly.
        if(this.body.onWall() && this.body.blocked.right) {
            this.facing = 'left';
            this.frame = 1;
            if (this.body.velocity.y > 0) {
                this.body.velocity.y = 50;
            }
        }
        // Face normally and fall normally.
        else {
            this.facing = 'right';
            this.frame = 0;
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