define([
    'phaser'
], function (Phaser) { 
    'use strict';

    var game;

    function Weapon (_game, x, y, key) {
        game = _game;

        Phaser.Sprite.call(this, game, x, y, key);

        // Whether or not this weapon is currently in use.
        this.inUse = false;

        // How often this weapon can be used (in ms)
        this.useRate = 100;

        // Used to throttle use rate.
        this.useTimeout = 0;

    }

    Weapon.prototype = Object.create(Phaser.Sprite.prototype);
    Weapon.prototype.constructor = Weapon;

    Weapon.prototype.update = function () {
        if (game.time.now > this.useTimeout + this.useRate) {
            this.inUse = false;
        }
        Phaser.Sprite.prototype.update.call(this);
    };

    // Return one or more items that can be collided with to cause damage.
    Weapon.prototype.getCollidables = function () {
        if(this.inUse) return this;
        return null;
    };

    Weapon.prototype.use = function () {
        if(this.canUse()) {
            this.useTimeout = game.time.now;
            this.inUse = true;
        }
    };

    Weapon.prototype.canUse = function () {
        if (game.time.now > this.useTimeout + this.useRate) {
            return true;
        } else {
            return false;
        }
    };

    Weapon.prototype.onHit = function (weapon, victim) {
        victim.damage(1, this.parent);
    };

    return Weapon;
});