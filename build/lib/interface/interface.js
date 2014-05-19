var AREInterface;

AREInterface = (function() {
  function AREInterface() {
    this._Actors = new AREActorInterface(this);
    this._Engine = new AREEngineInterface(this);
    this._Animations = new AREAnimationInterface(this);
  }

  AREInterface.prototype.Actors = function() {
    return this._Actors;
  };

  AREInterface.prototype.Engine = function() {
    return this._Engine;
  };

  AREInterface.prototype.Animations = function() {
    return this._Animations;
  };

  AREInterface.prototype.setEngine = function(engine) {
    this._Actors.setEngine(engine);
    return this._Animations.setEngine(engine);
  };

  return AREInterface;

})();
