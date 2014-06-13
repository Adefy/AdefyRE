
/*
 * Note that shops cannot be accessed directly, they can only be messaged!
 */
var BazarShop, CBazar,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

CBazar = (function(_super) {
  __extends(CBazar, _super);

  function CBazar() {
    CBazar.__super__.constructor.call(this, "Bazar");
  }

  return CBazar;

})(KoonFlock);

BazarShop = (function(_super) {
  __extends(BazarShop, _super);

  function BazarShop(name, deps, readyCB) {
    BazarShop.__super__.constructor.call(this, name);
    async.map(deps, function(dependency, cb) {
      if (dependency.raw) {
        return cb(null, dependency.raw);
      }
      return $.ajax({
        url: dependency.url,
        mimeType: "text",
        success: function(rawDep) {
          return cb(null, rawDep);
        }
      });
    }, (function(_this) {
      return function(error, sources) {
        _this._initFromSources(sources);
        _this._registerWithBazar();
        if (readyCB) {
          return readyCB();
        }
      };
    })(this));
  }

  BazarShop.prototype._initFromSources = function(sources) {
    var data;
    if (this._worker) {
      return;
    }
    data = new Blob([sources.join("\n\n")], {
      type: "text/javascript"
    });
    this._worker = new Worker((URL || window.webkitURL).createObjectURL(data));
    this._connectWorkerListener();
    return this._worker.postMessage("");
  };

  BazarShop.prototype._connectWorkerListener = function() {
    return this._worker.onmessage = (function(_this) {
      return function(e) {
        var message, _i, _len, _ref, _results;
        if (e.data instanceof Array) {
          _ref = e.data;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            message = _ref[_i];
            _results.push(_this.broadcast(message.message, message.namespace));
          }
          return _results;
        } else {
          return _this.broadcast(e.data.message, e.data.namespace);
        }
      };
    })(this);
  };

  BazarShop.prototype._registerWithBazar = function() {
    return window.Bazar.registerKoon(this);
  };

  BazarShop.prototype.receiveMessage = function(message, namespace) {
    if (!this._worker) {
      return;
    }
    return this._worker.postMessage({
      message: message,
      namespace: namespace
    });
  };

  return BazarShop;

})(Koon);

if (!window.Bazar) {
  window.Bazar = new CBazar();
}
