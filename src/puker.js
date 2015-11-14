define([
    'phaser',
    'weapon',
    'puke'
], function (Phaser, Weapon, Puke) { 
    'use strict';

    var game;

    function Puker (_game, x, y) {
        game = _game;

        Weapon.call(this, game, x, y, 'blank', 1);
        this.anchor.set(0.5);

        this.missiles = game.add.group();
        this.missiles.x = 0;
        this.missiles.y = 0;
        this.missiles.classType = Puke;

        // How often this weapon can be used (in ms)
        this.useRate = 40;
        this.useTimer = game.time.create(false);
        this.useTimer.start(); 

        // Used to throttle use rate.
        this.useTimeout = 0;

        game.physics.enable(this);
        this.body.immovable = true;
        this.body.allowGravity = false;

    }

    Puker.prototype = Object.create(Weapon.prototype);
    Puker.prototype.constructor = Puker;

    Puker.prototype.update = function () {
        Phaser.Sprite.prototype.update.call(this);
    };

    Puker.prototype.getCollidables = function () {
        return this.missiles.children;
    };

    Puker.prototype.use = function (direction) {
        if (!this.canUse()) return;
        
        var missile = this.missiles.getFirstDead(true, this.parent.x+(this.x*this.parent.scale.x), this.parent.y+this.y);
        game.world.bringToTop(this.missiles);
        missile.fire(this.parent.facing, this.parent.body.velocity);
        this.useTimeout = game.time.now;
    };

    Puker.prototype.canUse = function () {
        if (game.time.now > this.useTimeout + this.useRate) {
            return true;
        } else {
            return false;
        }
    };

    Puker.prototype.onHit = function (missile, victim) {
        Weapon.prototype.onHit.call(this, 1, victim);
    };

    return Puker;
});