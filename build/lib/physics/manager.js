
/*
 * PhysicsManager is in charge of starting and communicating with the physics
 * web worker.
 */
var PhysicsManager;

PhysicsManager = (function() {
  function PhysicsManager(_renderer, depPaths, cb) {
    var dependencies;
    this._renderer = _renderer;
    param.required(_renderer);
    param.required(depPaths);
    this._backlog = [];
    dependencies = [
      {
        raw: "cp = exports = {};"
      }, {
        url: depPaths.chipmunk
      }, {
        url: depPaths.physics_worker
      }
    ];
    async.map(dependencies, function(dependency, depCB) {
      if (dependency.raw) {
        return depCB(null, dependency.raw);
      }
      return $.ajax({
        url: dependency.url,
        mimeType: "text",
        success: function(rawDep) {
          return depCB(null, rawDep);
        }
      });
    }, (function(_this) {
      return function(error, sources) {
        _this._initFromSources(sources);
        _this._emptyBacklog();
        if (cb) {
          return cb();
        }
      };
    })(this));
  }

  PhysicsManager.prototype._initFromSources = function(sources) {
    var data;
    if (!!this._worker) {
      return;
    }
    data = new Blob([sources.join("\n\n")], {
      type: "text/javascript"
    });
    this._worker = new Worker((URL || window.webkitURL).createObjectURL(data));
    this._worker.postMessage("");
    return this._connectWorkerListener();
  };

  PhysicsManager.prototype._emptyBacklog = function() {
    var item, _i, _len, _ref, _results;
    if (!this._worker) {
      return;
    }
    _ref = this._backlog;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      _results.push(this.sendMessage(item.message, item.command));
    }
    return _results;
  };


  /*
   * Broadcast a message to the physics manager; this gets passed through to the
   * underlying web worker.
   *
   * @param [Object] message
   * @param [String] command
   */

  PhysicsManager.prototype.sendMessage = function(message, command) {
    if (!!this._worker) {
      return this._worker.postMessage({
        message: message,
        command: command
      });
    } else {
      return this._backlog.push({
        message: message,
        command: command
      });
    }
  };

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
          return _this.broadcast(data.message, data.command);
        }
      };
    })(this);
  };

  return PhysicsManager;

})();
