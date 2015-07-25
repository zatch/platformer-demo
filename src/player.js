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

        // Enable physics.
        game.physics.enable(this);
        this.body.collideWorldBounds = true;

        // Initialize public properites.
        // Fastest possible horizontal movement speed.
        this.moveSpeed = 300;
        // Initial jump speed
        this.jumpSpeed = 400;
        // The horizontal acceleration that is applied if the player attemps to
        // move while they're airborne. 
        this.jumpMoveAccel = 350;
    }

    Player.prototype = Object.create(Phaser.Sprite.prototype);
    Player.prototype.constructor = Player;
    
    Player.prototype.jump = function () {

        // Normal jumping
        if(this.body.onFloor()) {
            this.body.velocity.y = -this.jumpSpeed;
        }

        // Wall jumping.
        if(this.body.onWall() && this.body.blocked.left) {
            this.body.velocity.y = -this.jumpSpeed;
            this.body.velocity.x = this.moveSpeed;
        }

        if(this.body.onWall() && this.body.blocked.right) {
            this.body.velocity.y = -this.jumpSpeed;
            this.body.velocity.x = -this.moveSpeed;
        }
    };

    Player.prototype.moveLeft = function () {
        this.frame = 1;
        this.body.drag.set(0);

        if(this.body.onFloor()) {
            this.body.acceleration.x = 0;
            this.body.velocity.x = -this.moveSpeed; 
        } else {
            this.body.acceleration.x = -this.jumpMoveAccel;
            this.body.velocity.clamp(-this.moveSpeed, this.moveSpeed);
        }
    };

    Player.prototype.moveRight = function () {
        this.frame = 0;
        this.body.drag.set(0);

        if(this.body.onFloor()) {
            this.body.acceleration.x = 0;
            this.body.velocity.x = this.moveSpeed;
        } else {
            this.body.acceleration.x = this.jumpMoveAccel;
            this.body.velocity.clamp(-this.moveSpeed, this.moveSpeed);
        }
    };

    Player.prototype.stopMoving = function () {
        if(this.body.onFloor()) {
            this.body.drag.set(this.moveSpeed * 10.5);
            this.body.acceleration.x = 0;
        } else {
            this.body.drag.set(0);
            this.body.acceleration.x = 0;
        }
    };

    return Player;

});