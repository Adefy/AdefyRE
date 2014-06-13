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
   * Create actor using the supplied vertices, passed in as a flat array
   *
   * @param [Array<Number>] verts
   * @return [Number] id created actor handle
   */

  AREActorInterface.prototype.create2DRawPolygon = function(verts) {
    return new ARERawActor(this._renderer, verts).getId();
  };


  /*
   * Create a variable sided actor of the specified radius
   *
   * @param [Number] radius
   * @param [Number] segments
   * @return [Number] id created actor handle
   */

  AREActorInterface.prototype.create2DPolygon = function(radius, segments) {
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

  AREActorInterface.prototype.create2DRectangle = function(width, height) {
    return new ARERectangleActor(this._renderer, width, height).getId();
  };


  /*
   * Creates a circle actor with the specified radius
   *
   * @param [Number] radius
   * @return [Number] id created actor handle
   */

  AREActorInterface.prototype.create2DCircle = function(radius) {
    return new ARECircleActor(this._renderer, radius).getId();
  };


  /*
   * Get actor render layer
   *
   * @param [Number] id
   * @return [Number] layer
   */

  AREActorInterface.prototype.getLayer = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getLayer();
    } else {
      return null;
    }
  };


  /*
   * Get actor physics layer
   *
   * @param [Number] id
   * @return [Number] physicsLayer
   */

  AREActorInterface.prototype.getPhysicsLayer = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getPhysicsLayer();
    } else {
      return null;
    }
  };


  /*
   * Fetch the width of the rectangle actor with the specified ID
   *
   * @param [Number] id
   * @return [Number] width
   */

  AREActorInterface.prototype.getRectangleWidth = function(id) {
    var a;
    if ((a = this._findActor(id)) && a instanceof ARERectangleActor) {
      return a.getWidth();
    } else {
      return null;
    }
  };


  /*
   * Fetch the height of the rectangle actor with the specified ID
   *
   * @param [Number] id
   * @return [Number] height
   */

  AREActorInterface.prototype.getRectangleHeight = function(id) {
    var a;
    if ((a = this._findActor(id)) && a instanceof ARERectangleActor) {
      return a.getHeight();
    } else {
      return null;
    }
  };


  /*
   * Get actor opacity using handle, fails with null
   *
   * @param [Number] id
   * @return [Number] opacity
   */

  AREActorInterface.prototype.getOpacity = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getOpacity();
    } else {
      return null;
    }
  };


  /*
   * Get actor visible using handle, fails with null
   *
   * @param [Number] id
   * @return [Boolean] visible
   */

  AREActorInterface.prototype.isVisible = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getVisible();
    } else {
      return null;
    }
  };


  /*
   * Get actor position using handle, fails with null
   * Returns position as a JSON representation of a primitive (x, y) object!
   *
   * @param [Number] id
   * @return [Object] position {x, y}
   */

  AREActorInterface.prototype.getPosition = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getPosition();
    } else {
      return null;
    }
  };


  /*
   * Get actor rotation
   *
   * @param [Number] id
   * @param [Boolean] radians defaults to false
   * @return [Number] angle in degrees or radians
   */

  AREActorInterface.prototype.getRotation = function(id, radians) {
    var a;
    if (a = this._findActor(id)) {
      return a.getRotation(!!radians);
    } else {
      return null;
    }
  };


  /*
   * Returns actor color as a JSON triple, in 0-255 range
   * Uses id, fails with null
   *
   * @param [Number] id
   * @return [String] col
   */

  AREActorInterface.prototype.getColor = function(id) {
    var a, color;
    if (a = this._findActor(id)) {
      color = a.getColor();
      return {
        r: color.getR(),
        g: color.getG(),
        b: color.getB()
      };
    } else {
      return null;
    }
  };


  /*
   * Return an Actor's texture name
   *
   * @param [Number] id
   * @return [String] texture_name
   */

  AREActorInterface.prototype.getTexture = function(id) {
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

  AREActorInterface.prototype.getTextureRepeat = function(id) {
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

  AREActorInterface.prototype.setRectangleHeight = function(id, height) {
    var a;
    if ((a = this._findActor(id)) && a instanceof ARERectangleActor) {
      a.setHeight(height);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set the width of the rectangle actor with the specified ID
   *
   * @param [Number] id
   * @param [Number] width
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setRectangleWidth = function(id, width) {
    var a;
    if ((a = this._findActor(id)) && a instanceof ARERectangleActor) {
      a.setWidth(width);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set the segment count of the polygon actor with the specified ID
   *
   * @param [Number] id
   * @param [Number] segments
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setPolygonSegments = function(id, segments) {
    var a;
    if ((a = this._findActor(id)) && a instanceof AREPolygonActor) {
      a.setSegments(segments);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set the radius of the polygon actor with the specified ID
   *
   * @param [Number] id
   * @param [Number] radius
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setPolygonRadius = function(id, radius) {
    var a;
    if ((a = this._findActor(id)) && a instanceof AREPolygonActor) {
      a.setRadius(radius);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Get the radius of the polygon actor with the specified ID
   *
   * @param [Number] id
   * @return [Number] radius
   */

  AREActorInterface.prototype.getPolygonRadius = function(id) {
    var a;
    if ((a = this._findActor(id)) && a instanceof AREPolygonActor) {
      return a.getRadius();
    } else {
      return null;
    }
  };


  /*
   * Get the segment count of the polygon actor with the specified ID
   *
   * @param [Number] id
   * @return [Number] segments
   */

  AREActorInterface.prototype.getPolygonSegments = function(id, radius) {
    var a;
    if ((a = this._findActor(id)) && a instanceof AREPolygonActor) {
      return a.getSegments();
    } else {
      return null;
    }
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

  AREActorInterface.prototype.setLayer = function(id, layer) {
    var a;
    if (a = this._findActor(id)) {
      a.setLayer(layer);
      return true;
    } else {
      return false;
    }
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

  AREActorInterface.prototype.setPhysicsLayer = function(id, layer) {
    var a;
    if (a = this._findActor(id)) {
      a.setPhysicsLayer(layer);
      return true;
    } else {
      return false;
    }
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
    } else {
      return false;
    }
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
    } else {
      return false;
    }
  };


  /*
   * Refresh actor vertices, passed in as a JSON representation of a flat array
   *
   * @param [Number] id actor id
   * @param [String] verts
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setVertices = function(id, verts) {
    var a;
    if (a = this._findActor(id)) {
      a.updateVertices(JSON.parse(verts));
      return true;
    } else {
      return false;
    }
  };


  /*
   * Get actor vertices as a flat array
   *
   * @param [Number] id actor id
   * @return [Array<Number>] vertices
   */

  AREActorInterface.prototype.getVertices = function(id) {
    var a;
    if (a = this._findActor(id)) {
      return a.getVertices();
    } else {
      return null;
    }
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
    } else {
      return false;
    }
  };


  /*
   * Supply an alternate set of vertices for the physics body of an actor. This
   * is necessary for triangle-fan shapes, since the center point must be
   * removed when building the physics body. If a physics body already exists,
   * this rebuilds it!
   *
   * @param [Number] id actor id
   * @param [Array<Number>] verts
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setPhysicsVertices = function(id, verts) {
    var a;
    if (a = this._findActor(id)) {
      a.setPhysicsVertices(verts);
      return true;
    } else {
      return false;
    }
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
    } else {
      return false;
    }
  };


  /*
   * Set actor opacity using handle, fails with false
   *
   * @param [Number] id
   * @param [Number opacity
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setOpacity = function(id, opacity) {
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
    } else {
      return false;
    }
  };


  /*
   * Set actor visible using handle, fails with false
   *
   * @param [Number] id
   * @param [Boolean] visible
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setVisible = function(id, visible) {
    var a;
    if (a = this._findActor(id)) {
      a.setVisible(visible);
      return true;
    } else {
      return false;
    }
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

  AREActorInterface.prototype.setPosition = function(id, position) {
    var a;
    if (a = this._findActor(id)) {
      a.setPosition(position);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set actor rotation using handle, fails with false
   *
   * @param [Number] id
   * @param [Number] angle in degrees or radians
   * @param [Boolean] radians defaults to false
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setRotation = function(id, angle, radians) {
    var a;
    if (a = this._findActor(id)) {
      a.setRotation(angle, !!radians);
      return true;
    } else {
      return false;
    }
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

  AREActorInterface.prototype.setColor = function(id, color) {
    var a;
    if (a = this._findActor(id)) {
      a.setColor(color);
      return true;
    } else {
      return false;
    }
  };


  /*
   * Set actor texture by texture handle. Expects the texture to already be
   * loaded by the asset system!
   *
   * @param [Number] id
   * @param [String] name
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setTexture = function(id, name) {
    var a;
    if (a = this._findActor(id)) {
      a.setTexture(name);
      return true;
    } else {
      return false;
    }
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

  AREActorInterface.prototype.setTextureRepeat = function(id, repeat) {
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

  AREActorInterface.prototype.createPhysicsBody = function(id, mass, friction, elasticity) {
    var a;
    if (a = this._findActor(id)) {
      a.createPhysicsBody(mass, friction, elasticity);
      return true;
    } else {
      return false;
    }
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
    } else {
      return false;
    }
  };

  AREActorInterface.prototype.enable2DMode = function(id) {
    return false;
  };

  AREActorInterface.prototype.disable2DMode = function(id) {
    return false;
  };

  AREActorInterface.prototype.is2DModeEnabled = function(id) {
    return false;
  };

  AREActorInterface.prototype.create3DActor = function(verts) {
    return false;
  };

  AREActorInterface.prototype.beginActorBatch = function() {
    return false;
  };

  AREActorInterface.prototype.endActorBatch = function() {
    return false;
  };

  AREActorInterface.prototype.set2DRotation = function(id, angle) {
    return false;
  };

  AREActorInterface.prototype.rotateInto2DPlane = function(id) {
    return false;
  };

  AREActorInterface.prototype.clearTexture = function(id) {
    return false;
  };

  AREActorInterface.prototype.set2DVertices = function(id, verts) {
    return false;
  };

  AREActorInterface.prototype.setTextureCoords = function(id, coords) {
    return false;
  };

  AREActorInterface.prototype.getTextureCoords = function(id) {
    return null;
  };

  AREActorInterface.prototype.get2DRotation = function(id) {
    return null;
  };

  AREActorInterface.prototype.getAABB = function(id) {
    return null;
  };

  AREActorInterface.prototype.destroy = function(id) {
    return false;
  };

  AREActorInterface.prototype.setAttachment = function(id, attachment) {
    return false;
  };

  AREActorInterface.prototype.setAttachmentOffset = function(id, offset) {
    return false;
  };

  AREActorInterface.prototype.setAttachmentRotation = function(id, rotation) {
    return false;
  };

  AREActorInterface.prototype.getAttachmentID = function(id) {
    return null;
  };

  AREActorInterface.prototype.getAttachmentVisibility = function(id) {
    return null;
  };

  AREActorInterface.prototype.getAttachmentOffset = function(id) {
    return null;
  };

  AREActorInterface.prototype.getAttachmentRotation = function(id) {
    return null;
  };

  return AREActorInterface;

})();
