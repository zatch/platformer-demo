define(
['phaser'], 
function (Phaser) {
	
	function StateMachine () {
		this.currentState = null;
		this.states = {};
		this.onStateChange = new Phaser.Signal();
		this.onHandle = new Phaser.Signal();
	}

	StateMachine.extend = function (parent) {
		var sm = parent.stateMachine = new StateMachine();
		sm.parent = parent;
	};

	StateMachine.prototype.setState = function (name) {
		if (!this.states[name]) throw ('State "' + name + '" does not exist.');
		this.currentState = name;
		this.onStateChange.dispatch(this, name);
	};

	StateMachine.prototype.getState = function () {
		return this.currentState;
	};

	StateMachine.prototype.handle = function (method) {
		if(typeof this.states[this.currentState][method] === 'function') {
			var args = Array.prototype.slice.call(arguments, 1);
			this.states[this.currentState][method].call(this.parent || this, args);
			this.onHandle.dispatch(this, method);
		}
	};

	return StateMachine;

});