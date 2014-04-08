var AREPhysics;

AREPhysics = (function() {
  AREPhysics.velIterations = 6;

  AREPhysics.posIterations = 2;

  AREPhysics.frameTime = 1.0 / 60.0;

  AREPhysics._gravity = new cp.v(0, 1);

  AREPhysics._stepIntervalId = null;

  AREPhysics._world = null;

  AREPhysics._densityRatio = 1 / 10000;

  AREPhysics.bodyCount = 0;

  AREPhysics.benchmark = false;

  function AREPhysics() {
    throw new Error("Physics constructor called");
  }

  AREPhysics.startStepping = function() {
    var avgStep, stepCount;
    if (this._stepIntervalId !== null) {
      return;
    }
    this._world = new cp.Space;
    this._world.gravity = this._gravity;
    this._world.iterations = 60;
    this._world.collisionSlop = 0.5;
    this._world.sleepTimeThreshold = 0.5;
    ARELog.info("Starting world update loop");
    avgStep = 0;
    stepCount = 0;
    return this._stepIntervalId = setInterval((function(_this) {
      return function() {
        var start;
        start = Date.now();
        _this._world.step(_this.frameTime);
        if (_this.benchmark) {
          stepCount++;
          avgStep = avgStep + ((Date.now() - start) / stepCount);
          if (stepCount % 500 === 0) {
            return console.log("Physics step time: " + (avgStep.toFixed(2)) + "ms");
          }
        }
      };
    })(this), this.frameTime);
  };

  AREPhysics.stopStepping = function() {
    if (this._stepIntervalId === null) {
      return;
    }
    ARELog.info("Halting world update loop");
    clearInterval(this._stepIntervalId);
    this._stepIntervalId = null;
    return this._world = null;
  };

  AREPhysics.getWorld = function() {
    return this._world;
  };

  AREPhysics.getDensityRatio = function() {
    return this._densityRatio;
  };

  AREPhysics.getGravity = function() {
    return this._gravity;
  };

  AREPhysics.setGravity = function(v) {
    if (!(v instanceof cp.Vect)) {
      throw new Error("You need to set space gravity using cp.v!");
    }
    this._gravity = v;
    if (this._world !== null && this._world !== void 0) {
      return this._world.gravity = v;
    }
  };

  return AREPhysics;

})();
