define([
    'phaser',
    'utilities/state-machine'
], function (Phaser, StateMachine) { 
    'use strict';

    // Shortcuts
    var game, self;

    function Puke (_game, x, y) {

        game = _game;
        self = this;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'puke');
        this.anchor.set(0.5);

        // Set up animations.
        this.animations.add('ejecting', [0,1,2,3], 15);
        this.animations.add('flying', [4,5,6], 15);
        this.animations.add('landing', [7,8], 15);
        this.animations.add('idle', [9,10,11], 15);
        
        // Set up automatic animation transitions.
        this.animations.getAnimation('ejecting').onComplete.add(function() {
            this.animations.play('flying', null, true);
        }, this);
        this.animations.getAnimation('landing').onComplete.add(function() {
            this.animations.play('idle', null, false, true);
        }, this);
        
        this.bodyFrameData = [
            [19,11,5,1],
            [28,15,5,0],
            [33,20,8,0],
            [25,19,16,1],
            [29,20,17,8],
            [29,20,17,8],
            [29,20,17,8],
            [28,14,21,12],
            [36,8,18,18],
            [43,5,16,21],
            [43,5,16,21],
            [43,5,16,21]
        ];
        
        // Which way is the dude or dudette facing?
        this.facing = this.parent && this.parent.facing ? this.parent.facing : 'right';

        // Enable physics.
        game.physics.enable(this);
        this.body.collideWorldBounds = true;
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;

        // Initialize public properites.
        // Fastest possible movement speeds.
        this.body.maxVelocity.x = 500;
        this.body.maxVelocity.y = 10000;
        this.body.drag.x = 0;
        this.body.drag.y = 0;

        // The acceleration that is applied when moving.
        this.moveAccel = 16000;
     
        // Initial health.
        this.health = this.maxHealth = 1;
        this.fireVelocity = {x: 300, y: 200};
        
        // State machine for managing behavior states.
        StateMachine.extend(this);
        this.stateMachine.states = {
            'flying': {
                'update': this.update_flying
            },
            'idle': {
                'update': this.update_idle
            }
        };
        // Spawn in idle state.
        this.stateMachine.setState('idle');
    }

    Puke.prototype = Object.create(Phaser.Sprite.prototype);
    Puke.prototype.constructor = Puke;
    
    Puke.prototype.update = function () {

        // Adjust body to match animation frame.
        var bfd = this.bodyFrameData[this.animations.frame];
        this.body.setSize(bfd[0],
                          bfd[1],
                          bfd[2]*this.anchor.x*this.scale,
                          bfd[3]*this.anchor.y);

        // Apply behaviors.
        if(this.alive && !this.dying && !this.invulnerable) {
            this.stateMachine.handle('update');
        }

        // Update direction
        if (this.facing === 'right') {
            this.scale.x = 1; //facing default direction
        }
        else {
            this.scale.x = -1; //flipped
        }
        
        // Call up!
        Phaser.Sprite.prototype.update.call(this);
    };

    Puke.prototype.update_flying = function () {
        if (this.body.blocked.down) {
            this.animations.play('landing');
            this.stateMachine.setState('idle');
        }
    };
    
    Puke.prototype.update_idle = function () {
        this.body.velocity.x = 0;
    };

    Puke.prototype.fire = function (direction, initialVelocity) {
        this.facing = direction;
        
        if (this.facing === 'left') {
            this.body.velocity.x = -this.fireVelocity.x + initialVelocity.x;
        }
        else {
            this.body.velocity.x = this.fireVelocity.x + initialVelocity.x;
        }
        this.body.velocity.y = -this.fireVelocity.y;
        
        this.animations.play('ejecting');
        this.stateMachine.setState('flying');
    };

    Puke.prototype.reset = function (x, y, health) {
        // Call up!
        Phaser.Sprite.prototype.reset.call(this, x||this.x, y||this.y, health||this.maxHealth);
        
        this.stateMachine.setState('idle');
    };

    Puke.prototype.kill = function () {
        Phaser.Sprite.prototype.kill.apply(this, arguments);
    };

    return Puke;

});