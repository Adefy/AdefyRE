var AREAnimationInterface;

AREAnimationInterface = (function() {
  function AREAnimationInterface() {}

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

  AREAnimationInterface.prototype.canAnimate = function(property) {
    if (AREAnimationInterface._animationMap[property] === void 0) {
      return false;
    }
    return true;
  };

  AREAnimationInterface.prototype.getAnimationName = function(property) {
    var type;
    if (AREAnimationInterface._animationMap[property] === void 0) {
      return false;
    } else {
      type = AREAnimationInterface._animationMap[property];
      if (type === AREBezAnimation) {
        return "bezier";
      } else if (type === AREPsyxAnimation) {
        return "psyx";
      } else if (type === AREVertAnimation) {
        return "vert";
      }
    }
  };

  AREAnimationInterface.prototype.animate = function(actorID, property, options) {
    var a, actor, name, _i, _len, _ref, _spawnAnim;
    param.required(actorID);
    property = JSON.parse(param.required(property));
    options = JSON.parse(param.required(options));
    options.start = param.optional(options.start, 0);
    actor = null;
    _ref = ARERenderer.actors;
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
    param.required(options.startVal);
    param.required(options.endVal);
    param.required(options.duration);
    options.controlPoints = param.required(options.controlPoints, []);
    options.fps = param.required(options.fps, 30);
    ret = new AREBezAnimation(null, options, true).preCalculate();
    return JSON.stringify(ret);
  };

  return AREAnimationInterface;

})();
