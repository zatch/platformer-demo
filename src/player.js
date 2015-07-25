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
        this.speed = 100;
        this.jumpAccel = 300;
    }

    Player.prototype = Object.create(Phaser.Sprite.prototype);
    Player.prototype.constructor = Player;

    var touchLeft, touchRight;
    Player.prototype.update = function () {
        touchLeft = this.body.wasTouching.left;
        touchRight = this.body.wasTouching.right;

        Phaser.Sprite.prototype.update.call();
    };
    
    Player.prototype.jump = function () {

        // Normal jumping
        if(this.body.onFloor()) {
            this.body.velocity.y = -this.jumpAccel;
        }

        // Wall jumping.
        if(this.body.onWall() && this.body.blocked.left) {
            this.body.velocity.y = -this.jumpAccel;
            this.body.velocity.x = this.speed;
        }

        if(this.body.onWall() && this.body.blocked.right) {
            this.body.velocity.y = -this.jumpAccel;
            this.body.velocity.x = -this.speed;
        }
    };

    Player.prototype.moveLeft = function () {
        this.frame = 1;
        this.body.velocity.x = -this.speed; 
    };

    Player.prototype.moveRight = function () {
        this.frame = 0;
        this.body.velocity.x = this.speed;
    };

    Player.prototype.stopMoving = function () {
        if(this.body.onFloor()) this.body.velocity.x = 0;
    };

    return Player;

});