define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/loaders/JsonUtils',
	'goo/util/PromiseUtil',
	'goo/fsmpack/statemachine/State',
	'goo/fsmpack/statemachine/Machine',
	'goo/fsmpack/statemachine/actions/Actions',
	'goo/util/rsvp',
	'goo/loaders/DynamicLoader'
], function(
	ConfigHandler,
	JsonUtils,
	PromiseUtil,
	State,
	Machine,
	Actions,
	RSVP,
	DynamicLoader
) {
	'use strict';

	function MachineHandler() {
		ConfigHandler.apply(this, arguments);
		this._objects = {};
	}

	MachineHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('machine', MachineHandler);
	DynamicLoader.registerJSON('machine');

	MachineHandler.prototype.remove = function(ref) {
		var machine = this._objects[ref];
		if (machine) {
			machine.removeFromParent();
		}
		delete this._objects[ref];
	};

	MachineHandler.prototype._updateActions = function(state, stateConfig) {
		// first remove actions that are only in the machine
		for (var i = 0; i < state._actions.length; i++) {
			var action = state._actions[i];
			var exists = stateConfig.actions.some(function(actionConfig) {
				return actionConfig.id === action.id;
			});
			if (!exists) { state._actions.splice(i, 1); i--; }
		}

		// update existing actions or add new ones
		for (var j = 0; j < stateConfig.actions.length; j++) {
			var actionConfig = stateConfig.actions[j];
			var action = state.getAction(actionConfig.id);

			if (action === undefined) {
				// New action
				var ActionClass = Actions.actionForType(actionConfig.type);
				if (ActionClass instanceof Function) {
					action = new ActionClass(actionConfig.id, actionConfig.options);
					state.addAction(action);
				}
			}
			else {
				// Update properties on existing action
				action.configure(actionConfig.options);
			}
		}
	};

	MachineHandler.prototype._updateTransitions = function(realState, stateConfig) {
		// remove all existing transitions first?
		var transitions = stateConfig.transitions;
		for (var i = 0; i < transitions.length; i++) {
			var transition = transitions[i];
			realState.setTransition(transition.id, transition.targetState);
		}
	};

	MachineHandler.prototype._updateState = function(realMachine, stateConfig) {
		var realState = realMachine._states ? realMachine._states[stateConfig.id] : undefined;
		if (realState === undefined) {
			realState = new State(stateConfig.id);
			realMachine.addState(realState);
		}
		realState.name = stateConfig.name;
		this._updateActions(realState, stateConfig);
		this._updateTransitions(realState, stateConfig);

		var that = this;
		function update(ref) {
			return that.getConfig(ref).then(function(config) {
				return that.updateObject(ref, config);
			});
		}

		// machine refs
		var promises = [];
		for (var j = 0; j < stateConfig.machineRefs.length; j++) {
			var machineRef = stateConfig.machineRefs[j];
			promises.push(update(machineRef));
		}

		if (promises.length > 0) {
			return RSVP.all(promises).then(function(realMachines) {
				realMachines.forEach(function(realMachine) {
					realState.addMachine(realMachine);
				});
			});
		}
		else {
			return PromiseUtil.createDummyPromise(realState);
		}
	};

	MachineHandler.prototype.update = function(ref, config) {
		var realMachine = this._objects[ref];
		if (!realMachine) {
			realMachine = this._objects[ref] = new Machine(config.name);
		}

		realMachine.setInitialState(config.initialState);

		// remove states that are on the machine and not in the config
		if (realMachine._states) {
			var stateKeys = Object.keys(realMachine._states);
			for (var i = 0; i < stateKeys.length; i++) {
				var realState = realMachine._states[stateKeys[i]];
				var exists = config.states.some(function(stateConfig) {
					return stateConfig.id === realState.uuid;
				});
				if (!exists) { realMachine.removeState(realState.uuid); }
			}
		}

		// states
		var promises = [];
		for (var i = 0; i < config.states.length; i++) {
			promises.push(this._updateState(realMachine, config.states[i]));
		}

		// vars
		// ...

		return RSVP.all(promises).then(function() {
			return realMachine;
		});
	};

	return MachineHandler;
});