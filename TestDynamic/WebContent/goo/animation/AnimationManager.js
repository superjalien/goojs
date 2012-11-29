define(['goo/animation/AnimationLayer', 'goo/animation/clip/AnimationClipInstance'], function(AnimationLayer, AnimationClipInstance) {
	"use strict";

	/**
	 * @name AnimationManager
	 * @class
	 *       <p>
	 *       AnimationManager describes and maintains an animation system. It tracks one or more layered animation state machines (AnimationLayer) and
	 *       uses their combined result to update one or more poses (via a set AnimationApplier.) AnimationClips used in these layers are instanced
	 *       and tracked specifically for this manager.
	 *       </p>
	 *       <p>
	 *       By default, an animation manager has a single base animation layer. Other layers may be added to this. It is important that the base
	 *       layer (the layer at index 0) always has a full set of data to put a skeleton pose into a valid state.
	 *       </p>
	 * @param {Timer} globalTimer the timer to use for global time keeping.
	 * @param {SkeletonPose} pose a pose to update. Optional if we won't be animating a skinmesh.
	 */
	function AnimationManager(globalTimer, pose) {
		this.globalTimer = globalTimer;

		this.layers = [];
		this.applier = null; // animationapplier
		this.clipInstances = {}; // Map<AnimationClip, AnimationClipInstance>

		this.updateRate = 1.0 / 60.0;
		this.lastUpdate = 0.0;

		// add our base layer
		var layer = new AnimationLayer(AnimationLayer.BASE_LAYER_NAME);
		layer.manager = this;
		this.layers.push(layer);

		this.applyToPoses = [];
		if (pose) {
			this.applyToPoses.push(pose);
		}

		// this.valuesStore.setLogOnReplace(false);
		// this.valuesStore.setDefaultValue(0.0);
	}

	/**
	 * Move associated layers forward to the current global time and then apply the associated animation data to any SkeletonPoses set on the manager.
	 */
	AnimationManager.prototype.update = function() {
		// grab current global time
		var globalTime = this.globalTimer.getTimeInSeconds();

		// check throttle
		if (this.updateRate !== 0.0) {
			if (globalTime - this.lastUpdate < this.updateRate) {
				return;
			}

			// we subtract a bit to maintain our desired rate, even if there are some gc pauses, etc.
			this.lastUpdate = globalTime - (globalTime - this.lastUpdate) % this.updateRate;
		}

		// move the time forward on the layers
		for ( var i = 0; i < this.layers.length; ++i) {
			var layer = this.layers[i];
			var state = layer.currentState;
			if (state) {
				state.update(globalTime, layer);
			}
		}

		// call apply on blend module, passing in pose
		if (this.applyToPoses.length > 0) {
			for ( var i = 0; i < this.applyToPoses.length; ++i) {
				var pose = this.applyToPoses[i];
				this.applier.applyTo(pose, this);
			}
		}

		// apply for non-pose related assets
		// this.applier.apply(S_sceneRoot, this);

		// post update to clear states
		for ( var i = 0; i < this.layers.length; ++i) {
			var layer = this.layers[i];
			var state = layer.currentState;
			if (state) {
				state.postUpdate(layer);
			}
		}
	};

	/**
	 * Retrieve and track an instance of an animation clip to be used with this manager.
	 * 
	 * @param clip the clip to instance.
	 * @return our new clip instance.
	 */
	AnimationManager.prototype.getClipInstance = function(clip) {
		var instance = this.clipInstances[clip];
		if (!instance) {
			instance = new AnimationClipInstance();
			instance._startTime = this.globalTimer.getTimeInSeconds();
			this.clipInstances[clip] = instance;
		}

		return instance;
	};

	AnimationManager.prototype.getCurrentSourceData = function() {
		// set up our layer blending.
		for ( var i = 0; i < this.layers.length - 1; i++) {
			var layerA = this.layers[i];
			var layerB = this.layers[i + 1];
			layerB.updateLayerBlending(layerA);
		}

		return this.layers[this.layers.length - 1].getCurrentSourceData();
	};

	return AnimationManager;
});