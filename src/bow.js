define([
    'phaser',
    'weapon',
    'arrow'
], function (Phaser, Weapon, Arrow) { 
    'use strict';

    var game;

    function Bow (_game, x, y) {
        game = _game;

        Weapon.call(this, game, x, y, 'sword', 1);
        this.anchor.set(0.5);

        this.missiles = game.add.group();
        this.missiles.x = 0;
        this.missiles.y = 0;
        this.missiles.classType = Arrow;

        // Whether or not this weapon is currently in use.
        this.inUse = false;

        // How often this weapon can be used (in ms)
        this.useRate = 300;
        this.useTimer = game.time.create(false);
        this.useTimer.start(); 

        // Used to throttle use rate.
        this.useTimeout = 0;

        game.physics.enable(this);
        this.body.immovable = true;
        this.body.allowGravity = false;

    }

    Bow.prototype = Object.create(Weapon.prototype);
    Bow.prototype.constructor = Bow;

    Bow.prototype.update = function () {
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

    Bow.prototype.getCollidables = function () {
        return this.missiles;
    };

    Bow.prototype.use = function (direction) {
        var missile;
        if(!this.inUse) {
            this.inUse = true;
            missile = this.missiles.getFirstDead();
            if(missile){
                missile.revive();
            } else {
                missile = this.missiles.create(this.x, this.y);
            }
            game.world.bringToTop(this.missiles);
            missile.x = this.parent.x;
            missile.y = this.parent.y;
            missile.fire(this.parent.facing);
            this.useTimer.add(this.useRate, onAttackFinish, this);
        }
    };

    Bow.prototype.canUse = function () {
        if (game.time.now > this.useTimeout + this.useRate) {
            return true;
        } else {
            return false;
        }
    };

    Bow.prototype.onHit = function (missile, victim) {
        console.log('hit');
        missile.kill();
        victim.damage(1, victim);
    };

    return Bow;
});