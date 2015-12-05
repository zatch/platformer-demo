define([
    'phaser',
	'game-group'
], function (Phaser, GameGroup) { 
    'use strict';

    // Shortcuts
    var game, self;

    function PauseMenu (_game) {
        game = _game;
        self = this;

        // Initialize sprite
        GameGroup.call(this, game);
		
        // Lock to camera.
        this.fixedToCamera = true;
		
		this.background = new Phaser.Sprite(game, 0, 0, 'pause-background');
        this.addChild(this.background);
		
    }

    PauseMenu.prototype = Object.create(GameGroup.prototype);
    PauseMenu.prototype.constructor = PauseMenu;

	PauseMenu.prototype.enable = function () {
		this.setAll('exists', true);
		this.paused = true;
    };

	PauseMenu.prototype.disable = function () {
		this.setAll('exists', false);
		this.paused = false;
    };
    return PauseMenu;

});