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
            this.body.velocity.x = this.body.maxVelocity.x/3; // TODO: Find a more appropriate way to calculate vx when wall jumping.
        }

        if(this.body.onWall() && this.body.blocked.right) {
            this.body.velocity.y = -this.jumpSpeed;
            this.body.velocity.x = -this.body.maxVelocity.x/3; // TODO: Find a more appropriate way to calculate vx when wall jumping.
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