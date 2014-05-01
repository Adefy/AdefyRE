
/*
 * Physics worker, implements a BazarShop and uses Koon for message passing
 */
var AREPhysicsWorker,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
    this._gravity = new cp.v(0, 1);
    this._frameTime = 1.0 / 60.0;
    this._posIterations = 2;
    this._velIterations = 6;
    return this._PPM = 128;
  };

  AREPhysicsWorker.prototype._createWorld = function() {
    this._world = new cp.Space;
    this._world.gravity = this._gravity;
    this._world.iterations = 60;
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

  AREPhysicsWorker.prototype.startStepping = function() {
    var avgStep, stepCount;
    if (this._stepIntervalId) {
      return;
    }
    avgStep = 0;
    stepCount = 0;
    return this._stepIntervalId = setInterval((function(_this) {
      return function() {
        _this._world.step(_this._frameTime);
        return _this._broadcastBodyPositions();

        /*
         * Benchmark code
         *
        return unless @_benchmark
        stepCount++
        
        avgStep = avgStep + ((Date.now() - start) / stepCount)
        
        if stepCount % 500 == 0
          console.log "Physics step time: #{avgStep.toFixed(2)}ms"
         */
      };
    })(this), this._frameTime);
  };

  AREPhysicsWorker.prototype.stopStepping = function() {
    if (!this._stepIntervalId) {
      return;
    }
    clearInterval(this._stepIntervalId);
    this._stepIntervalId = null;
    return this._world = null;
  };

  AREPhysicsWorker.prototype._broadcastBodyPositions = function() {
    var body, _i, _len, _ref, _results;
    _ref = this._bodies;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      body = _ref[_i];
      _results.push(this.broadcast({
        id: body.__are_id,
        position: this.worldToScreen(body.getPos()),
        rotation: body.a
      }, "actor.update"));
    }
    return _results;
  };

  AREPhysicsWorker.prototype.receiveMessage = function(message, namespace) {
    var command;
    if (namespace.indexOf("physics.") === -1) {
      return;
    }
    command = namespace.split(".");
    switch (command[1]) {
      case "ppm":
        this._PPM = message.value;
        break;
      case "benchmark":
        switch (command[2]) {
          case "set":
            this.benchmark = message.value;
            break;
          case "enable":
            this.benchmark = true;
            break;
          case "disable":
            this.benchmark = false;
        }
        break;
      case "disable":
        this.stopStepping();
        break;
      case "enable":
        this.startStepping();
        break;
      case "body":
        switch (command[2]) {
          case "create":
            this.createBody(message);
            break;
          case "remove":
            this.removeBody(message);
            break;
          case "set":
            switch (command[3]) {
              case "position":
                this.bodySetPosition(message);
                break;
              case "rotation":
                this.bodySetRotation(message);
            }
        }
        break;
      case "shape":
        switch (command[2]) {
          case "set":
            switch (command[3]) {
              case "layer":
                this.shapeSetLayer(message);
            }
        }
        break;
      case "shape":
        switch (command[2]) {
          case "create":
            this.createShape(message);
            break;
          case "remove":
            this.removeShape(message);
        }
        break;
      case "gravity":
        switch (command[2]) {
          case "set":
            this.setGravity(message);
        }
    }
    return AREPhysicsWorker.__super__.receiveMessage.call(this, message, namespace);
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
    _ref = this._bodies;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      shape = _ref[_i];
      if (shape.__are_id === id) {
        return shape;
      }
    }
    return null;
  };

  AREPhysicsWorker.prototype.convertScreenVertsToWorld = function(vertices) {
    var i, _i, _ref, _results;
    _results = [];
    for (i = _i = 0, _ref = vertices.length - 1; _i < _ref; i = _i += 2) {
      vertices[i] /= this._PPM;
      _results.push(vertices[i + 1] /= this._PPM);
    }
    return _results;
  };

  AREPhysicsWorker.prototype.removeBody = function(message) {
    var body, id;
    if (!(id = message.id)) {
      return;
    }
    if (!(body = this.findBody(id))) {
      return;
    }
    return this._world.removeBody(body);
  };

  AREPhysicsWorker.prototype.removeShape = function(message) {
    var id, shape;
    if (!(id = message.id)) {
      return;
    }
    if (!(shape = this.findShape(id))) {
      return;
    }
    return this._world.removeShape(shape);
  };

  AREPhysicsWorker.prototype.createBody = function(def) {
    var body, moment, vertices;
    if (!(def = message.def)) {
      return;
    }
    if (this.findBody(def.id)) {
      return;
    }
    vertices = this.convertScreenVertsToWorld(def.vertices);
    moment = cp.momentForPoly(def.mass, vertices, def.momentV);
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
    vertices = this.convertScreenVertsToWorld(def.vertices);
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
    if (def.layer) {
      shape.setLayers(def.layer);
    }
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

new AREPhysicsWorker();
