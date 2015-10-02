define(
['phaser', 'utilities/state-machine'],
function (Phaser, StateMachine) {
	
	function Hunter (parent, huntTarget) {
		
		StateMachine.call(this);
	
		this.parent = parent;
		this.huntTarget = huntTarget || null;
		this.lineOfSight = new Phaser.Line();
		this.lineHunting = new Phaser.Line();
		this.lastSeenTarget = new Phaser.Point();
		this.distanceToTarget = new Phaser.Point();
		
		// Config
		this.distanceToHunting = 256;
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
			}
		};
		this.stateMachine.setState('idle');
	
	}
	
	Hunter.prototype.update = function () {
		this.stateMachine.handle('update');
	};
	
	Hunter.prototype.update_idle = function () {
		// If distance to player is <400, continue.
		Phaser.Point.subtract(this.huntTarget.position, this.parent.position, this.distanceToTarget);
		if(this.distanceToTarget.getMagnitude() < this.distanceToHunting) {
			// If I can see player, switch to "hunting" state.
			if(this.parent.canSee(this.huntTarget, this.lineOfSight)) this.stateMachine.setState('hunting');
		}
	
	};
	
	Hunter.prototype.update_hunting = function () {
	
		console.log('hunting');
	
		// Cache LoS result.
		var canSee = this.parent.canSee(this.huntTarget, this.lineOfSight);
	
		// If I can see player
		if(canSee && this.distanceToTarget.getMagnitude() < this.distanceToHunting) {
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
			
			if(this.shouldJump()) this.parent.jump();
		
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
	
	Hunter.prototype.update_attacking = function () {
		
		console.log('attacking');
	
		// Cache LoS result.
		var canSee = this.parent.canSee(this.huntTarget, this.lineOfSight);
	
		// If I can see player
		if(canSee) {
		// -- update lastSeenTarget x and y to match player's.
			this.lastSeenTarget.x =	this.huntTarget.x;
			this.lastSeenTarget.y =	this.huntTarget.y;
		} else {
			this.stateMachine.setState('hunting');
			return;
		}
	
		Phaser.Point.subtract(this.lastSeenTarget, this.parent.position, this.distanceToTarget);
	
		// If I can see the player
		if(canSee && this.distanceToTarget.getMagnitude() < this.distanceToAttacking) {
			// -- Move toward the player
			if(this.distanceToTarget.x > 0) {
				this.parent.moveRight();
			} else {
				this.parent.moveLeft();
			}
	
			// -- If within attack range, add chance to jump
			if(this.shouldJump()) this.parent.jump();
	
		}
		// Else switch to "hunting" state.
		else {
			this.stateMachine.setState('hunting');
		}
	};
	
	Hunter.prototype.shouldJump = function () {
		// If the player is higher than enemy and enemy...
		if((this.lastSeenTarget && this.lastSeenTarget.y+this.huntTarget.height < this.parent.position.y+this.parent.height ||
	
		// and if player is within attack range, there is a 5% change enemy will jump;
		this.distanceToTarget.getMagnitude() < this.distanceToAttacking) && Math.random() < 0.05) return true;
	
		// ...else don't jump.
		return false;
	};
	
	return Hunter;

});