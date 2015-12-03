define([
    'phaser'
], function (Phaser) { 
    'use strict';

    var game;

    function GameStuff (_game) {

        game = _game;

        Phaser.Group.call(this, game);
        
        this.paused = false;

    }

    GameStuff.prototype = Object.create(Phaser.Group.prototype);
    GameStuff.prototype.constructor = GameStuff;

    GameStuff.prototype.preUpdate = function () {
        if (!this.paused) Phaser.Group.prototype.preUpdate.call(this);
    };

    GameStuff.prototype.update = function () {
        if (!this.paused) Phaser.Group.prototype.update.call(this);
    };

    GameStuff.prototype.postUpdate = function () {
        if (!this.paused) Phaser.Group.prototype.postUpdate.call(this);
    };

    return GameStuff;
});