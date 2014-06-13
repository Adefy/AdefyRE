var AREActorInterface;

AREActorInterface = (function() {
  function AREActorInterface(masterInterface) {}

  AREActorInterface.prototype.setEngine = function(engine) {
    return this._renderer = engine.getRenderer();
  };


  /*
   * Fails with null
   * @private
   */

  AREActorInterface.prototype._findActor = function(id) {
    var a, _i, _len, _ref;
    param.required(id);
    _ref = this._renderer._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id) {
        return a;
      }
    }
    return null;
  };


  /*
   * Create actor using the supplied vertices, passed in as a JSON
   * representation of a flat array
   *
   * @param [String] verts
   * @return [Number] id created actor handle
   */

  AREActorInterface.prototype.createRawActor = function(verts) {
    param.required(verts);
    return new ARERawActor(this._renderer, JSON.parse(verts)).getId();
  };


  /*
   * Create a variable sided actor of the specified radius
   *
   * @param [Number] radius
   * @param [Number] segments
   * @return [Number] id created actor handle
   */

  AREActorInterface.prototype.createPolygonActor = function(radius, segments) {
    if (typeof radius === "string") {
      return this.createRawActor(radius);
    } else {
      return new AREPolygonActor(this._renderer, radius, segments).getId();
    }
  };


  /*
   * Creates a rectangle actor of the specified width and height
   *
   * @param [Number] width
   * @param [Number] height
   * @return [Number] id created actor handle
   */

  AREActorInterface.prototype.createRectangleActor = function(width, height) {
    return new ARERectangleActor(this._renderer, width, height).getId();
  };


  /*
   * Creates a circle actor with the specified radius
   *
   * @param [Number] radius
   * @return [Number] id created actor handle
   */

  AREActorInterface.prototype.createCircleActor = function(radius) {
    return new ARECircleActor(this._renderer, radius).getId();
  };


  /*
   * Get actor render layer
   *
   * @param [Number] id
   * @return [Number] layer
   */

  AREActorInterface.prototype.getActorLayer = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getLayer();
    }
    return null;
  };


  /*
   * Get actor physics layer
   *
   * @param [Number] id
   * @return [Number] physicsLayer
   */

  AREActorInterface.prototype.getActorPhysicsLayer = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getPhysicsLayer();
    }
    return null;
  };


  /*
   * Fetch the width of the rectangle actor with the specified ID
   *
   * @param [Number] id
   * @return [Number] width
   */

  AREActorInterface.prototype.getRectangleActorWidth = function(id) {
    var a, _i, _len, _ref;
    _ref = this._renderer._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof ARERectangleActor) {
        return a.getWidth();
      }
    }
    return null;
  };


  /*
   * Fetch the height of the rectangle actor with the specified ID
   *
   * @param [Number] id
   * @return [Number] height
   */

  AREActorInterface.prototype.getRectangleActorHeight = function(id) {
    var a, _i, _len, _ref;
    _ref = this._renderer._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof ARERectangleActor) {
        return a.getHeight();
      }
    }
    return null;
  };


  /*
   * Get actor opacity using handle, fails with null
   *
   * @param [Number] id
   * @return [Number] opacity
   */

  AREActorInterface.prototype.getActorOpacity = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getOpacity();
    }
    return null;
  };


  /*
   * Get actor visible using handle, fails with null
   *
   * @param [Number] id
   * @return [Boolean] visible
   */

  AREActorInterface.prototype.getActorVisible = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getVisible();
    }
    return null;
  };


  /*
   * Get actor position using handle, fails with null
   * Returns position as a JSON representation of a primitive (x, y) object!
   *
   * @param [Number] id
   * @return [Object] position {x, y}
   */

  AREActorInterface.prototype.getActorPosition = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getPosition();
    } else {
      return null;
    }
  };


  /*
   * Get actor rotation using handle, fails with 0.000001
   *
   * @param [Number] id
   * @param [Boolean] radians defaults to false
   * @return [Number] angle in degrees or radians
   */

  AREActorInterface.prototype.getActorRotation = function(id, radians) {
    var a;
    if (a = this._findActor(id)) {
      return a.getRotation(!!radians);
    }
    return 0.000001;
  };


  /*
   * Returns actor color as a JSON triple, in 0-255 range
   * Uses id, fails with null
   *
   * @param [Number] id
   * @return [String] col
   */

  AREActorInterface.prototype.getActorColor = function(id) {
    var a, color;
    if (a = this._findActor(id)) {
      color = a.getColor();
      return {
        r: color.getR(),
        g: color.getG(),
        b: color.getB()
      };
    }
    return null;
  };


  /*
   * Return an Actor's texture name
   *
   * @param [Number] id
   * @return [String] texture_name
   */

  AREActorInterface.prototype.getActorTexture = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getTexture().name;
    } else {
      return null;
    }
  };


  /*
   * Retrieve an Actor's texture repeat
   *
   * @param [Number] id
   * @return [Object] repeat
   */

  AREActorInterface.prototype.getActorTextureRepeat = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getTextureRepeat();
    } else {
      return null;
    }
  };


  /*
   * Set the height of the rectangle actor with the specified ID
   *
   * @param [Number] id
   * @param [Number] height
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setRectangleActorHeight = function(id, height) {
    var a, _i, _len, _ref;
    _ref = this._renderer._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof ARERectangleActor) {
        a.setHeight(height);
        return true;
      }
    }
    return false;
  };


  /*
   * Set the width of the rectangle actor with the specified ID
   *
   * @param [Number] id
   * @param [Number] width
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setRectangleActorWidth = function(id, width) {
    var a, _i, _len, _ref;
    _ref = this._renderer._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof ARERectangleActor) {
        a.setWidth(width);
        return true;
      }
    }
    return false;
  };


  /*
   * Set the segment count of the polygon actor with the specified ID
   *
   * @param [Number] id
   * @param [Number] segments
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setPolygonActorSegments = function(id, segments) {
    var a, _i, _len, _ref;
    _ref = this._renderer._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof AREPolygonActor) {
        a.setSegments(segments);
        return true;
      }
    }
    return false;
  };


  /*
   * Set the radius of the polygon actor with the specified ID
   *
   * @param [Number] id
   * @param [Number] radius
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setPolygonActorRadius = function(id, radius) {
    var a, _i, _len, _ref;
    _ref = this._renderer._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof AREPolygonActor) {
        a.setRadius(radius);
        return true;
      }
    }
    return false;
  };


  /*
   * Get the radius of the polygon actor with the specified ID
   *
   * @param [Number] id
   * @return [Number] radius
   */

  AREActorInterface.prototype.getPolygonActorRadius = function(id) {
    var a, _i, _len, _ref;
    _ref = this._renderer._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof AREPolygonActor) {
        return a.getRadius();
      }
    }
    return null;
  };


  /*
   * Get the segment count of the polygon actor with the specified ID
   *
   * @param [Number] id
   * @return [Number] segments
   */

  AREActorInterface.prototype.getPolygonActorSegments = function(id, radius) {
    var a, _i, _len, _ref;
    _ref = this._renderer._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof AREPolygonActor) {
        return a.getSegments();
      }
    }
    return null;
  };


  /*
   * Attach texture to actor. Fails if actor isn't found
   *
   * @param [Number] id id of actor to attach texture to
   * @param [String] texture texture name
   * @param [Number] width attached actor width
   * @param [Number] height attached actor height
   * @param [Number] offx anchor point offset
   * @param [Number] offy anchor point offset
   * @param [Angle] angle anchor point rotation
   * @return [Boolean] success
   */

  AREActorInterface.prototype.attachTexture = function(id, texture, w, h, x, y, angle) {
    var a;
    x || (x = 0);
    y || (y = 0);
    angle || (angle = 0);
    if (a = this._findActor(id)) {
      a.attachTexture(texture, w, h, x, y, angle);
      return true;
    }
    return false;
  };


  /*
   * Set actor layer. Fails if actor isn't found.
   * Actors render from largest layer to smallest
   *
   * @param [Number] id id of actor to set layer of
   * @param [Number] layer
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorLayer = function(id, layer) {
    var a;
    if (a = this._findActor(id)) {
      a.setLayer(layer);
      return true;
    }
    return false;
  };


  /*
   * Set actor physics layer. Fails if actor isn't found.
   * Physics layers persist within an actor between body creations. Only bodies
   * in the same layer will collide! There are only 16 physics layers!
   *
   * @param [Number] id id of actor to set layer of
   * @param [Number] layer
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorPhysicsLayer = function(id, layer) {
    var a;
    if (a = this._findActor(id)) {
      a.setPhysicsLayer(layer);
      return true;
    }
    return false;
  };


  /*
   * Remove attachment from an actor. Fails if actor isn't found
   *
   * @param [Number] id id of actor to remove texture from
   * @return [Boolean] success
   */

  AREActorInterface.prototype.removeAttachment = function(id) {
    var a;
    if (a = this._findActor(id)) {
      a.removeAttachment();
      return true;
    }
    return false;
  };


  /*
   * Set attachment visiblity. Fails if actor isn't found, or actor has no
   * attachment.
   *
   * @param [Number] id id of actor to modify
   * @param [Boolean] visible
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setAttachmentVisiblity = function(id, visible) {
    var a;
    if (a = this._findActor(id)) {
      return a.setAttachmentVisibility(visible);
    }
    return false;
  };


  /*
   * Refresh actor vertices, passed in as a JSON representation of a flat array
   *
   * @param [Number] id actor id
   * @param [String] verts
   * @return [Boolean] success
   */

  AREActorInterface.prototype.updateVertices = function(id, verts) {
    var a;
    if (a = this._findActor(id)) {
      a.updateVertices(JSON.parse(verts));
      return true;
    }
    return false;
  };


  /*
   * Get actor vertices as a flat JSON array
   *
   * @param [Number] id actor id
   * @return [String] vertices
   */

  AREActorInterface.prototype.getVertices = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return JSON.stringify(a.getVertices());
    }
    return null;
  };


  /*
   * Clears stored information about the actor in question. This includes the
   * rendered and physics bodies
   *
   * @param [Numer] id actor id
   * @return [Boolean] success
   */

  AREActorInterface.prototype.destroyActor = function(id) {
    var a;
    if (a = this._findActor(id)) {
      a.destroy();
      return true;
    }
    return false;
  };


  /*
   * Supply an alternate set of vertices for the physics body of an actor. This
   * is necessary for triangle-fan shapes, since the center point must be
   * removed when building the physics body. If a physics body already exists,
   * this rebuilds it!
   *
   * @param [Number] id actor id
   * @param [String] verts
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setPhysicsVertices = function(id, verts) {
    var a;
    if (a = this._findActor(id)) {
      a.setPhysicsVertices(JSON.parse(verts));
      return true;
    }
    return false;
  };


  /*
   * Change actors' render mode, currently only options are avaliable
   *   1 == TRIANGLE_STRIP
   *   2 == TRIANGLE_FAN
   *
   * @param [Number] id actor id
   * @param [Number] mode
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setRenderMode = function(id, mode) {
    var a;
    if (a = this._findActor(id)) {
      a.setRenderMode(mode);
      return true;
    }
    return false;
  };


  /*
   * Set actor opacity using handle, fails with false
   *
   * @param [Number] id
   * @param [Number opacity
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorOpacity = function(id, opacity) {
    var a;
    if (isNaN(opacity)) {
      return false;
    }
    opacity = Number(opacity);
    if (opacity > 1.0) {
      opacity = 1.0;
    }
    if (opacity < 0.0) {
      opacity = 0.0;
    }
    if (a = this._findActor(id)) {
      a.setOpacity(opacity);
      return true;
    }
    return false;
  };


  /*
   * Set actor visible using handle, fails with false
   *
   * @param [Number] id
   * @param [Boolean] visible
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorVisible = function(id, visible) {
    var a;
    if (a = this._findActor(id)) {
      a.setVisible(visible);
      return true;
    }
    return false;
  };


  /*
   * Set actor position using handle, fails with false
   *
   * @param [Number] id
   * @param [Object] position
   * @option position [Number] x x coordinate
   * @option position [Number] y y coordinate
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorPosition = function(id, position) {
    var a;
    if (a = this._findActor(id)) {
      a.setPosition(position);
      return true;
    }
    return false;
  };


  /*
   * Set actor rotation using handle, fails with false
   *
   * @param [Number] id
   * @param [Number] angle in degrees or radians
   * @param [Boolean] radians defaults to false
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorRotation = function(id, angle, radians) {
    var a;
    if (a = this._findActor(id)) {
      a.setRotation(angle, !!radians);
      return true;
    }
    return false;
  };


  /*
   * Set actor color using handle, fails with false
   *
   * @param [Number] id
   * @param [Object] color
   * @option color [Number] r red component
   * @option color [Number] g green component
   * @option color [Number] b blue component
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorColor = function(id, color) {
    var a;
    if (a = this._findActor(id)) {
      a.setColor(color);
      return true;
    }
    return false;
  };


  /*
   * Set actor texture by texture handle. Expects the texture to already be
   * loaded by the asset system!
   *
   * @param [Number] id
   * @param [String] name
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorTexture = function(id, name) {
    var a;
    if (a = this._findActor(id)) {
      a.setTexture(name);
      return true;
    }
    return false;
  };


  /*
   * Set actor texture repeat
   *
   * @param [Number] id
   * @param [Object] repeat
   * @option repeat [Number] x horizontal repeat
   * @option repeat [Number] y vertical repeat (default 1)
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorTextureRepeat = function(id, repeat) {
    var a;
    if (a = this._findActor(id)) {
      a.setTextureRepeat(repeat.x, repeat.y);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Creates the internal physics body, if one does not already exist
   * Fails with false
   *
   * @param [Number] id
   * @param [Number] mass 0.0 - unbound
   * @param [Number] friction 0.0 - 1.0
   * @param [Number] elasticity 0.0 - 1.0
   * @return [Boolean] success
   */

  AREActorInterface.prototype.enableActorPhysics = function(id, mass, friction, elasticity) {
    var a;
    if (a = this._findActor(id)) {
      a.createPhysicsBody(mass, friction, elasticity);
      return true;
    }
    return false;
  };


  /*
   * Destroys the physics body if one exists, fails with false
   *
   * @param [Number] id
   * @return [Boolean] success
   */

  AREActorInterface.prototype.destroyPhysicsBody = function(id) {
    var a;
    if (a = this._findActor(id)) {
      a.destroyPhysicsBody();
      return true;
    }
    return false;
  };

  return AREActorInterface;

})();
