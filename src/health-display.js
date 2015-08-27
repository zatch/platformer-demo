define([
    'phaser'
], function (Phaser) { 
    'use strict';

    var game;

    function HealthDisplay (_game, x, y, key) {
       game = _game;

        Phaser.Group.call(this, game);

        this.healthKey = key;

        // Lock to camera
        this.fixedToCamera = true;
        this.cameraOffset.x = 20;
        this.cameraOffset.y = 20;

    }

    HealthDisplay.prototype = Object.create(Phaser.Group.prototype);
    HealthDisplay.prototype.constructor = HealthDisplay;

    HealthDisplay.prototype.updateDisplay = function (amount, total) {
        var i, sprite;
        this.callAll('kill');
        for(i=0; i<amount; i++) {
            sprite = this.getFirstDead();
            if(sprite) {
                sprite.revive();
            } else {
                sprite = this.create(0,0,this.healthKey);
            }
            sprite.x = i * (sprite.width + 20);
            sprite.y = 0;
        }
    };

    return HealthDisplay;
});