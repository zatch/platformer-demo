define([
    'phaser',
    'weapon'
], function (Phaser, Weapon) { 
    'use strict';

    var game, anim;

    function Sword (_game, x, y) {
        game = _game;

        Weapon.call(this, game, x, y, 'sword-swipe');
        anim = this.animations.add('swipe', null, 60);
        anim.onComplete.add(onAttackFinish, this);
        this.anchor.y = 0.5;
        this.anchor.x = 0.25;

        // Whether or not this weapon is currently in use.
        this.inUse = false;

        // How often this weapon can be used (in ms)
        this.useRate = 100;

        // Used to throttle use rate.
        this.useTimeout = 0;

        // A list of hitbox items to use for the sword.
        this.hitboxes = game.add.group();
        this.hitboxes.enableBody = true;
        this.addChild(this.hitboxes);

        // DEBUG - ADD SOME RANDOM HITBOXES
        for(var i=0; i<10; i++) {
            this.hitboxes.create(0, 0, null);
        }

        this.hitboxes.forEach(function (hitbox) {
            hitbox.body.allowGravity = false;
            hitbox.body.moves = false;
            hitbox.body.immovable = true;
        });

        this.rightHitboxFrames = makeRightHitboxFrames(this.hitboxes);
        this.makeLeftHitboxFrames = makeLeftHitboxFrames(this.hitboxes);

        game.physics.enable(this);

        // this.body.setSize(42, 64, 16, 0);
        this.body.moves = false;
        this.body.immovable = true;
        this.body.allowGravity = false;

    }

    function makeRightHitboxFrames (hitboxes) {
        var frame4 = hitboxes.getChildAt(0);
        frame4.body.setSize(24, 16, 8, -32);

        var frame6 = hitboxes.getChildAt(1);
        frame6.body.setSize(24, 27, 8, -43);

        var frame7 = hitboxes.getChildAt(2);
        frame7.body.setSize(30, 32, 16, -16);

        var frame8 = hitboxes.getChildAt(3);
        frame8.body.setSize(30, 22, 16, 16);

        // Remember: frame keys here are 0 indexed.
        return {
            '3': frame4,
            '4': frame4,
            '5': frame6,
            '6': frame7,
            '7': frame8,
            '8': frame8,
            '9': frame8
        };
    }

    function makeLeftHitboxFrames (hitboxes) {
        var frame4 = hitboxes.getChildAt(4);
        frame4.body.setSize(24, 16, -25, -32);

        var frame6 = hitboxes.getChildAt(5);
        frame6.body.setSize(24, 27, -25, -43);

        var frame7 = hitboxes.getChildAt(6);
        frame7.body.setSize(32, 32, -50, -16);

        var frame8 = hitboxes.getChildAt(7);
        frame8.body.setSize(32, 22, -45, 16);

        // Remember: frame keys here are 0 indexed.
        return {
            '3': frame4,
            '4': frame4,
            '5': frame6,
            '6': frame7,
            '7': frame8,
            '8': frame8,
            '9': frame8
        };
    }

    Sword.prototype = Object.create(Weapon.prototype);
    Sword.prototype.constructor = Sword;

    Sword.prototype.getCollidables = function () {
        if(!this.inUse) return null;
        var hitbox;
        if(this.parent.facing == 'right') {
            hitbox = this.rightHitboxFrames[anim.currentFrame.index];
        } else {
            hitbox = this.makeLeftHitboxFrames[anim.currentFrame.index];
        }
        if(hitbox) return hitbox;
        return null;  
    };

    Sword.prototype.update = function () {

        if(this.parent && this.parent.facing) {
            if(this.parent.facing === 'right') {
                 // this.frame = 0;
                 this.scale.x = 1;
            }
            if(this.parent.facing === 'left') {
                // this.frame = 1;
                this.scale.x = -1;
            }
        }
        Phaser.Sprite.prototype.update.call(this);
    };

    /*Sword.prototype.postUpdate = function () {
        this.body.x = this.parent.x;
        this.body.y = this.parent.y - this.body.height / 2;
    };*/

    function onAttackFinish () {
        this.inUse = false;
    }

    Sword.prototype.use = function (direction) {
        if(!this.inUse) {
            this.inUse = true;
            var attackTween = game.add.tween(this);
            if(this.parent.facing === 'right') {
                anim.play(); // attackTween.to({x: this.x + this.width}, 50, null, true, 0, 0, true);
            } else {
                anim.play(); // attackTween.to({x: this.x - this.width}, 50, null, true, 0, 0, true);
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

    Weapon.prototype.onHit = function (weapon, victim) {
        victim.damage(1, victim);
    };

    return Sword;
});