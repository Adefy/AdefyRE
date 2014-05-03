
/*
 * Koon v0.0.1
 */
var Koon, KoonFlock, KoonNetworkMember,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KoonNetworkMember = (function() {
  function KoonNetworkMember(name) {
    this._name = name || "GenericKoonNetworkMember";
    this._uuid = KoonNetworkMember.generateUUID();
    this._subscribers = [];
  }


  /*
   * Returns a valid receiver for the specified subscriber. Expects the
   * subscriber to have a receiveMessage method.
   *
   * @param [Object] subscriber
   * @return [Method] receiver
   * @private
   */

  KoonNetworkMember.prototype._generateReceiver = function(subscriber) {
    return (function(_this) {
      return function(message, namespace) {
        return subscriber.receiveMessage(message, namespace);
      };
    })(this);
  };


  /*
   * Register a new subscriber. 
   *
   * @param [Object] subscriber
   * @param [String] namespace
   * @return [Koon] self
   */

  KoonNetworkMember.prototype.subscribe = function(subscriber, namespace) {
    return this._subscribers.push({
      namespace: namespace || "",
      receiver: this._generateReceiver(subscriber)
    });
  };


  /*
   * Broadcast message to the koon. Message is sent out to all subscribers and
   * other koons.
   *
   * @param [Object] message message object as passed directly to listeners
   * @param [String] namespace optional, defaults to the wildcard namespace *
   */

  KoonNetworkMember.prototype.broadcast = function(message, namespace) {
    var l, _results;
    namespace = namespace || "";
    if (this.hasSent(message)) {
      return;
    }
    message = this.tagAsSent(message);
    l = this._subscribers.length;
    _results = [];
    while (l--) {
      _results.push(this._subscribers[l].receiver(message, namespace));
    }
    return _results;
  };


  /*
   * Get our UUID
   *
   * @return [String] uuid
   */

  KoonNetworkMember.prototype.getId = function() {
    return this._uuid;
  };


  /*
   * Get our name
   *
   * @return [String] name
   */

  KoonNetworkMember.prototype.getName = function() {
    return this._name;
  };


  /*
   * Returns an RFC4122 v4 compliant UUID
   *
   * StackOverflow link: http://goo.gl/z2RxK
   *
   * @return [String] uuid
   */

  KoonNetworkMember.generateUUID = function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r;
      r = Math.random() * 16 | 0;
      if (c === "x") {
        return r.toString(16);
      } else {
        return (r & 0x3 | 0x8).toString(16);
      }
    });
  };

  KoonNetworkMember.prototype.tagAsSent = function(message) {
    if (!message._senders) {
      message._senders = [this._name];
    } else {
      message._senders.push(this._name);
    }
    return message;
  };

  KoonNetworkMember.prototype.hasSent = function(message) {
    var sender, _i, _len, _ref;
    if (message && message._senders) {
      _ref = message._senders;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        sender = _ref[_i];
        if (sender === this._name) {
          return true;
        }
      }
    }
    return false;
  };

  return KoonNetworkMember;

})();

Koon = (function(_super) {
  __extends(Koon, _super);

  function Koon(name) {
    Koon.__super__.constructor.call(this, name || "GenericKoon");
  }

  Koon.prototype.receiveMessage = function(message, namespace) {
    return console.log("<" + message._sender + "> --> <" + (this.getName()) + ">  [" + namespace + "] " + (JSON.stringify(message)));
  };

  Koon.prototype.broadcast = function(message, namespace) {
    if (typeof message !== "object") {
      return;
    }
    message._sender = this._name;
    return Koon.__super__.broadcast.call(this, message, namespace);
  };

  return Koon;

})(KoonNetworkMember);

KoonFlock = (function(_super) {
  __extends(KoonFlock, _super);

  function KoonFlock(name) {
    KoonFlock.__super__.constructor.call(this, name || "GenericKoonFlock");
  }

  KoonFlock.prototype.registerKoon = function(koon, namespace) {
    this.subscribe(koon, namespace);
    return koon.subscribe(this);
  };

  KoonFlock.prototype.receiveMessage = function(message, namespace) {
    return this.broadcast(message, namespace);
  };


  /*
   * Returns a valid receiver for the specified koon.
   *
   * @param [Object] koon
   * @return [Method] receiver
   * @private
   */

  KoonFlock.prototype._generateReceiver = function(koon) {
    return function(message, namespace) {
      if (!koon.hasSent(message)) {
        return koon.receiveMessage(message, namespace);
      }
    };
  };

  return KoonFlock;

})(KoonNetworkMember);
