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
        
        this.armBalls = game.add.group();
        this.armBalls.x = this.x;
        this.armBalls.y = this.y;
        this.armBalls.createMultiple(30, 'claw-arm-ball');
        
        this.claw = new Claw(game, x, y);
        game.add.existing(this.claw);
        this.claw.x = 0;
        this.claw.y = 0;
        this.claw.kill(); // start the claw off dead

        // Whether or not this weapon is currently in use.
        this.inUse = false;

        // How often this weapon can be used (in ms)
        this.maxDistance = 200;
        this.useRate = 500;
        this.useTimer = game.time.create(false);

        game.physics.enable(this);
        this.body.immovable = true;
        this.body.allowGravity = false;
        
        // Whether this is anchored into a target
        this.clawAnchor = null;
        this.clawObjectHeld = null;
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
        if(self.inUse) {
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
                console.log(this.clawAnchor);
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
            // Not anchored yet, so pull 
            else if (distanceBetween >= this.maxDistance) {
                this.retracting = true;
            }
            
        }
        // Call up!
        Phaser.Sprite.prototype.update.call(this);
    };

    function onAttackFinish () {
        self.useTimer.stop();
        self.useTimer.removeAll();
        self.claw.kill();
        self.armBalls.callAll('kill');
        self.clawAnchor = null;
        self.clawObjectHeld = null;
        self.inUse = false;
        self.retracting = false;
    }

    ClawArm.prototype.getCollidables = function () {
        return this.claw;
    };

    ClawArm.prototype.use = function () {
        if(!self.inUse) {
            self.inUse = true;
            self.armBalls.callAll('revive');
            game.world.bringToTop(self.armBalls);
            self.claw.revive();
            game.world.bringToTop(self.claw);
            self.claw.x = self.x = self.parent.x;
            self.claw.y = self.y = self.parent.y;
            self.armBalls.setAll('x', self.x);
            self.armBalls.setAll('y', self.y);
            self.claw.fire(self.parent.facing);
        }
    };

    ClawArm.prototype.onHit = function (collidable, victim) {
        victim.damage(1, victim);
        self.clawObjectHeld = victim;
        self.retracting = true;
        
    };

    ClawArm.prototype.onHitTerrain = function (weapon, tile) {
        self.clawAnchor = tile;
    };

    return ClawArm;
});