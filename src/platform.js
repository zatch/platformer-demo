define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game;

    function Platform (_game, x, y, key, frame) {
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'Platform');

        // Enable physics.
        game.physics.enable(this);
        
        this.body.allowGravity = false;
        this.body.immovable = true;
        this.body.friction.x = 5000;

        //  Create our tween. This will fade the sprite to alpha 1 over the duration of 2 seconds
        var tween = game.add.tween(this);
        tween.to( { x: this.x + (5 * 32)}, 2000, "Linear", true, 0, -1);
        tween.yoyo(true);
        
    }

    Platform.prototype = Object.create(Phaser.Sprite.prototype);
    Platform.prototype.constructor = Platform;

    return Platform;

});