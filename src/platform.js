define([
    'phaser'
], function (Phaser) { 
    'use strict';

    // Shortcuts
    var game;

    function Platform (_game, x, y, key, frame, properties) {
        game = _game;

        // Initialize sprite
        Phaser.Sprite.call(this, game, x, y, 'platform');

        // Enable physics.
        game.physics.enable(this);

        this.moveSpeed = 60;
        this.arrivalRadius = 1;
        this.distanceToDestination = new Phaser.Point(0,0);

        // Parse waypoints from passed data object.
        this.wayPoints = properties.wayPoints ? JSON.parse(properties.wayPoints) : [];

        // Index of the waypoint that we're currently trying to get to
        this.currentWaypoint = 0;

        // An object that holds the x/y values of the point on the map that we're
        // trying to reach.
        this.destination = new Phaser.Point(0,0);

        // Loop mode (loop, yoyo, none)
        // TODO: Actually support different loop modes.
        this.loopMode = 'loop';

        // Whether this platform is moving or not.
        this.started = false;
        
        this.body.allowGravity = false;
        this.body.immovable = true;
        this.body.checkCollision.down = false;
        this.body.checkCollision.left = false;
        this.body.checkCollision.right = false;
        
    }

    Platform.prototype = Object.create(Phaser.Sprite.prototype);
    Platform.prototype.constructor = Platform;

    Platform.prototype.update = function () {

        this.destination.x = this.wayPoints[this.currentWaypoint][0];
        this.destination.y = this.wayPoints[this.currentWaypoint][1];

        // If we have a destination...
        if(this.destination && this.started) {

            // Move toward our this.destination
            game.physics.arcade.moveToXY(this, this.destination.x, this.destination.y, this.moveSpeed);

            // If we're within the minimum distance, move on to the next waypoint.
            Phaser.Point.subtract(this.destination, this.position, this.distanceToDestination);

            if(Math.abs(this.distanceToDestination.getMagnitude()) < this.arrivalRadius) {
                this.nextWaypoint();
            }
        }

        Phaser.Sprite.prototype.update.call(this);
    };

    Platform.prototype.nextWaypoint = function () {
        this.currentWaypoint++;
        if(this.currentWaypoint > this.wayPoints.length - 1) {
            this.currentWaypoint = 0;
        }
    };

    Platform.prototype.start = function () {
        this.started = true;
    };

    Platform.prototype.stop = function () {
        this.started = false;
        this.body.velocity.set(0);
    };

    return Platform;

});