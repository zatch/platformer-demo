define([
    'phaser'
], function (Phaser) { 
    'use strict';

    var game;

    function KarmaDisplay (_game, x, y, leftCapKey, middleKey, rightCapKey, fillKey) {
        game = _game;

        Phaser.Group.call(this, game);
        
        this.minFill = -5;
        this.maxFill = 5;
        this.widthPerKarma = 2;
        
        this.leftCap = this.create(0,0,leftCapKey);
        this.middle = this.create(this.leftCap.x+this.leftCap.width,0,middleKey);
        this.rightCap = this.create(this.middle.x+this.middle.width,0,rightCapKey);
        this.setMinKarma(this.minFill);
        this.setMaxKarma(this.maxFill);
        
        this.fillKey = fillKey;
        
        this.fillGroup = game.add.group();
        this.add(this.fillGroup);

        // Lock to camera
        this.fixedToCamera = true;
        this.cameraOffset.x = 20;
        this.cameraOffset.y = 40;

    }

    KarmaDisplay.prototype = Object.create(Phaser.Group.prototype);
    KarmaDisplay.prototype.constructor = KarmaDisplay;

    KarmaDisplay.prototype.updateDisplay = function (amount, total) {
        var i, sprite,
            direction = amount >= 0 ? 1 : -1;
        this.fillGroup.callAll('kill');
        for(i=0; i<=Math.abs(amount); i++) {
            sprite = this.getFirstDead();
            if(sprite) {
                sprite.revive();
            } else {
                sprite = this.fillGroup.create(0,0,this.fillKey);
            }
            sprite.x = this.middle.x
                        + (this.middle.width / 2)
                        - (this.widthPerKarma / 2)
                        + (i * sprite.width * direction);
            sprite.y = 4;
        }
    };
    
    KarmaDisplay.prototype.setMaxKarma = function (amount) {
        this.maxFill = amount;
        this._updateWidth();
    };
    
    KarmaDisplay.prototype.setMinKarma = function (amount) {
        this.minFill = amount;
        this._updateWidth();
    };
    
    KarmaDisplay.prototype._updateWidth = function() {
        this.middle.width = this.widthPerKarma +
                            this.maxFill * this.widthPerKarma +
                            Math.abs(this.minFill) * this.widthPerKarma;
        this.rightCap.x = this.middle.x + this.middle.width;
    };

    return KarmaDisplay;
});