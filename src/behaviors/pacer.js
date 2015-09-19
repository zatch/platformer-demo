define(
['phaser', 'utilities/state-machine'],
function (Phaser, StateMachine) {
	
	function Pacer (parent, huntTarget) {
		
		StateMachine.call(this);

		this.parent = parent;

		StateMachine.extend(this);
		this.stateMachine.states = {
			'idle': {
				'update': this.update_idle
			},
			'pacing': {
				'update': this.update_pacing
			}
		};
		this.stateMachine.setState('pacing');

	}

	Pacer.prototype.update = function () {
		this.stateMachine.handle('update');
	};

	Pacer.prototype.update_idle = function () {

    };

    Pacer.prototype.update_pacing = function () {
		
		if(this.parent.facing === 'left') {
			if (this.parent.body.blocked.left) {
				this.parent.moveRight();
			}
			else {
				this.parent.moveLeft();
			}
		}
		else if(this.parent.facing === 'right'){
			if (this.parent.body.blocked.left) {
				this.parent.moveLeft();
			}
			else {
				this.parent.moveRight();
			}
		}
    };

	return Pacer;

});