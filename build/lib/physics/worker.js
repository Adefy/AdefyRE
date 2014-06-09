var AREPhysicsWorker, ARE_PHYSICS_UPDATE_PACKET, onmessage, worker,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ARE_PHYSICS_UPDATE_PACKET = [];


/*
 * Physics worker, implements a BazarShop and uses Koon for message passing
 */

AREPhysicsWorker = (function(_super) {
  __extends(AREPhysicsWorker, _super);

  function AREPhysicsWorker() {
    AREPhysicsWorker.__super__.constructor.call(this, "PhysicsWorker");
    this._shapes = [];
    this._bodies = [];
    this._initDefaults();
    this._setBazarNamespace(/^physics\..*/);
    this._createWorld();
  }

  AREPhysicsWorker.prototype._initDefaults = function() {
    this._benchmark = false;
    this._stepIntervalId = null;
    this._bodyCount = 0;
    this._world = null;
    this._densityRatio = 1 / 10000;
    this._gravity = new cp.v(0, 9.8);
    this._frameTime = 1.0 / 60.0;
    this._posIterations = 4;
    this._velIterations = 4;
    return this._PPM = 128;
  };

  AREPhysicsWorker.prototype._createWorld = function() {
    this._world = new cp.Space;
    this._world.gravity = this._gravity;
    this._world.iterations = 30;
    this._world.collisionSlop = 0.5;
    return this._world.sleepTimeThreshold = 0.5;
  };

  AREPhysicsWorker.prototype._setBazarNamespace = function(match) {
    return postMessage({
      namespace: "bazar.set_namespace",
      message: match
    });
  };


  /*
   * Converts screen coords to world coords
   *
   * @param [Vector] v vector in x, y form
   * @return [Vector] ret v in world coords
   */

  AREPhysicsWorker.prototype.screenToWorld = function(v) {
    var ret;
    ret = new cp.v;
    ret.x = v.x / this._PPM;
    ret.y = v.y / this._PPM;
    return ret;
  };


  /*
   * Converts world coords to screen coords
   *
   * @param [Vector] v vector in x, y form
   * @return [Vector] ret v in screen coords
   */

  AREPhysicsWorker.prototype.worldToScreen = function(v) {
    var ret;
    ret = new cp.v;
    ret.x = v.x * this._PPM;
    ret.y = v.y * this._PPM;
    return ret;
  };

  AREPhysicsWorker.prototype.worldToScreenFast = function(v) {
    return {
      x: v.x * this._PPM,
      y: v.y * this._PPM
    };
  };

  AREPhysicsWorker.prototype.startStepping = function() {
    var avgStep, stepCount, stepTime;
    if (this._stepIntervalId) {
      return;
    }
    avgStep = 0;
    stepCount = 0;
    stepTime = this._frameTime * 1000;
    return this._stepIntervalId = setInterval((function(_this) {
      return function() {
        _this._world.step(_this._frameTime);
        return _this._broadcastBodyPositions();

        /*
         * Benchmark code
         *
         *
         * return unless @_benchmark
        stepCount++
        
        avgStep = avgStep + ((Date.now() - start) / stepCount)
        
        if stepCount % 500 == 0
          console.log "Physics step time: #{avgStep.toFixed(2)}ms"
         */
      };
    })(this), stepTime);
  };

  AREPhysicsWorker.prototype.stopStepping = function() {
    if (!this._stepIntervalId) {
      return;
    }
    clearInterval(this._stepIntervalId);
    return this._stepIntervalId = null;
  };

  AREPhysicsWorker.prototype._broadcastBodyPositions = function() {
    var body, l;
    l = this._bodies.length;
    while (l--) {
      body = this._bodies[l];
      ARE_PHYSICS_UPDATE_PACKET[l] = [body.__are_id, this.worldToScreenFast(body.getPos()), body.a];
    }
    return postMessage(ARE_PHYSICS_UPDATE_PACKET);
  };

  AREPhysicsWorker.prototype.receiveMessage = function(message, namespace) {
    var command;
    if (!namespace) {
      return;
    }
    command = namespace.split(".");
    switch (command[1]) {
      case "ppm":
        return this._PPM = message.value;
      case "benchmark":
        switch (command[2]) {
          case "set":
            return this.benchmark = message.value;
          case "enable":
            return this.benchmark = true;
          case "disable":
            return this.benchmark = false;
        }
        break;
      case "disable":
        return this.stopStepping();
      case "enable":
        return this.startStepping();
      case "body":
        switch (command[2]) {
          case "create":
            return this.createBody(message);
          case "remove":
            return this.removeBody(message);
          case "set":
            switch (command[3]) {
              case "position":
                return this.bodySetPosition(message);
              case "rotation":
                return this.bodySetRotation(message);
            }
        }
        break;
      case "shape":
        switch (command[2]) {
          case "create":
            return this.createShape(message);
          case "remove":
            return this.removeShape(message);
          case "set":
            switch (command[3]) {
              case "layer":
                return this.shapeSetLayer(message);
            }
        }
        break;
      case "gravity":
        switch (command[2]) {
          case "set":
            return this.setGravity(message);
        }
    }
  };


  /*
   * Get body by id
   *
   * @param [Number] id
   * @return [Body] body
   */

  AREPhysicsWorker.prototype.findBody = function(id) {
    var body, _i, _len, _ref;
    _ref = this._bodies;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      body = _ref[_i];
      if (body.__are_id === id) {
        return body;
      }
    }
    return null;
  };


  /*
   * Get shape by id
   *
   * @param [Number] id
   * @return [Shape] shape
   */

  AREPhysicsWorker.prototype.findShape = function(id) {
    var shape, _i, _len, _ref;
    _ref = this._shapes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      shape = _ref[_i];
      if (shape.__are_id === id) {
        return shape;
      }
    }
    return null;
  };

  AREPhysicsWorker.prototype.convertRawVertsToWorld = function(vertices) {
    var i, _i, _ref;
    for (i = _i = 0, _ref = vertices.length - 1; _i < _ref; i = _i += 2) {
      vertices[i] /= this._PPM;
      vertices[i + 1] /= this._PPM;
    }
    return vertices;
  };

  AREPhysicsWorker.prototype.removeBody = function(message) {
    var body, id;
    if (!(message.id !== null && message.id !== void 0)) {
      return;
    }
    id = message.id;
    if (!(body = this.findBody(id))) {
      return;
    }
    return this._world.removeBody(body);
  };

  AREPhysicsWorker.prototype.removeShape = function(message) {
    var id, shape;
    if (!(message.id !== null && message.id !== void 0)) {
      return;
    }
    id = message.id;
    if (!(shape = this.findShape(id))) {
      return;
    }
    return this._world.removeShape(shape);
  };

  AREPhysicsWorker.prototype.createBody = function(message) {
    var body, def, moment, momentV, vertices;
    if (!(def = message.def)) {
      return;
    }
    if (this.findBody(def.id)) {
      return;
    }
    vertices = this.convertRawVertsToWorld(def.vertices);
    momentV = new cp.v(def.momentV.x, def.momentV.y);
    moment = cp.momentForPoly(def.mass, vertices, momentV);
    body = new cp.Body(def.mass, moment);
    this._world.addBody(body);
    body.__are_id = def.id;
    if (def.position) {
      body.setPos(this.screenToWorld(def.position));
    }
    if (def.angle) {
      body.setAngle(def.angle);
    }
    return this._bodies.push(body);
  };

  AREPhysicsWorker.prototype.createShape = function(message) {
    var body, def, shape, vertices;
    if (!(def = message.def)) {
      return;
    }
    if (this.findShape(def.id)) {
      return;
    }
    shape = null;
    body = null;
    vertices = this.convertRawVertsToWorld(def.vertices);
    if (def["static"]) {
      body = this._world.staticBody;
    } else {
      body = this.findBody(def.id);
      if (!body) {
        return;
      }
    }
    switch (def.type) {
      case "Polygon":
        shape = new cp.PolyShape(body, vertices, this.screenToWorld(def.position));
        break;
      default:
        return;
    }
    this._world.addShape(shape);
    shape.__are_id = def.id;
    if (def.friction) {
      shape.setFriction(def.friction);
    }
    if (def.elasticity) {
      shape.setElasticity(def.elasticity);
    }
    return this._shapes.push(shape);
  };

  AREPhysicsWorker.prototype.bodySetPosition = function(message) {
    var body, position;
    if (!(position = message.position)) {
      return;
    }
    if (!(body = this.findBody(message.id))) {
      return;
    }
    return body.setPos(this.screenToWorld(position));
  };

  AREPhysicsWorker.prototype.bodySetRotation = function(message) {
    var body, rotation;
    if (!(rotation = message.rotation)) {
      return;
    }
    if (!(body = this.findBody(message.id))) {
      return;
    }
    return body.setAngle(rotation);
  };

  AREPhysicsWorker.prototype.shapeSetLayer = function(message) {
    var layer, shape;
    if (!(layer = message.layer)) {
      return;
    }
    if (!(shape = this.findShape(message.id))) {
      return;
    }
    return shape.setLayers(layer);
  };

  AREPhysicsWorker.prototype.setGravity = function(message) {
    var gravity;
    if (!(gravity = message.value)) {
      return;
    }
    return this._world.gravity = gravity;
  };

  return AREPhysicsWorker;

})(Koon);

worker = new AREPhysicsWorker();

onmessage = function(e) {
  return worker.receiveMessage(e.data.message, e.data.namespace);
};
