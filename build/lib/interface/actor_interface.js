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
   * Fetch the radius of the circle actor with the specified ID
   *
   * @param [Number] id
   * @return [Number] radius
   */

  AREActorInterface.prototype.getCircleActorRadius = function(id) {
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
   * Get actor opacity using handle, fails with null
   *
   * @param [Number] id
   * @return [Number] opacity
   */

  AREActorInterface.prototype.getActorOpacity = function(id) {
    var a;
    if ((a = this._findActor(id)) !== null) {
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
    if ((a = this._findActor(id)) !== null) {
      return a.getVisible();
    }
    return null;
  };


  /*
   * Get actor position using handle, fails with null
   * Returns position as a JSON representation of a primitive (x, y) object!
   *
   * @param [Number] id
   * @return [String] position
   */

  AREActorInterface.prototype.getActorPosition = function(id) {
    var a, pos;
    if ((a = this._findActor(id)) !== null) {
      pos = a.getPosition();
      return JSON.stringify({
        x: pos.x,
        y: pos.y
      });
    }
    return null;
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
    if ((a = this._findActor(id)) !== null) {
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
    if ((a = this._findActor(id)) !== null) {
      color = a.getColor();
      return JSON.stringify({
        r: color.getR(),
        g: color.getG(),
        b: color.getB()
      });
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
    var a, tex;
    if ((a = this._findActor(id)) !== null) {
      tex = a.getTexture();
      return tex.name;
    }
    return null;
  };


  /*
   * Retrieve an Actor's texture repeat
   *
   * @param [Number] id
   * @return [JSONString] texture_repeat
   */

  AREActorInterface.prototype.getActorTextureRepeat = function(id) {
    var a, texRep;
    if ((a = this._findActor(id)) !== null) {
      texRep = a.getTextureRepeat();
      return JSON.stringify(texRep);
    }
    return null;
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
   * Set the radius of the circle actor with the specified ID
   *
   * @param [Number] id
   * @param [Number] radius
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setCircleActorRadius = function(id, radius) {
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
   * Attach texture to actor. Fails if actor isn't found
   *
   * @param [String] texture texture name
   * @param [Number] width attached actor width
   * @param [Number] height attached actor height
   * @param [Number] offx anchor point offset
   * @param [Number] offy anchor point offset
   * @param [Angle] angle anchor point rotation
   * @param [Number] id id of actor to attach texture to
   * @return [Boolean] success
   */

  AREActorInterface.prototype.attachTexture = function(texture, w, h, x, y, angle, id) {
    var a;
    x || (x = 0);
    y || (y = 0);
    angle || (angle = 0);
    if ((a = this._findActor(id)) !== null) {
      a.attachTexture(texture, w, h, x, y, angle);
      return true;
    }
    return false;
  };


  /*
   * Set actor layer. Fails if actor isn't found.
   * Actors render from largest layer to smallest
   *
   * @param [Number] layer
   * @param [Number] id id of actor to set layer of
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorLayer = function(layer, id) {
    var a;
    if ((a = this._findActor(id)) !== null) {
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
   * @param [Number] layer
   * @param [Number] id id of actor to set layer of
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorPhysicsLayer = function(layer, id) {
    var a;
    if ((a = this._findActor(id)) !== null) {
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
    if ((a = this._findActor(id)) !== null) {
      a.removeAttachment();
      return true;
    }
    return false;
  };


  /*
   * Set attachment visiblity. Fails if actor isn't found, or actor has no
   * attachment.
   *
   * @param [Boolean] visible
   * @param [Number] id id of actor to modify
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setAttachmentVisiblity = function(visible, id) {
    var a;
    if ((a = this._findActor(id)) !== null) {
      return a.setAttachmentVisibility(visible);
    }
    return false;
  };


  /*
   * Refresh actor vertices, passed in as a JSON representation of a flat array
   *
   * @param [String] verts
   * @param [Number] id actor id
   * @return [Boolean] success
   */

  AREActorInterface.prototype.updateVertices = function(verts, id) {
    var a;
    if ((a = this._findActor(id)) !== null) {
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
    if ((a = this._findActor(id)) !== null) {
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
    if ((a = this._findActor(id)) !== null) {
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
   * @param [String] verts
   * @param [Number] id actor id
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setPhysicsVertices = function(verts, id) {
    var a;
    if ((a = this._findActor(id)) !== null) {
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
   * @param [Number] mode
   * @param [Number] id actor id
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setRenderMode = function(mode, id) {
    var a;
    if ((a = this._findActor(id)) !== null) {
      a.setRenderMode(mode);
      return true;
    }
    return false;
  };


  /*
   * Set actor opacity using handle, fails with false
   *
   * @param [Number opacity
   * @param [Number] id
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorOpacity = function(opacity, id) {
    var a;
    if ((a = this._findActor(id)) !== null) {
      a.setOpacity(opacity);
      return true;
    }
    return false;
  };


  /*
   * Set actor visible using handle, fails with false
   *
   * @param [Boolean] visible
   * @param [Number] id
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorVisible = function(visible, id) {
    var a;
    if ((a = this._findActor(id)) !== null) {
      a.setVisible(visible);
      return true;
    }
    return false;
  };


  /*
   * Set actor position using handle, fails with false
   *
   * @param [Number] x x coordinate
   * @param [Number] y y coordinate
   * @param [Number] id
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorPosition = function(x, y, id) {
    var a;
    if ((a = this._findActor(id)) !== null) {
      a.setPosition(new cp.v(x, y));
      return true;
    }
    return false;
  };


  /*
   * Set actor rotation using handle, fails with false
   *
   * @param [Number] angle in degrees or radians
   * @param [Number] id
   * @param [Boolean] radians defaults to false
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorRotation = function(angle, id, radians) {
    var a;
    if ((a = this._findActor(id)) !== null) {
      a.setRotation(angle, !!radians);
      return true;
    }
    return false;
  };


  /*
   * Set actor color using handle, fails with false
   *
   * @param [Number] r red component
   * @param [Number] g green component
   * @param [Number] b blue component
   * @param [Number] id
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorColor = function(r, g, b, id) {
    var a;
    if ((a = this._findActor(id)) !== null) {
      a.setColor(new AREColor3(r, g, b));
      return true;
    }
    return false;
  };


  /*
   * Set actor texture by texture handle. Expects the texture to already be
   * loaded by the asset system!
   *
   * @param [String] name
   * @param [Number] id
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorTexture = function(name, id) {
    var a;
    if ((a = this._findActor(id)) !== null) {
      a.setTexture(name);
      return true;
    }
    return false;
  };


  /*
   * Set actor texture repeat
   *
   * @param [Number] x horizontal repeat
   * @param [Number] y vertical repeat (default 1)
   * @param [Number] id
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorTextureRepeat = function(x, y, id) {
    var a;
    y || (y = 1);
    if ((a = this._findActor(id)) !== null) {
      a.setTextureRepeat(x, y);
      return true;
    }
    return false;
  };


  /*
   * Creates the internal physics body, if one does not already exist
   * Fails with false
   *
   * @param [Number] mass 0.0 - unbound
   * @param [Number] friction 0.0 - 1.0
   * @param [Number] elasticity 0.0 - 1.0
   * @param [Number] id
   * @return [Boolean] success
   */

  AREActorInterface.prototype.enableActorPhysics = function(mass, friction, elasticity, id) {
    var a;
    if ((a = this._findActor(id)) !== null) {
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
    if ((a = this._findActor(id)) !== null) {
      a.destroyPhysicsBody();
      return true;
    }
    return false;
  };

  return AREActorInterface;

})();
