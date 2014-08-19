var AREPsyxAnimation;

AREPsyxAnimation = (function() {

  /*
   * Class to "animate" physics properties which means changing them
   * at certain times by calling the createPhysicsBody method of an actor
   *
   * @param [ARERawActor] actor the actor we apply the modifications to
   * @param [Object] options
   * @option options [Number] mass
   * @option options [Number] friction
   * @option options [Number] elasticity
   * @option options [Number] timeout
   * @option options [Method] cbStart callback to call before animating
   * @option options [Method] cbEnd callback to call after animating
   */
  function AREPsyxAnimation(actor, options) {
    this.actor = actor;
    this._mass = options.mass || 0;
    this._friction = options.friction || 0;
    this._elasticity = options.elasticity || 0;
    this._timeout = options.timeout;
    this._cbStep = options.cbStep || function() {};
    this._cbEnd = options.cbEnd || function() {};
    this._cbStart = options.cbStart || function() {};
    this._animated = false;
  }


  /*
   * Activates the animation (can only be run once)
   */

  AREPsyxAnimation.prototype.animate = function() {
    if (this._animated) {
      return;
    } else {
      this._animated = true;
    }
    this._cbStart();
    return setTimeout((function(_this) {
      return function() {
        _this.actor.createPhysicsBody(_this._mass, _this._friction, _this._elasticity);
        return _this._cbEnd();
      };
    })(this), this._timeout);
  };

  return AREPsyxAnimation;

})();
