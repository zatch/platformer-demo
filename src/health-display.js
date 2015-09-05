define([
    'phaser'
], function (Phaser) { 
    'use strict';

    var game;

    function HealthDisplay (_game, x, y, leftCapKey, middleKey, rightCapKey, fillKey) {
        game = _game;

        Phaser.Group.call(this, game);
        
        this.maxFill = 5;
        this.widthPerHealth = 2;
        
        this.leftCap = this.create(0,0,leftCapKey);
        this.middle = this.create(this.leftCap.x+this.leftCap.width,0,middleKey);
        this.rightCap = this.create(this.middle.x+this.middle.width,0,rightCapKey);
        this.setMaxHealth(this.maxFill);
        
        this.fillKey = fillKey;
        
        this.fillGroup = game.add.group();
        this.add(this.fillGroup);

        // Lock to camera
        this.fixedToCamera = true;
        this.cameraOffset.x = 20;
        this.cameraOffset.y = 20;

    }

    HealthDisplay.prototype = Object.create(Phaser.Group.prototype);
    HealthDisplay.prototype.constructor = HealthDisplay;

    HealthDisplay.prototype.updateDisplay = function (amount, total) {
        var i, sprite;
        this.fillGroup.callAll('kill');
        for(i=0; i<amount; i++) {
            sprite = this.getFirstDead();
            if(sprite) {
                sprite.revive();
            } else {
                sprite = this.fillGroup.create(0,0,this.fillKey);
            }
            sprite.x = this.middle.x + i * sprite.width;
            sprite.y = 4;
        }
    };
    
    HealthDisplay.prototype.setMaxHealth = function (amount) {
        this.maxFill = amount;
        this.middle.width = this.maxFill * this.widthPerHealth;
        this.rightCap.x = this.middle.x+this.middle.width;
    };

    return HealthDisplay;
});