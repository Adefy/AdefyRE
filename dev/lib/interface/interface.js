var AREInterface;

AREInterface = (function() {
  function AREInterface() {
    this._Actors = new AREActorInterface();
    this._Engine = new AREEngineInterface();
    this._Animations = new AREAnimationInterface();
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

  return AREInterface;

})();
