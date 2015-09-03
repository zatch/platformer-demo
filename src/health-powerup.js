define([
    'phaser'
], function (Phaser) { 
    'use strict';

    var game, self;

    function HealthPowerup (_game, x, y) {
        game = _game;
        self = this;

        Phaser.Sprite.call(this, game, x, y, 'health-powerup');
    }

    HealthPowerup.prototype = Object.create(Phaser.Sprite.prototype);
    HealthPowerup.prototype.constructor = HealthPowerup;

    HealthPowerup.prototype.update = function () {
        // TODO?
        Phaser.Sprite.prototype.update.call(this);
    };

    return HealthPowerup;
});