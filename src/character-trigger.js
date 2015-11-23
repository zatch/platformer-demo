define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game, self;

    function CharacterTrigger (_game, x, y) {
        game = _game;
        self = this;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'blank');

        // Enable physics.
        game.physics.enable(this);
        this.body.maxVelocity = 0;
        this.body.allowGravity = false;
    }
    
    CharacterTrigger.prototype = Object.create(Phaser.Sprite.prototype);
    CharacterTrigger.prototype.constructor = CharacterTrigger;

    CharacterTrigger.prototype.update = function () {

        // Call up!
        Phaser.Sprite.prototype.update.call(this);
    };
    
    return CharacterTrigger;

});