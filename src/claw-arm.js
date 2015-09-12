define([
    'phaser',
    'weapon',
    'claw'
], function (Phaser, Weapon, Claw) { 
    'use strict';

    var game, self, distanceBetweenPoints, angleBetweenPoints, coordinatesMediumPoint;

    function ClawArm (_game, x, y) {
        game = _game;
        self = this;

        Weapon.call(this, game, x, y);
        this.anchor.set(0.5);
        
        this.armBalls = game.add.group();
        this.armBalls.x = this.x;
        this.armBalls.y = this.y;
        this.armBalls.createMultiple(30, 'claw-arm-ball');
        
        this.claw = new Claw(game, x, y);
        game.add.existing(this.claw);
        this.claw.kill(); // start the claw off dead

        // Flags
        this.inUse = false;
        this.retracting = false;
        this.clawAnchor = null;
        this.clawObjectHeld = null;

        // How often this weapon can be used (in ms)
        this.maxDistance = 200;

        game.physics.enable(this);
        this.body.immovable = true;
        this.body.allowGravity = false;
    }

    ClawArm.prototype = Object.create(Weapon.prototype);
    ClawArm.prototype.constructor = ClawArm;

    distanceBetweenPoints = function ( point1, point2 ){
        var xDistance = Math.abs( point1.x - point2.x );
        var yDistance = Math.abs( point1.y - point2.y );
       
        return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
    };
    
    angleBetweenPoints = function ( point1, point2 ){
        return Math.atan2( ( point2.y - point1.y ), ( point2.x - point1.x ) );
    };
    
    coordinatesMediumPoint = function( xA, yA, xB, yB, distanceAC ){
        var angleAB     = Math.atan2( ( yB - yA ), ( xB - xA ) );
        var deltaXAC    = distanceAC * Math.cos( angleAB );
        var deltaYAC    = distanceAC * Math.sin( angleAB );
        
        var xC          = xA + deltaXAC;
        var yC          = yA + deltaYAC;
       
        return { x: xC, y: yC };
    };
    
    ClawArm.prototype.update = function () {
        if(this.inUse) {
            // Precalculate new position of target
            var angle = angleBetweenPoints(this.claw, this.parent),
                distanceBetween = distanceBetweenPoints(this.claw, this.parent);
            
            // Update arm ball positions
            var aBall;
            for (var lcv = 0; lcv < this.armBalls.length; lcv++) {
                aBall = this.armBalls.getChildAt(lcv);
                
                var clawDelta = distanceBetween / (this.armBalls.length / lcv);
                var armBallCoords = coordinatesMediumPoint(
                    this.claw.x,
                    this.claw.y,
                    this.parent.x,
                    this.parent.y,
                    clawDelta
                );
                
                aBall.x = armBallCoords.x;
                aBall.y = armBallCoords.y;
            }
            
            
            // Handle current state of action.
            
            // Pull the user to the claw.
            if (this.clawAnchor) {
                if (distanceBetween > 20) {
                    this.parent.body.velocity.x = Math.cos(angle) * -700;
                    this.parent.body.velocity.y = Math.sin(angle) * -700;
                }
                else {
                    onAttackFinish();
                }
            }
            // Pull the claw to the user.
            else if (this.retracting) {
                if (distanceBetween < 20) {
                    onAttackFinish();
                }
                else {
                    this.claw.body.velocity.x = Math.cos(angle) * 700;
                    this.claw.body.velocity.y = Math.sin(angle) * 700;
                    
                    if (this.clawObjectHeld) {
                        this.clawObjectHeld.x = this.claw.x;
                        this.clawObjectHeld.y = this.claw.y;
                    }
                }
            }
            // Not anchored yet, so start pulling the claw in to the player.
            else if (distanceBetween >= this.maxDistance) {
                // Set flag.
                this.retracting = true;
            }
            
        }
        // Call up!
        Phaser.Sprite.prototype.update.call(this);
    };

    function onAttackFinish () {
        // Clear flags.
        self.clawAnchor = null;
        self.clawObjectHeld = null;
        self.inUse = false;
        self.retracting = false;
        
        // Kill the claw and arm balls.
        self.claw.kill();
        self.armBalls.callAll('kill');
    }

    ClawArm.prototype.getCollidables = function () {
        return this.claw;
    };

    ClawArm.prototype.use = function () {
        if(!self.inUse) {
            // Set flag.
            self.inUse = true;
            
            // Reset arm balls.
            self.armBalls.callAll('revive');
            game.world.bringToTop(self.armBalls);
            self.armBalls.setAll('x', self.parent.x);
            self.armBalls.setAll('y', self.parent.y);
            
            // Reset claw and fire it!
            self.claw.reset(self.parent.x, self.parent.y);
            game.world.bringToTop(self.claw);
            self.claw.fire(self.parent.facing);
        }
    };

    ClawArm.prototype.onHit = function (collidable, victim) {
        if (self.inUse && !self.clawObjectHeld && !self.clawAnchor && !self.retracting) {
            // Do some damage to the victim.
            victim.damage(1, victim);
            
            // Set flags.
            self.clawObjectHeld = victim;
            self.retracting = true;
        }
        
    };

    ClawArm.prototype.onHitTerrain = function (weapon, tile) {
        if (self.inUse && !self.clawObjectHeld && !self.clawAnchor && !self.retracting) {
            // Set flag.
            self.clawAnchor = {x: tile.worldX, y: tile.worldY};
        }
    };

    return ClawArm;
});