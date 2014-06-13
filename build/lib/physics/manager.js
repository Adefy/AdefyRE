var PhysicsManager,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PhysicsManager = (function(_super) {
  __extends(PhysicsManager, _super);

  function PhysicsManager(_renderer, depPaths, cb) {
    this._renderer = _renderer;
    param.required(_renderer);
    param.required(depPaths);
    PhysicsManager.__super__.constructor.call(this, "PhysicsManager", [
      {
        raw: "cp = exports = {};"
      }, {
        url: depPaths.chipmunk
      }, {
        url: depPaths.koon
      }, {
        url: depPaths.physics_worker
      }
    ], cb);
  }

  PhysicsManager.prototype._connectWorkerListener = function() {
    var ID_INDEX, POS_INDEX, ROT_INDEX, actor, data, dataPacket;
    ID_INDEX = 0;
    POS_INDEX = 1;
    ROT_INDEX = 2;
    data = {};
    dataPacket = {};
    actor = {};
    return this._worker.onmessage = (function(_this) {
      return function(e) {
        var l, _results;
        data = e.data;
        if (data.length) {
          l = data.length;
          _results = [];
          while (l--) {
            dataPacket = data[l];
            actor = _this._renderer._actor_hash[dataPacket[ID_INDEX]];
            actor._position = dataPacket[POS_INDEX];
            actor._rotation = dataPacket[ROT_INDEX];
            _results.push(actor._updateModelMatrix());
          }
          return _results;
        } else {
          return _this.broadcast(e.data.message, e.data.namespace);
        }
      };
    })(this);
  };

  return PhysicsManager;

})(BazarShop);
