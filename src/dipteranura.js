define([
    'phaser',
    'health-powerup',
    'egg-sac',
    'utilities/state-machine'
], function (Phaser, HealthPowerup, EggSac, StateMachine) { 
    'use strict';

    // Shortcuts
    var game, self;

    function Dipteranura (_game, x, y) {

        game = _game;
        self = this;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'dipteranura');
        this.anchor.set(0.5);

        this.animations.add('idle', [0], 10);
        this.animations.add('hopping', [1,2,3,4,5,6,7], 10);
        this.animations.add('vomiting', [8,9,8,9,8,9,9,10,11,12], 10);
        
        // Which way is the dude or dudette facing?
        this.facing = 'right';

        // Enable physics.
        game.physics.enable(this);
        this.body.collideWorldBounds = true;
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;

        // Initialize public properites.
        // Fastest possible movement speeds.
        this.body.maxVelocity.x = 100;
        this.body.maxVelocity.y = 10000;
        this.body.drag.x = 800;
        this.body.drag.y = 0;

        // The acceleration that is applied when moving.
        this.moveAccel = 16000;
     
        // Initial health.
        this.health = this.maxHealth = 3;

        // Invulnerability
        this.invulnerable = false;
        this.invulnerableTimer = 0;

        // Knockback
        this.knockback = new Phaser.Point();
        this.knockbackTimeout = game.time.now;

        // Signals
        this.events.onHeal = new Phaser.Signal();
        this.events.onDamage = new Phaser.Signal();
        this.events.onDeath = new Phaser.Signal();
        this.events.onDrop = new Phaser.Signal();
        this.events.onSpawnChild = new Phaser.Signal();

        // AI
        this.canVomit = true;
        this.restDuration = 1000;
        this.restFulfilledTime = game.time.now;
		this.lineOfSight = new Phaser.Line();
        this.vomitRange = 175;
        
        // Missiles
        this.missiles = game.add.group();
        this.missiles.x = 0;
        this.missiles.y = 0;
        this.missiles.classType = EggSac;
        
        // State machine for managing behavior states.
        StateMachine.extend(this);
        this.stateMachine.onStateChange.add(this.onSelfChangeState);
        this.stateMachine.states = {
            'idle': {
                'update': this.update_idle
            },
            'hopping': {
                'update': this.update_hopping
            },
            'vomiting': { 
                'update': this.update_vomiting
            }
        };
        // Spawn in idle state.
        this.stateMachine.setState('idle');
        
        // Assets for killing enemy when it goes off screen for a given period
        // of time.
        this.offCameraKillTimer = game.time.create(false);
        this.offCameraKillTimer.start(); 
        
    }

    function onBlinkLoop (){
        if(game.time.now - this.invulnerableTimer > 500) {
            this.blinkTween.start(0);
            this.blinkTween.pause();
            this.invulnerable = false;
            this.alpha = 1;
            if (!this.alive) {
                this.kill();
            }
        }
    }

    Dipteranura.prototype = Object.create(Phaser.Sprite.prototype);
    Dipteranura.prototype.constructor = Dipteranura;

    Dipteranura.prototype.update = function () {
        
        // Don't move unless acceleration is actively applied.
        this.stopMoving();

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
        
        if (this.alive) {
            if (!this.inCamera) {
                // Auto-kill if off camera for too long.
                this.offCameraKillTimer.add(2000, this.kill, this);
            }
            else {
                // Cancel auto-kill if returned to the camera.
                this.offCameraKillTimer.removeAll();
            }
        }
    };
    
    /*
     * For whatever reason, variables adjusted on 'self' in this event handler
     * can't be referenced from 'this' in other areas of the class. Probably
     * some sort of weird scoping issue. As a workaround, you can read these
     * properties from 'self' elsewhere, which seems to work fine. Thoughts?
     */
    Dipteranura.prototype.onSelfChangeState = function (sm, stateName) {
        if (stateName === 'idle') {
            self.restFulfilledTime = game.time.now + self.restDuration;
        }
    };
    
    Dipteranura.prototype.update_idle = function () {
        
        this.animations.play('idle');
        
        // Honor resting when idle.
        if(self.restFulfilledTime > game.time.now) return; // Use 'self' here as workaround to event handler scoping issue.
        
        // Hop til you vomit!
        if (this.shouldVomit()) {
            // Reset flags.
            this.canVomit = true;
            
            this.stateMachine.setState('vomiting');
        }
        else {
            this.stateMachine.setState('hopping');
        }
    };

    Dipteranura.prototype.update_hopping = function () {
        // Temporarily disable input after knockback.
        // if(this.knockbackTimeout > game.time.now) return;
        
        this.animations.play('hopping');
        
        if (this.body.blocked.left) {
            this.facing = 'right';
        }
        if (this.body.blocked.right) {
            this.facing = 'left';
        }
        
        if (this.facing === 'left') {
            this.body.acceleration.x = -this.moveAccel;
        }
        else {
            this.body.acceleration.x = this.moveAccel;
        }
        
        if (this.animations.frame === 6) {
            this.body.acceleration.x = 0;
            this.body.velocity.x = 0;
            this.stateMachine.setState('idle');
        }
    };

    Dipteranura.prototype.update_vomiting = function () {
        // Temporarily disable input after knockback.
        // if(this.knockbackTimeout > game.time.now) return;
        
        this.animations.play('vomiting');
        
        if (this.animations.frame === 10) {
            this.vomit();
        }
        if (this.animations.frame === 12) {
            this.stateMachine.setState('idle');
        }
    };

    Dipteranura.prototype.vomit = function () {
        if (this.canVomit) {
            var missile = this.missiles.getFirstDead();
            if(missile){
                missile.reset(this.x, this.y);
            } else {
                missile = this.missiles.create(this.x, this.y);
            }
    
            game.world.bringToTop(this.missiles);
            missile.x = this.x;
            missile.y = this.y;
            
            missile.fire(this.facing);
            
            this.events.onSpawnChild.dispatch(this, missile);
            
            this.canVomit = false;
        }
    };
    
    Dipteranura.prototype.shouldVomit = function () {
        return this.canSee(game.player, this.lineOfSight) &&
               this.isFacingPlayer() &&
               Math.abs(game.player.position.x - this.position.x) <= this.vomitRange;
    };

    Dipteranura.prototype.canSee = function (target, line) {
        line.start.x = this.x;
        line.start.y = this.y;
        line.end.x = target.x;
        line.end.y = target.y;
        var tiles = game.collisionLayer.getRayCastTiles(line, null, true);

        if(tiles.length) return false;
        return true;
    };

    Dipteranura.prototype.isFacingPlayer = function () {
        if (game.player.position.x - this.position.x <= 0 && this.facing === 'left' ||
            game.player.position.x - this.position.x >= 0 && this.facing === 'right') {
            return true;
        }
        return false;
    };

    Dipteranura.prototype.facePlayer = function () {
        if (!this.isFacingPlayer()) {
            if (this.facing === 'right') {
                this.facing = 'left';
            }
            else {
                this.facing = 'right';
            }
        }
    };

    Dipteranura.prototype.revive = function () {
        // Call up!
        Phaser.Sprite.prototype.revive.call(this, this.maxHealth);
        
        this.body.checkCollision.up = true;
        this.body.checkCollision.down = true;
        this.body.checkCollision.left = true;
        this.body.checkCollision.right = true;
        
        this.stateMachine.setState('idle');
        this.facePlayer();
    };

    Dipteranura.prototype.damage = function (amount, source) {

        // Can currently take damage?
        if(this.invulnerable) return;
        
        this.facePlayer();
        this.stateMachine.setState('idle');

        amount = Math.abs(amount || 1);
        this.health -= amount;
        this.events.onDamage.dispatch(this.health, amount);

        // Temporary invulnerability.
        this.invulnerable = true;
        this.invulnerableTimer = game.time.now;
        
        // Visual feedback to show player was hit and is currently invulnerable.
        this.blinkTween = game.add.tween(this);
        this.blinkTween.to({alpha: 0}, 80, null, true, 0, -1, true);
        this.blinkTween.onLoop.add(onBlinkLoop, this);

        // Knockback force
        Phaser.Point.subtract({x: this.position.x, y: this.position.y-20}, source.position, this.knockback);
        Phaser.Point.normalize(this.knockback, this.knockback);
        this.knockback.setMagnitude(500);

        // Zero out current velocity
        this.body.velocity.set(0);

        Phaser.Point.add(this.body.velocity, this.knockback, this.body.velocity);
        this.knockback.set(0);

        // Temporarily disable input after knockback.
        this.knockbackTimeout = game.time.now + 500;
        
        if (this.health <= 0) {
            this.handleDeath();
        }
    };

    Dipteranura.prototype.stopMoving = function () {
        this.body.acceleration.set(0);
    };
    
    Dipteranura.prototype.handleDeath = function () {
        this.events.onDeath.dispatch(this);

        // Drop loot.
        if (Math.random() < 0.5) {
            var healthPowerup = new HealthPowerup(game, this.x, this.y);
            this.events.onDrop.dispatch(this, healthPowerup);
        }

        this.body.checkCollision.up = false;
        this.body.checkCollision.down = false;
        this.body.checkCollision.left = false;
        this.body.checkCollision.right = false;

    };

    Dipteranura.prototype.kill = function () {
        this.dying = false;
        Phaser.Sprite.prototype.kill.apply(this, arguments);
    };

    return Dipteranura;

});