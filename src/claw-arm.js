define([
    'phaser',
    'weapon',
    'claw'
], function (Phaser, Weapon, Claw) { 
    'use strict';

    var game, self, distancePoints, coordinatesMediumPoint;

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
        this.useRate = 500;
        this.useTimer = game.time.create(false);

        game.physics.enable(this);
        this.body.immovable = true;
        this.body.allowGravity = false;
        
        // Whether this is anchored into a target
        this.clawAnchor = null;
    }

    ClawArm.prototype = Object.create(Weapon.prototype);
    ClawArm.prototype.constructor = ClawArm;

    distancePoints = function ( xA, yA, xB, yB ){
        var xDistance = Math.abs( xA - xB );
        var yDistance = Math.abs( yA - yB );
       
        return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
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
            // Update arm ball positions
            var aBall;
            for (var lcv = 0; lcv < this.armBalls.length; lcv++) {
                aBall = this.armBalls.getChildAt(lcv);
                
                // Precalculate new position of target
                var distanceBetween = distancePoints(
                    this.claw.x,
                    this.claw.y,
                    this.parent.x,
                    this.parent.y
                );
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
            
            if (this.clawAnchor) {
                // Precalculate new position of target
                var distanceBetween = distancePoints(
                    this.claw.x,
                    this.claw.y,
                    this.parent.x,
                    this.parent.y
                );
                if (distanceBetween > 32) {
                    var clawDelta = distanceBetween / (this.useTimer.duration);
                    var newParentCoords = coordinatesMediumPoint(
                        this.claw.x,
                        this.claw.y,
                        this.parent.x,
                        this.parent.y,
                        clawDelta
                    );
                    
                    this.parent.x = this.x = newParentCoords.x;
                    this.parent.y = this.y = newParentCoords.y;
                }
                else {
                    self.clawAnchor = null;
                    onAttackFinish();
                }
                
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
        self.inUse = false;
    }
    
    function onRetractStart () {
        self.useTimer.pause();
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
            self.useTimer.add(self.useRate, onAttackFinish, self);
            self.useTimer.start();
        }
    };

    ClawArm.prototype.onHit = function (collidable, victim) {
        console.log('hit');
        onAttackFinish();
        victim.damage(1, victim);
    };

    ClawArm.prototype.onHitTerrain = function (weapon, tile) {
        console.log('hit tile');
        console.log(tile);
        self.clawAnchor = {x: tile.worldX, y: tile.worldY};
        onRetractStart();
    };

    return ClawArm;
});