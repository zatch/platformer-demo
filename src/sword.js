define([
    'phaser',
    'weapon'
], function (Phaser, Weapon) { 
    'use strict';

    var game;

    function Sword (_game, x, y) {
        game = _game;

        Weapon.call(this, game, x, y, 'sword');
        this.anchor.set(0.5);

        // Whether or not this weapon is currently in use.
        this.inUse = false;

        // How often this weapon can be used (in ms)
        this.useRate = 100;

        // Used to throttle use rate.
        this.useTimeout = 0;

        game.physics.enable(this);
        this.body.immovable = true;
        this.body.allowGravity = false;

    }

    Sword.prototype = Object.create(Weapon.prototype);
    Sword.prototype.constructor = Sword;

    Sword.prototype.update = function () {
        if(this.parent && this.parent.facing) {
            if(this.parent.facing === 'right') {
                this.frame = 0;
            }
            if(this.parent.facing === 'left') {
                this.frame = 1;
            }
        }
        Phaser.Sprite.prototype.update.call(this);
    };

    function onAttackFinish () {
        this.inUse = false;
    }

    Sword.prototype.use = function (direction) {
        if(!this.inUse) {
            this.inUse = true;
            var attackTween = game.add.tween(this);
            if(this.parent.facing === 'right') {
                attackTween.to({x: this.x + this.width}, 100, null, true, 0, 0, true);
            } else {
                attackTween.to({x: this.x - this.width}, 100, null, true, 0, 0, true);
            }
            attackTween.onComplete.addOnce(onAttackFinish, this);
        }
    };

    Sword.prototype.canUse = function () {
        if (game.time.now > this.useTimeout + this.useRate) {
            return true;
        } else {
            return false;
        }
    };

    return Sword;
});