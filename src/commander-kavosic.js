define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game, self;

    function CommanderKavosic (_game, x, y) {
        game = _game;
        self = this;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'commander-kavosic');
        this.anchor.set(0.5);

        // Enable physics.
        game.physics.enable(this);
        this.body.collideWorldBounds = true;

        // Speach
        this.phrases = {
            "intro-to-movement": "Use the left joystick (gamepad) or arrows keys (keyboard) to get movin', soldier!"
        };
        this.currentPhrase = this.phrases["intro-to-movement"];
        this.fontStyle = {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            stroke: '#FCFF00',
            wordWrapWidth: 120,
            wordWrap: true
        };
        this.dialog = new Phaser.Text(game, 0, 0, this.currentPhrase, this.fontStyle);
        this.dialog.anchor.set(0.5, 1.2);
        
        // AI
        this.addChild(this.dialog);
        this.facing = 'right';
    }
    
    CommanderKavosic.prototype = Object.create(Phaser.Sprite.prototype);
    CommanderKavosic.prototype.constructor = CommanderKavosic;

    CommanderKavosic.prototype.update = function () {
        // Update direction
        if (this.facing === 'right') {
            this.scale.x = 1; //facing default direction
        }
        else {
            this.scale.x = -1; //flipped
        }
        
        // Update dialog text
        if (this.dialog.text !== this.currentPhrase) {
            this.dialog.setText(this.currentPhrase);
        }

        // Call up!
        Phaser.Sprite.prototype.update.call(this);
    };
    
    CommanderKavosic.prototype.handleTrigger = function (properties) {
        for (var key in properties) {
            if (!isNaN(properties[key])) {
                self[key] = Number(properties[key]);
            }
            else if (properties[key] === "true") {
                self[key] = true;
            }
            else if (properties[key] === "false") {
                self[key] = false;
            }
            else {
                self[key] = properties[key];
            }
            
        }
    };
    
    return CommanderKavosic;

});