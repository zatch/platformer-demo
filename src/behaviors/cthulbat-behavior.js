define(
['phaser', 'utilities/state-machine'],
function (Phaser, StateMachine) {
	
	function CthulbatBehavior (parent, huntTarget) {
		
		StateMachine.call(this);
	
		this.parent = parent;
		this.huntTarget = huntTarget || null;
		this.lineOfSight = new Phaser.Line();
		this.lineHunting = new Phaser.Line();
		this.lastSeenTarget = new Phaser.Point();
		this.distanceToTarget = new Phaser.Point();
		
		// Config
		this.distanceToHunting = 300;
		this.distanceToAttacking = 128;
	
		StateMachine.extend(this);
		this.stateMachine.states = {
			'idle': {
				'update': this.update_idle
			},
			'hunting': {
				'update': this.update_hunting
			},
			'attacking': { 
				'update': this.update_attacking
			},
			'busy': { 
				'update': this.update_busy
			}
		};
		this.stateMachine.setState('idle');
	
	}
	
	CthulbatBehavior.prototype.update = function () {
		this.stateMachine.handle('update');
	};
	
	CthulbatBehavior.prototype.update_busy = function () {
		
	};
	
	CthulbatBehavior.prototype.update_idle = function () {
		// Slow down to idle!
		this.parent.body.acceleration.divide(1.05, 1.05);
		this.parent.body.acceleration.floor();
		this.parent.body.acceleration.divide(1.05, 1.05);
		this.parent.body.acceleration.ceil();
		
		// If distance to player is <400, continue.
		Phaser.Point.subtract(this.huntTarget.position, this.parent.position, this.distanceToTarget);
		if(this.distanceToTarget.getMagnitude() < this.distanceToHunting) {
			this.stateMachine.setState('hunting');
		}
	};
	
	CthulbatBehavior.prototype.update_hunting = function () {
	
		console.log('hunting');
		
		// If I can see player
		if(this.distanceToTarget.getMagnitude() < this.distanceToHunting) {
		// -- update lastSeenTarget x and y to match player's.
			this.lastSeenTarget.x =	this.huntTarget.x;
			this.lastSeenTarget.y =	this.huntTarget.y;
		// -- If player is within attack range, switch to "attack" state.
			if(this.distanceToTarget.getMagnitude() < this.distanceToAttacking) {
				this.stateMachine.setState('attacking');
			}
	
			// In any case, move toward the player.
			Phaser.Point.subtract(this.lastSeenTarget, this.parent.position, this.distanceToTarget);
			var minDistance = 8;
			
			if(this.shouldAttack()) this.parent.attack();
		
			if(this.distanceToTarget.getMagnitude() > this.huntTarget.width / 2) {
				// Move to the enemy or where the player was last seen.
				if(this.distanceToTarget.x > minDistance) {
					this.parent.moveRight();
				} 
		
				else if(this.distanceToTarget.x < -minDistance) {
					this.parent.moveLeft();
				} 
			}
		}
	
		// Give up if the player isn't where we last saw them or they're too far away.
		else {
			this.stateMachine.setState('idle');
		}
	
		this.lineHunting.fromSprite(this.parent, this.lastSeenTarget, false);
	};
	
	CthulbatBehavior.prototype.update_attacking = function () {
		
		console.log('attacking');
	
		// -- update lastSeenTarget x and y to match player's.
		this.lastSeenTarget.x =	this.huntTarget.x;
		this.lastSeenTarget.y =	this.huntTarget.y;
	
		Phaser.Point.subtract(this.lastSeenTarget, this.parent.position, this.distanceToTarget);
		
		// Swoop!
		this.parent.game.add.tween(this.parent).to({
			x: [this.parent.x, this.huntTarget.x, this.huntTarget.x, this.parent.x+(this.parent.scale.x*200)],
			y: [this.parent.y, this.huntTarget.y+20, this.huntTarget.y+20, this.parent.y-20]
		}, 1000, Phaser.Easing.Quadratic.Out, true)
		.interpolation(function(v, k){
			return Phaser.Math.bezierInterpolation(v, k);
		})
		.onComplete.add(this.onAttackComplete, this);
		
		this.stateMachine.setState('busy');
	};
	
	CthulbatBehavior.prototype.shouldAttack = function () {
		// If the player is visible and within attack range.
		if(this.distanceToTarget.getMagnitude() < this.distanceToAttacking) return true;
	
		// ...else don't attack.
		return false;
	};
	
	CthulbatBehavior.prototype.onAttackComplete = function () {
		this.stateMachine.setState('idle');
	};
	
	return CthulbatBehavior;

});