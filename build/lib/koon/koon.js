
/*
 * Koon v0.0.1
 */
var Koon, KoonFlock;

Koon = (function() {
  function Koon(name) {
    this._name = name || "GenericKoon";
    this._subscribers = [];
    this._koons = [];
  }


  /*
   * Register a new subscriber. Expects the subscriber to have a receiveMessage
   * method.
   *
   * @param [Object] subscriber
   * @param [Regexp] regex
   * @return [Koon] self
   */

  Koon.prototype.subscribe = function(subscriber, regex) {
    return this._subscribers.push({
      regex: regex,
      receiver: function(message, namespace) {
        return subscriber.receiveMessage(message, namespace);
      }
    });
  };


  /*
   * Broadcast message to the koon. Message is sent out to all subscribers and
   * other koons.
   *
   * @param [Object] message message object as passed directly to listeners
   * @param [String] namespace optional, defaults to the wildcard namespace *
   */

  Koon.prototype.broadcast = function(message, namespace) {
    var subscriber, _i, _len, _ref, _results;
    if (!namespace) {
      namespace = "*";
    }
    _ref = this._subscribers;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subscriber = _ref[_i];
      if (!!subscriber.regex.match(namespace)) {
        _results.push(subscriber.receiver(message, namespace));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return Koon;

})();


/*
 *
 */

KoonFlock = (function() {
  function KoonFlock(name) {
    this._name = name || "GenericKoonFlock";
  }

  return KoonFlock;

})();
