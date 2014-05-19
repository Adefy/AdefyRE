var AREAnimationInterface;

AREAnimationInterface = (function() {
  AREAnimationInterface._animationMap = {
    "position": AREBezAnimation,
    "color": AREBezAnimation,
    "rotation": AREBezAnimation,
    "mass": AREPsyxAnimation,
    "friction": AREPsyxAnimation,
    "elasticity": AREPsyxAnimation,
    "physics": AREPsyxAnimation,
    "vertices": AREVertAnimation
  };

  function AREAnimationInterface(masterInterface) {}

  AREAnimationInterface.prototype.setEngine = function(engine) {
    return this._renderer = engine.getRenderer();
  };

  AREAnimationInterface.prototype.canAnimate = function(property) {
    return !!AREAnimationInterface._animationMap[property];
  };

  AREAnimationInterface.prototype.getAnimationName = function(property) {
    if (!AREAnimationInterface._animationMap[property]) {
      return false;
    } else {
      switch (AREAnimationInterface._animationMap[property]) {
        case AREBezAnimation:
          return "bezier";
        case AREPsyxAnimation:
          return "psyx";
        case AREVertAnimation:
          return "vert";
        default:
          return false;
      }
    }
  };

  AREAnimationInterface.prototype.animate = function(actorID, property, options) {
    var a, actor, name, _i, _len, _ref, _spawnAnim;
    property = JSON.parse(param.required(property));
    options = JSON.parse(param.required(options));
    options.start || (options.start = 0);
    actor = null;
    _ref = this._renderer.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === actorID) {
        actor = a;
        break;
      }
    }
    if (actor === null) {
      throw new Error("Actor not found, can't animate! " + actorId);
    }
    name = property[0];
    if (options.property === void 0) {
      options.property = property;
    }
    _spawnAnim = function(_n, _a, _o) {
      if (AREAnimationInterface._animationMap[_n] === AREBezAnimation) {
        return new AREBezAnimation(_a, _o).animate();
      } else if (AREAnimationInterface._animationMap[_n] === AREPsyxAnimation) {
        return new AREPsyxAnimation(_a, _o).animate();
      } else if (AREAnimationInterface._animationMap[_n] === AREVertAnimation) {
        return new AREVertAnimation(_a, _o).animate();
      } else {
        return ARELog.warn("Unrecognized property: " + _n);
      }
    };
    if (options.start > 0) {
      return setTimeout((function() {
        return _spawnAnim(name, actor, options);
      }), options.start);
    } else {
      return _spawnAnim(name, actor, options);
    }
  };

  AREAnimationInterface.prototype.preCalculateBez = function(options) {
    var ret;
    options = JSON.parse(param.required(options));
    options.controlPoints || (options.controlPoints = 0);
    options.fps || (options.fps = 30);
    ret = new AREBezAnimation(null, options, true).preCalculate();
    return JSON.stringify(ret);
  };

  return AREAnimationInterface;

})();
