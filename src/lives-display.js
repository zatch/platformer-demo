define([
    'phaser'
], function (Phaser) { 
    'use strict';

    var game;

    function LivesDisplay (_game, x, y, lifeKey, lifeEmptyKey) {

        game = _game;

        Phaser.Group.call(this, game);

        // Current number of lives.
        this.lives = 3;

        // Max number of lives to draw (default).
        this.maxLives = 3;

        // Child groups.
        this.lives = new Phaser.Group(_game, this);
        this.emptyLives = new Phaser.Group(_game, this);

        // Lock to camera.
        this.fixedToCamera = true;
        this.cameraOffset.x = 10;
        this.cameraOffset.y = 40;

    }

    LivesDisplay.prototype = Object.create(Phaser.Group.prototype);
    LivesDisplay.prototype.constructor = LivesDisplay;

    LivesDisplay.prototype.updateDisplay = function (amount, total) {

        var i, sprite;
        this.lives.callAll('kill');
        this.emptyLives.callAll('kill');

        for(i=0; i<total; i++) {
            if(i<amount) {
                sprite = this.lives.getFirstDead(true, 0, 0, 'life');
            } else {
                sprite = this.emptyLives.getFirstDead(true, 0, 0, 'life-empty');
            }
            sprite.revive();

            sprite.x = (i * sprite.width + 5);
            sprite.y = 4;
        }

    };

    return LivesDisplay;
});