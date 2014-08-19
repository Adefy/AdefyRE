var ARE, AREActorInterface, AREAnimationInterface, AREBezAnimation, ARECircleActor, AREColor3, AREEngineInterface, AREInterface, ARELog, AREPolygonActor, AREPsyxAnimation, ARERawActor, ARERectangleActor, ARERenderer, AREShader, ARETriangleActor, AREVector2, AREVertAnimation, PhysicsManager, nextHighestPowerOfTwo, precision, precision_declaration, varying_precision,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ARERawActor = (function() {
  ARERawActor.defaultFriction = 0.3;

  ARERawActor.defaultMass = 10;

  ARERawActor.defaultElasticity = 0.2;


  /*
   * Adds the actor to the renderer actor list, gets a unique id from the
   * renderer, and builds our vert buffer.
   *
   * If no texture verts are provided, a default array is provided for square
   * actors.
   *
   * @param [ARERenderer] renderer
   * @param [Array<Number>] vertices flat array of vertices (x1, y1, x2, ...)
   * @param [Array<Number>] texverts flat array of texture coords, optional
   */

  function ARERawActor(_renderer, verts, texverts) {
    this._renderer = _renderer;
    this._initializeValues();
    this._id = this._renderer.getNextId();
    this._renderer.addActor(this);
    if (this._renderer.getGL()) {
      this._indiceBuffer = this._renderer.getGL().createBuffer();
    }
    this._ownIndiceBuffer = this._indiceBuffer;
    this._hasOwnIndiceBuffer = true;
    this._hostActorId = null;
    this._vertexData = null;
    this._vertStride = 4 * Float32Array.BYTES_PER_ELEMENT;
    this._uvOffset = 2 * Float32Array.BYTES_PER_ELEMENT;
    this.updateVertices(verts, texverts);
    this.setColor(new AREColor3(255, 255, 255));
    this.clearTexture();
  }


  /*
   * Sets up default values and initializes our data structures.
   * @private
   */

  ARERawActor.prototype._initializeValues = function() {
    if (this._renderer.isWGLRendererActive() && !(this._gl = this._renderer.getGL())) {
      throw new Error("GL context is required for actor initialization!");
    }
    this._color = null;
    this._strokeColor = null;
    this._strokeWidth = 1;
    this._colArray = null;
    this._opacity = 1.0;
    this._needsDelete = false;
    this._visible = true;
    this.layer = 0;
    this._physicsLayer = ~0;
    this._id = -1;
    this._position = {
      x: 0,
      y: 0
    };
    this._rotation = 0;
    this._bounds = {
      w: 0,
      h: 0
    };
    this._initializeModelMatrix();
    this._updateModelMatrix();

    /*
     * Physics values
     */
    this._physics = false;
    this._friction = null;
    this._mass = null;
    this._elasticity = null;

    /*
     * Our actual vertex lists. Note that we will optionally use a different
     * set of vertices for the physical body!
     */
    this._vertices = [];
    this._psyxVertices = [];
    this._texVerts = [];

    /*
     * If we modify our UVs (scaling, translation), we always do so relative
     * to the original UVs in this array (updated on true UV update)
     */
    this._origTexVerts = [];

    /*
     * Vertice containers
     */
    this._vertBuffer = null;
    this._vertBufferFloats = null;

    /*
     * Shader handles, for now there are only three
     */
    this._sh_handles = {};

    /*
     * Render modes decide how the vertices are treated.
     * @see AREREnderer.GL_MODE_*
     */
    this._renderMode = ARERenderer.GL_MODE_TRIANGLE_FAN;

    /*
     * Render styles decide how the object is filled/stroked
     * @see AREREnderer.RENDER_STYLE_*
     */
    this._renderStyle = ARERenderer.RENDER_STYLE_FILL;
    this._texture = null;
    this._clipRect = [0.0, 0.0, 1.0, 1.0];
    this._attachedTexture = null;
    return this.attachedTextureAnchor = {
      clipRect: [0.0, 0.0, 1.0, 1.0],
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      angle: 0
    };
  };


  /*
   * Return the renderer that we belong to
   *
   * @return [ARERenderer] renderer
   */

  ARERawActor.prototype.getRenderer = function() {
    return this._renderer;
  };


  /*
   * Helper to signal to the renderer that we need to be deleted
   * This is done so actors can be deleted in one batch at the end of the render
   * loop
   */

  ARERawActor.prototype.flagForDelete = function() {
    return this._needsDelete = true;
  };


  /*
   * Check if we need to be deleted
   *
   * @return [Boolean] delete
   */

  ARERawActor.prototype.flaggedForDeletion = function() {
    return this._needsDelete;
  };


  /*
   * Removes the Actor
   */

  ARERawActor.prototype.destroy = function() {
    return this.flagForDelete();
  };


  /*
   * Delete the actor, should only be called by the renderer!
   */

  ARERawActor.prototype.rendererActorDelete = function() {
    var a, outsourcedActors, _i, _len;
    this.destroyPhysicsBody();
    outsourcedActors = _.filter(this._renderer._actors, function(a) {
      return !a.hasOwnIndiceBuffer();
    });
    for (_i = 0, _len = outsourcedActors.length; _i < _len; _i++) {
      a = outsourcedActors[_i];
      if (a.getHostId() === this._id) {
        a.clearHostIndiceBuffer();
      }
    }
    return this._renderer.getGL().deleteBuffer(this._ownIndiceBuffer);
  };


  /*
   * Get the WebGL pointer to our indice buffer
   *
   * @return [Number]
   */

  ARERawActor.prototype.getIndiceBuffer = function() {
    return this._ownIndiceBuffer;
  };


  /*
   * Get the WebGL pointer to our used indice buffer (likely to be borrowed)
   *
   * @return [Number]
   */

  ARERawActor.prototype.getUsedIndiceBuffer = function() {
    return this._ownIndiceBuffer;
  };


  /*
   * Useful method allowing us to re-use another actor's indice buffer. This
   * helps keep renderer VBO size down.
   *
   * @param [Number] buffer
   * @param [Number] actorId
   */

  ARERawActor.prototype.setHostIndiceBuffer = function(buffer, actorId) {
    this._indiceBuffer = buffer;
    this._hostActorId = actorId;
    this._hasOwnIndiceBuffer = false;
    return this._renderer.requestVBORefresh();
  };


  /*
   * Get the ID of our indice buffer host. Null if we have none
   *
   * @return [Number] id
   */

  ARERawActor.prototype.getHostId = function() {
    return this._hostActorId;
  };


  /*
   * Clears any indice buffer host we may have. NOTE: This requires a VBO
   * refresh!
   */

  ARERawActor.prototype.clearHostIndiceBuffer = function() {
    this._indiceBuffer = this._ownIndiceBuffer;
    this._hasOwnIndiceBuffer = true;
    this._hostActorId = null;
    return this._renderer.requestVBORefresh();
  };


  /*
   * Check if we have our own indice buffer
   *
   * @return [Boolean] hasOwn
   */

  ARERawActor.prototype.hasOwnIndiceBuffer = function() {
    return this._hasOwnIndiceBuffer;
  };


  /*
   * Get material name
   *
   * @return [String] material
   */

  ARERawActor.prototype.getMaterial = function() {
    return this._material;
  };


  /*
   * Get actor layer
   *
   * @return [Number] layer
   */

  ARERawActor.prototype.getLayer = function() {
    return this.layer;
  };


  /*
   * Set our render layer. Higher layers render on top of lower ones
   *
   * @param [Number] layer
   */

  ARERawActor.prototype.setLayer = function(layer) {
    this.layer = layer;
    this._renderer.removeActor(this, true);
    return this._renderer.addActor(this, layer);
  };


  /*
   * Check if we have a texture set
   *
   * @return [Boolean] hasTexture
   */

  ARERawActor.prototype.hasTexture = function() {
    return !!this._texture;
  };


  /*
   * We support a single texture per actor for the time being. UV coords are
   * generated automatically internally, for a flat map.
   *
   * @param [String] name name of texture to use from renderer
   * @return [this]
   */

  ARERawActor.prototype.setTexture = function(name) {
    if (!this._renderer.hasTexture(name)) {
      throw new Error("No such texture loaded: " + name);
    }
    this._texture = this._renderer.getTexture(name);
    this.setShader(this._renderer.getTextureShader());
    this._material = ARERenderer.MATERIAL_TEXTURE;
    return this;
  };


  /*
   * Clear our internal texture, leaving us to render with a flat color
   * @return [this]
   */

  ARERawActor.prototype.clearTexture = function() {
    this._texture = void 0;
    this._texRepeatX = 1;
    this._texRepeatY = 1;
    if (this._renderer.getDefaultShader()) {
      this.setShader(this._renderer.getDefaultShader());
    }
    this._material = ARERenderer.MATERIAL_FLAT;
    return this;
  };


  /*
   * Get our texture, if we have one
   *
   * @return [WebGLTexture] texture
   */

  ARERawActor.prototype.getTexture = function() {
    return this._texture;
  };


  /*
   * Get the actor's texture repeat
   *
   * @return [Object]
   *   @option [Number] x
   *   @option [Number] y
   */

  ARERawActor.prototype.getTextureRepeat = function() {
    return {
      x: this._texRepeatX,
      y: this._texRepeatY
    };
  };


  /*
   * Set shader used to draw actor. For the time being, the routine mearly
   * pulls out handles for the ModelView, Color, and Position structures
   *
   * @param [AREShader] shader
   * @return [this]
   */

  ARERawActor.prototype.setShader = function(shader) {
    if (!this._renderer.isWGLRendererActive()) {
      return;
    }
    if (!shader.getProgram()) {
      throw new Error("Shader has to be built before it can be used!");
    }
    if (!shader.getHandles()) {
      shader.generateHandles();
    }
    return this._sh_handles = shader.getHandles();
  };


  /*
   * @return [Boolean]
   */

  ARERawActor.prototype.hasPhysics = function() {
    return this._physics;
  };


  /*
   * Creates the internal physics body, if one does not already exist
   *
   * @param [Number] mass 0.0 - unbound
   * @param [Number] friction 0.0 - unbound
   * @param [Number] elasticity 0.0 - unbound
   * @param [Boolean] refresh optionally delete any existing body/shape
   */

  ARERawActor.prototype.createPhysicsBody = function(_mass, _friction, _elasticity, refresh) {
    var a, bodyDef, command, i, origVerts, shapeDef, vertIndex, verts, x, y, _i, _ref;
    this._mass = _mass;
    this._friction = _friction;
    this._elasticity = _elasticity;
    if (this._physics) {
      return;
    }
    if (isNaN(this._mass)) {
      return;
    }
    refresh = !!refresh;
    this._friction || (this._friction = ARERawActor.defaultFriction);
    this._elasticity || (this._elasticity = ARERawActor.defaultElasticity);
    if (this._mass < 0) {
      this._mass = 0;
    }
    if (this._friction) {
      this._friction = 0;
    }
    if (this._elasticity < 0) {
      this._elasticity = 0;
    }
    verts = [];
    vertIndex = 0;
    origVerts = null;
    if (this._psyxVertices.length > 6) {
      origVerts = this._psyxVertices;
    } else {
      origVerts = this._vertices;
    }
    for (i = _i = 0, _ref = origVerts.length - 1; _i < _ref; i = _i += 2) {
      verts.push(origVerts[i]);
      verts.push(origVerts[i + 1]);
      if (this._mass === 0) {
        x = verts[verts.length - 2];
        y = verts[verts.length - 1];
        a = this._rotation;
        verts[verts.length - 2] = x * Math.cos(a) - (y * Math.sin(a));
        verts[verts.length - 1] = x * Math.sin(a) + (y * Math.cos(a));
      }
    }
    bodyDef = null;
    shapeDef = {
      id: this._id,
      type: "Polygon",
      vertices: verts,
      "static": false,
      position: this._position,
      friction: this._friction,
      elasticity: this._elasticity,
      layer: this._physicsLayer
    };
    if (this._mass === 0) {
      shapeDef["static"] = true;
      shapeDef.position = this._position;
    } else {
      bodyDef = {
        id: this._id,
        position: this._position,
        angle: this._rotation,
        mass: this._mass,
        momentV: {
          x: 0,
          y: 0
        },
        vertices: verts
      };
      shapeDef.position = {
        x: 0,
        y: 0
      };
    }
    this._physics = true;
    window.AREPhysicsManager.sendMessage({}, "physics.enable");
    if (bodyDef) {
      if (refresh) {
        command = "physics.body.refresh";
      } else {
        command = "physics.body.create";
      }
      window.AREPhysicsManager.sendMessage({
        def: bodyDef,
        id: this._id
      }, command);
    }
    if (shapeDef) {
      if (refresh) {
        command = "physics.shape.refresh";
      } else {
        command = "physics.shape.create";
      }
      window.AREPhysicsManager.sendMessage({
        def: shapeDef,
        id: this._id
      }, command);
    }
    return this;
  };


  /*
   * Destroys the physics body if one exists
   */

  ARERawActor.prototype.destroyPhysicsBody = function() {
    if (!this._physics) {
      return;
    }
    window.AREPhysicsManager.sendMessage({
      id: this._id
    }, "physics.shape.remove");
    if (this._mass !== 0) {
      window.AREPhysicsManager.sendMessage({
        id: this._id
      }, "physics.body.remove");
    }
    this._physics = false;
    return this;
  };

  ARERawActor.prototype.enablePhysics = function() {
    if (!this.hasPhysics()) {
      this.createPhysicsBody();
    }
    return this;
  };

  ARERawActor.prototype.disablePhysics = function() {
    if (this.hasPhysics()) {
      this.destroyPhysicsBody;
    }
    return this;
  };

  ARERawActor.prototype.refreshPhysics = function() {
    if (!this.hasPhysics()) {
      return;
    }
    return this.createPhysicsBody(this._mass, this._friction, this._elasticity, true);
  };


  /*
   * @return [Number] mass
   */

  ARERawActor.prototype.getMass = function() {
    return this._mass;
  };


  /*
   * @return [Number] elasticity
   */

  ARERawActor.prototype.getElasticity = function() {
    return this._elasticity;
  };


  /*
   * @return [Number] friction
   */

  ARERawActor.prototype.getFriction = function() {
    return this._friction;
  };


  /*
   * Set Actor mass property
   *
   * @param [Number] mass
   */

  ARERawActor.prototype.setMass = function(_mass) {
    this._mass = _mass;
    this.refreshPhysics();
    return this;
  };


  /*
   * Set Actor elasticity property
   *
   * @param [Number] elasticity
   */

  ARERawActor.prototype.setElasticity = function(_elasticity) {
    this._elasticity = _elasticity;
    this.refreshPhysics();
    return this;
  };


  /*
   * Set Actor friction property
   *
   * @param [Number] friction
   */

  ARERawActor.prototype.setFriction = function(_friction) {
    this._friction = _friction;
    this.refreshPhysics();
    return this;
  };


  /*
   * @return [Number] mass
   */

  ARERawActor.prototype.getMass = function() {
    return this._mass;
  };


  /*
   * @return [Number] elasticity
   */

  ARERawActor.prototype.getElasticity = function() {
    return this._elasticity;
  };


  /*
   * @return [Number] friction
   */

  ARERawActor.prototype.getFriction = function() {
    return this._friction;
  };


  /*
   * Set Actor mass property
   *
   * @param [Number] mass
   */

  ARERawActor.prototype.setMass = function(_mass) {
    this._mass = _mass;
    this.refreshPhysics();
    return this;
  };


  /*
   * Set Actor elasticity property
   *
   * @param [Number] elasticity
   */

  ARERawActor.prototype.setElasticity = function(_elasticity) {
    this._elasticity = _elasticity;
    this.refreshPhysics();
    return this;
  };


  /*
   * Set Actor friction property
   *
   * @param [Number] friction
   */

  ARERawActor.prototype.setFriction = function(_friction) {
    this._friction = _friction;
    this.refreshPhysics();
    return this;
  };


  /*
   * Get actor physics layer
   *
   * @return [Number] physicsLayer
   */

  ARERawActor.prototype.getPhysicsLayer = function() {
    return this._physicsLayer.toString(2).length - 1;
  };


  /*
   * Set physics layer. If we have a physics body, applies immediately. Value
   * persists between physics bodies!
   *
   * There are only 16 physics layers (17 with default layer 0)!
   *
   * @param [Number] layer
   */

  ARERawActor.prototype.setPhysicsLayer = function(layer) {
    this._physicsLayer = 1 << layer;
    return window.AREPhysicsManager.sendMessage({
      id: this._id,
      layer: this._physicsLayer
    }, "physics.shape.set.layer");
  };


  /*
   * Update our vertices, causing a rebuild of the physics body, if it doesn't
   * have its' own set of verts. Note that for large actors this is expensive.
   *
   * Texture coordinates are only required if the actor needs to be textured. If
   * provided, the array must be the same length as that containing the vertices.
   *
   * If either array is missing, no updates to that array are made.
   *
   * @param [Array<Number>] verts flat array of vertices
   * @param [Array<Number>] texverts flat array of texture coords
   */

  ARERawActor.prototype.updateVertices = function(vertices, texverts) {
    var i, mnx, mny, mxx, mxy, newTexVerts, newVertices, _i, _j, _ref, _ref1;
    newVertices = vertices || this._vertices;
    newTexVerts = texverts || this._texVerts;
    if (newVertices.length < 6) {
      throw new Error("At least 3 vertices make up an actor");
    }
    if (newTexVerts !== this._texVerts) {
      if (newVertices !== this._vertices) {
        if (newVertices.length !== newTexVerts.length) {
          throw new Error("Vert and UV count must match!");
        }
      } else {
        if (this._vertices.length !== newTexVerts.length) {
          throw new Error("Vert and UV count must match!");
        }
      }
    }
    this._vertices = newVertices;
    this._texVerts = newTexVerts;
    this._origTexVerts = newTexVerts;
    this._vertexData = [];
    for (i = _i = 0, _ref = this._vertices.length / 2; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      this._vertexData.push(this._vertices[i * 2]);
      this._vertexData.push(this._vertices[i * 2 + 1]);
      this._vertexData.push(this._texVerts[i * 2]);
      this._vertexData.push(this._texVerts[i * 2 + 1]);
    }
    this._vertCount = this._vertexData.length / 4;
    mnx = 0;
    mny = 0;
    mxx = 0;
    mxy = 0;
    for (i = _j = 1, _ref1 = this._vertices.length / 2; 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 1 <= _ref1 ? ++_j : --_j) {
      if (mnx > this._vertices[i * 2]) {
        mnx = this._vertices[i * 2];
      }
      if (mxx < this._vertices[i * 2]) {
        mxx = this._vertices[i * 2];
      }
      if (mny > this._vertices[i * 2 + 1]) {
        mny = this._vertices[i * 2 + 1];
      }
      if (mxy < this._vertices[i * 2 + 1]) {
        mxy = this._vertices[i * 2 + 1];
      }
    }
    this._bounds = {
      w: mxx - mnx,
      h: mxy - mny
    };
    if (this._onSizeChange) {
      this._onSizeChange(this._bounds);
    }
    return this._renderer.requestVBORefresh();
  };


  /*
   * Called when the renderer has new vertex indices for us. We must regenerate
   * our indice buffer.
   *
   * @param [Array<Number>] indices
   */

  ARERawActor.prototype.updateIndices = function(indices) {
    var rawIndices;
    rawIndices = new Uint16Array(indices);
    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indiceBuffer);
    return this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, rawIndices, this._gl.STATIC_DRAW);
  };


  /*
   * Get raw vertex data, used by the renderer for VBO generation. Array is in
   * the form of <X1, Y1, U1, V1>, <X2, Y2, U2, V2>, ..., <Xn, Yn, Un, Vn> for
   * n vertices.
   *
   * @return [Array<Number>] data
   */

  ARERawActor.prototype.getRawVertexData = function() {
    return this._vertexData;
  };


  /*
   * Set texture repeat per coordinate axis
   *
   * @param [Number] x horizontal repeat
   * @param [Number] y vertical repeat (default 1)
   */

  ARERawActor.prototype.setTextureRepeat = function(x, y) {
    var i, uvs, _i, _ref;
    x || (x = 1);
    y || (y = 1);
    uvs = [];
    for (i = _i = 0, _ref = this._origTexVerts.length; _i < _ref; i = _i += 2) {
      uvs.push((this._origTexVerts[i] / this._texRepeatX) * x);
      uvs.push((this._origTexVerts[i + 1] / this._texRepeatY) * y);
    }
    this._texRepeatX = x;
    this._texRepeatY = y;
    this.updateVertices(this._vertices, uvs);
    return this;
  };


  /*
   * Set an alternate vertex array for our physics object. Note that this also
   * triggers a rebuild! If less than 6 vertices are provided, the normal
   * set of vertices is used
   *
   * @param [Array<Number>] verts flat array of vertices
   */

  ARERawActor.prototype.setPhysicsVertices = function(verts) {
    this._psyxVertices = verts;
    return this.refreshPhysics();
  };


  /*
   * Attach texture to render instead of ourselves. This is very useful when
   * texturing strange physics shapes. We create a square actor of the desired
   * dimensions, set the texture, and render it instead of ourselves when it is
   * visible.
   *
   * If we are not visible, the attached texture does not render! If it is
   * invisible, we render ourselves instead.
   *
   * We perform a check for the existence of the texture, and throw an error if
   * it isn't found.
   *
   * @param [String] texture texture name
   * @param [Number] width attached actor width
   * @param [Number] height attached actor height
   * @param [Number] offx anchor point offset
   * @param [Number] offy anchor point offset
   * @param [Angle] angle anchor point rotation
   * @return [ARERawActor] actor attached actor
   */

  ARERawActor.prototype.attachTexture = function(texture, width, height, offx, offy, angle) {
    this.attachedTextureAnchor.width = width;
    this.attachedTextureAnchor.height = height;
    this.attachedTextureAnchor.x = offx || 0;
    this.attachedTextureAnchor.y = offy || 0;
    this.attachedTextureAnchor.angle = angle || 0;
    if (!this._renderer.hasTexture(texture)) {
      throw new Error("No such texture loaded: " + texture);
    }
    if (this._attachedTexture) {
      this.removeAttachment();
    }
    this._attachedTexture = new ARERectangleActor(width, height);
    this._attachedTexture.setTexture(texture);
    return this._attachedTexture;
  };


  /*
   * Remove attached texture, if we have one
   *
   * @return [Boolean] success fails if we have no attached texture
   */

  ARERawActor.prototype.removeAttachment = function() {
    if (!this._attachedTexture) {
      return false;
    }
    this._attachedTexture.destroy();
    return true;
  };


  /*
   * Set attachment visiblity. Fails if we don't have an attached texture
   *
   * @param [Boolean] visible
   * @return [Boolean] success
   */

  ARERawActor.prototype.setAttachmentVisibility = function(visible) {
    if (!this._attachedTexture) {
      return false;
    }
    this._attachedTexture._visible = visible;
    return true;
  };


  /*
   * Checks to see if we have an attached texture
   *
   * @return [Boolean] hasAttachment
   */

  ARERawActor.prototype.hasAttachment = function() {
    return this._attachedTexture !== null;
  };


  /*
   * Returns attached texture if we have one, null otherwise
   *
   * @return [ARERawActor] attachment
   */

  ARERawActor.prototype.getAttachment = function() {
    return this._attachedTexture;
  };


  /*
   * Updates any attachments on the actor, if there are any, the value
   * returned is the attachment, if not, then the actor is returned instead.
   * @return [ARERawActor]
   */

  ARERawActor.prototype.updateAttachment = function() {
    var a, pos, rot;
    if (this.hasAttachment() && this.getAttachment()._visible) {
      pos = this.getPosition();
      rot = this.getRotation();
      pos.x += this.attachedTextureAnchor.x;
      pos.y += this.attachedTextureAnchor.y;
      rot += this.attachedTextureAnchor.angle;
      a = this.getAttachment();
      a.setPosition(pos);
      a.setRotation(rot);
      return a;
    } else {
      return this;
    }
  };


  /*
   * Binds the actor's WebGL Texture with all needed attributes
   * @param [Object] gl WebGL Context
   */

  ARERawActor.prototype.wglBindTexture = function(gl) {
    this._renderer._currentTexture = this._texture.texture;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._texture.texture);
    gl.uniform1i(this._sh_handles.uSampler, 0);
    return this;
  };


  /*
   * Updates our @_modelM based on our current position and rotation. This used
   * to be in our @wglDraw method, and it used to use methods from EWGL_math.js
   *
   * Since our rotation vector is ALWAYS (0, 0, 1) and our translation Z coord
   * always 1.0, we can reduce the majority of the previous operations, and
   * directly set matrix values ourselves.
   *
   * Since most matrix values never actually change (always either 0, or 1), we
   * set those up in @_initializeModelMatrix() and never touch them again :D
   *
   * This is FUGLY, but as long as we are 2D-only, it's as fast as it gets.
   *
   * THIS. IS. SPARTAAAAA!.
   */

  ARERawActor.prototype._updateModelMatrix = function() {
    var c, camPos, pos, s;
    pos = this._position;
    camPos = this._renderer.getCameraPosition();
    s = Math.sin(this._rotation);
    c = Math.cos(this._rotation);
    this._modelM[0] = c;
    this._modelM[1] = s;
    this._modelM[4] = -s;
    this._modelM[5] = c;
    this._modelM[12] = pos.x - camPos.x;
    return this._modelM[13] = pos.y - camPos.y;
  };


  /*
   * Sets the constant values in our model matrix so that calls to
   * @_updateModelMatrix are sufficient to update our rendered state.
   */

  ARERawActor.prototype._initializeModelMatrix = function() {
    this._modelM = [16];
    this._modelM[2] = 0;
    this._modelM[3] = 0;
    this._modelM[6] = 0;
    this._modelM[7] = 0;
    this._modelM[8] = 0;
    this._modelM[9] = 0;
    this._modelM[10] = 1;
    this._modelM[11] = 0;
    this._modelM[14] = 1;
    return this._modelM[15] = 1;
  };


  /*
   * Renders the Actor using the WebGL interface, this function should only
   * be called by a ARERenderer in WGL mode
   *
   * @param [Object] gl WebGL context
   * @param [Shader] shader optional shader to override our own
   */

  ARERawActor.prototype.wglDraw = function(gl, shader) {
    var _sh_handles_backup;
    if (!this._visible) {
      return;
    }
    this._updateModelMatrix();
    if (shader) {
      _sh_handles_backup = this._sh_handles;
      this._sh_handles = shader.getHandles();
    }
    gl.uniformMatrix4fv(this._sh_handles.uModelView, false, this._modelM);
    gl.uniform4f(this._sh_handles.uColor, this._colArray[0], this._colArray[1], this._colArray[2], 1.0);
    if (this._sh_handles.uClipRect) {
      gl.uniform4fv(this._sh_handles.uClipRect, this._clipRect);
    }
    gl.uniform1f(this._sh_handles.uOpacity, this._opacity);
    gl.enableVertexAttribArray(this._sh_handles.aPosition);
    gl.vertexAttribPointer(this._sh_handles.aPosition, 2, gl.FLOAT, false, this._vertStride, 0);
    if (this._sh_handles.aTexCoord !== void 0) {
      gl.enableVertexAttribArray(this._sh_handles.aTexCoord);
      gl.vertexAttribPointer(this._sh_handles.aTexCoord, 2, gl.FLOAT, false, this._vertStride, this._uvOffset);
    }
    if (this._renderer._currentMaterial === ARERenderer.MATERIAL_TEXTURE) {
      if (this._renderer._currentTexture !== this._texture.texture) {
        this.wglBindTexture(gl);
      }
    }
    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indiceBuffer);

    /*
     * @TODO, actually apply the RENDER_STYLE_*
     */
    switch (this._renderMode) {
      case ARERenderer.GL_MODE_LINE_LOOP:
        gl.drawElements(gl.LINE_LOOP, this._vertCount, gl.UNSIGNED_SHORT, 0);
        break;
      case ARERenderer.GL_MODE_TRIANGLE_FAN:
        gl.drawElements(gl.TRIANGLE_FAN, this._vertCount, gl.UNSIGNED_SHORT, 0);
        break;
      case ARERenderer.GL_MODE_TRIANGLE_STRIP:
        gl.drawElements(gl.TRIANGLE_STRIP, this._vertCount, gl.UNSIGNED_SHORT, 0);
        break;
      default:
        throw new Error("Invalid render mode! " + this._renderMode);
    }
    if (shader) {
      this._sh_handles = _sh_handles_backup;
    }
    return this;
  };


  /*
   * Updates the context settings with the Actor's strokeStyle and fillStyle
   * @param [Object] 2d context
   */

  ARERawActor.prototype.cvSetupStyle = function(context) {
    var a, b, g, r;
    if (this._strokeWidth !== null) {
      context.lineWidth = this._strokeWidth;
    } else {
      context.lineWidth = 1;
    }
    if (this._strokeColor) {
      r = Number(this._strokeColor._r).toFixed(0);
      g = Number(this._strokeColor._g).toFixed(0);
      b = Number(this._strokeColor._b).toFixed(0);
      a = Number(this._opacity).toFixed(4);
      context.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
    } else {
      context.strokeStyle = "#FFF";
    }
    if (this._renderer._currentMaterial === ARERenderer.MATERIAL_TEXTURE) {

    } else {
      if (this._color) {
        r = Number(this._color._r).toFixed(0);
        g = Number(this._color._g).toFixed(0);
        b = Number(this._color._b).toFixed(0);
        a = Number(this._opacity).toFixed(4);
        context.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
      } else {
        context.fillStyle = "#FFF";
      }
    }
    return this;
  };


  /*
   * Renders the current actor using the 2d context, this function should only
   * be called by a ARERenderer in CANVAS mode
   *
   * @param [Object] 2d context
   * @return [self]
   */

  ARERawActor.prototype.cvDraw = function(context) {
    var i, _i, _ref;
    if (!this._visible) {
      return;
    }
    this._updateModelMatrix();
    context.translate(this._modelM[12], context.canvas.clientHeight - this._modelM[13]);
    context.beginPath();
    context.rotate(this._rotation);
    context.moveTo(this._vertices[0], this._vertices[1]);
    for (i = _i = 1, _ref = this._vertices.length / 2; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
      context.lineTo(this._vertices[i * 2], this._vertices[i * 2 + 1]);
    }
    context.closePath();
    this.cvSetupStyle(context);
    context.scale(1, -1);
    switch (this._renderMode) {
      case ARERenderer.GL_MODE_LINE_LOOP:
        context.stroke();
        break;
      case ARERenderer.GL_MODE_TRIANGLE_STRIP:
      case ARERenderer.GL_MODE_TRIANGLE_FAN:
        if ((this._renderStyle & ARERenderer.RENDER_STYLE_STROKE) > 0) {
          context.stroke();
        }
        if ((this._renderStyle & ARERenderer.RENDER_STYLE_FILL) > 0) {
          if (this._renderer._currentMaterial === ARERenderer.MATERIAL_TEXTURE) {
            context.clip();
            context.drawImage(this._texture.texture, -this._bounds.w / 2, -this._bounds.h / 2, this._bounds.w, this._bounds.h);
          } else {
            context.fill();
          }
        }
        break;
      default:
        throw new Error("Invalid render mode! " + this._renderMode);
    }
    return this;
  };


  /*
   * Renders the current actor using the 2d context, however, nothing is
   * drawn, only the internal position is updated
   * this function should only be called by a ARERenderer in NULL mode
   * @param [Object] 2d context
   */

  ARERawActor.prototype.nullDraw = function(context) {
    if (!this._visible) {
      return;
    }
    return this;
  };


  /*
   * Set actor render mode, decides how the vertices are perceived
   * @see ARERenderer.GL_MODE_*
   *
   * @paran [Number] mode
   * @return [self]
   */

  ARERawActor.prototype.setRenderMode = function(_renderMode) {
    this._renderMode = _renderMode;
    return this;
  };


  /*
   * Set actor render style, decides how the object is filled/stroked
   * @see ARERenderer.RENDER_STYLE_*
   *
   * @paran [Number] mode
   * @return [self]
   */

  ARERawActor.prototype.setRenderStyle = function(_renderStyle) {
    this._renderStyle = _renderStyle;
    return this;
  };


  /*
   * Set actor opacity
   *
   * @param [Number] opacity
   * @return [self]
   */

  ARERawActor.prototype.setOpacity = function(_opacity) {
    this._opacity = _opacity;
    return this;
  };


  /*
   * Register an orientation change listener
   *
   * @param [Method] cb
   */

  ARERawActor.prototype.setOnOrientationChange = function(cb) {
    return this._onOrientationChange = cb;
  };


  /*
   * Register a size change listener
   *
   * @param [Method] cb
   */

  ARERawActor.prototype.setOnSizeChange = function(cb) {
    return this._onSizeChange = cb;
  };


  /*
   * Set actor position, affects either the actor or the body directly if one
   * exists
   *
   * @param [Object] position x, y
   * @return [self]
   */

  ARERawActor.prototype.setPosition = function(_position) {
    this._position = _position;
    if (this.hasPhysics()) {
      window.AREPhysicsManager.sendMessage({
        id: this._id,
        position: this._position
      }, "physics.body.set.position");
    }
    if (this._onOrientationChange) {
      this._onOrientationChange({
        position: this._position
      });
    }
    return this;
  };


  /*
   * Set actor rotation, affects either the actor or the body directly if one
   * exists
   *
   * @param [Number] rotation angle
   * @param [Boolean] radians true if angle is in radians
   * @return [self]
   */

  ARERawActor.prototype.setRotation = function(rotation, radians) {
    radians = !!radians;
    if (!radians) {
      rotation = Number(rotation) * 0.0174532925;
    }
    if (this._rotation === rotation) {
      return;
    }
    this._rotation = rotation;
    if (this.hasPhysics()) {
      if (this._mass > 0) {
        window.AREPhysicsManager.sendMessage({
          id: this._id,
          rotation: this._rotation
        }, "physics.body.set.rotation");
      } else {
        this.refreshPhysics();
      }
    }
    if (this._onOrientationChange) {
      this._onOrientationChange({
        rotation: this._rotation
      });
    }
    return this;
  };


  /*
   * Sets the character outline/stroke width
   *
   * @param [Number] width
   * @return [self]
   */

  ARERawActor.prototype.setStrokeWidth = function(width) {
    this._strokeWidth = Number(width);
    return this;
  };


  /*
   * Set color
   * @private
   * @param [Integer] target color to extract information to
   * @overload setColor_ext(target,col)
   *   Sets the color using an AREColor3 instance
   *   @param [AREColor3] color
   *
   * @overload setColor_ext(target, r, g, b)
   *   Sets the color using component values
   *   @param [Integer] r red component
   *   @param [Integer] g green component
   *   @param [Integer] b blue component
   * @return [self]
   */

  ARERawActor.prototype.setColor_ext = function(target, colOrR, g, b) {
    if (colOrR instanceof AREColor3) {
      target.setR(colOrR.getR());
      target.setG(colOrR.getG());
      target.setB(colOrR.getB());
    } else {
      if (!(isNaN(colOrR.g) || isNaN(colOrR.b))) {
        g = colOrR.g;
        b = colOrR.b;
        colOrR = colOrR.r;
      }
      target.setR(Number(colOrR));
      target.setG(Number(g));
      target.setB(Number(b));
    }
    return this;
  };


  /*
   * Set color
   *
   * @overload setColor(col)
   *   Sets the color using an AREColor3 instance
   *   @param [AREColor3] color
   *
   * @overload setColor(r, g, b)
   *   Sets the color using component values
   *   @param [Integer] r red component
   *   @param [Integer] g green component
   *   @param [Integer] b blue component
   * @return [self]
   */

  ARERawActor.prototype.setColor = function(colOrR, g, b) {
    this._color || (this._color = new AREColor3);
    this.setColor_ext(this._color, colOrR, g, b);
    this._colArray = [this._color.getR(true), this._color.getG(true), this._color.getB(true)];
    return this;
  };


  /*
   * Set stroke color
   *
   * @overload setStrokeColor(col)
   *   Sets the color using an AREColor3 instance
   *   @param [AREColor3] color
   *
   * @overload setStrokeColor(r, g, b)
   *   Sets the color using component values
   *   @param [Integer] r red component
   *   @param [Integer] g green component
   *   @param [Integer] b blue component
   * @return [self]
   */

  ARERawActor.prototype.setStrokeColor = function(colOrR, g, b) {
    this._strokeColor || (this._strokeColor = new AREColor3);
    this.setColor_ext(this._strokeColor, colOrR, g, b);
    this._strokeColorArray = [this._strokeColor.getR(true), this._strokeColor.getG(true), this._strokeColor.getB(true)];
    return this;
  };


  /*
   * Set the visible state of the actor
   * @param [Boolean] visible
   * @return [self]
   */

  ARERawActor.prototype.setVisible = function(_visible) {
    this._visible = _visible;
    return this;
  };


  /*
   * Get actor opacity
   *
   * @return [Number] opacity
   */

  ARERawActor.prototype.getOpacity = function() {
    return this._opacity;
  };


  /*
   * Returns the actor position as an object with x and y properties
   *
   * @return [Object] position x, y
   */

  ARERawActor.prototype.getPosition = function() {
    return this._position;
  };

  ARERawActor.prototype.getBounds = function() {
    return this._bounds;
  };


  /*
   * Returns actor rotation as an angle in degrees
   *
   * @param [Boolean] radians true to return in radians
   * @return [Number] angle rotation in degrees on z axis
   */

  ARERawActor.prototype.getRotation = function(radians) {
    if (!!radians) {
      return this._rotation;
    } else {
      return this._rotation * 57.2957795;
    }
  };


  /*
   * Get array of vertices
   *
   * @return [Array<Number>] vertices
   */

  ARERawActor.prototype.getVertices = function() {
    return this._vertices;
  };


  /*
   * Get body id
   *
   * @return [Number] id
   */

  ARERawActor.prototype.getId = function() {
    return this._id;
  };


  /*
   * Get color
   *
   * @return [AREColor3] color
   */

  ARERawActor.prototype.getColor = function() {
    return new AREColor3(this._color);
  };


  /*
   * @return [Boolean] visible
   */

  ARERawActor.prototype.getVisible = function() {
    return this._visible;
  };

  ARERawActor.updateCount = 0;

  ARERawActor.lastTime = Date.now();

  ARERawActor.prototype.receiveMessage = function(message, namespace) {
    var command;
    if (namespace.indexOf("actor.") === -1) {
      return;
    }
    if (!(message.id && message.id === this._id)) {
      return;
    }
    command = namespace.split(".");
    switch (command[1]) {
      case "update":
        this._position = message.position;
        this._rotation = message.rotation;
        if (this._onOrientationChange) {
          return this._onOrientationChange({
            position: this._position,
            rotation: this._rotation
          });
        }
    }
  };

  return ARERawActor;

})();

ARERectangleActor = (function(_super) {
  __extends(ARERectangleActor, _super);


  /*
   * Sets us up with the supplied width and height, generating both our vertex
   * and UV sets.
   *
   * @param [ARERenderer] renderer
   * @param [Number] width
   * @param [Number] height
   */

  function ARERectangleActor(renderer, width, height) {
    var uvs, verts;
    this.width = width;
    this.height = height;
    if (width <= 0) {
      throw new Error("Invalid width: " + width);
    }
    if (height <= 0) {
      throw new Error("Invalid height: " + height);
    }
    verts = this.generateVertices();
    uvs = this.generateUVs();
    ARERectangleActor.__super__.constructor.call(this, renderer, verts, uvs);
  }


  /*
   * Generate array of vertices using our dimensions
   *
   * @return [Array<Number>] vertices
   */

  ARERectangleActor.prototype.generateVertices = function() {
    var hH, hW;
    hW = this.width / 2;
    hH = this.height / 2;
    return [-hW, -hH, -hW, hH, hW, hH, hW, -hH, -hW, -hH];
  };


  /*
   * Generate array of UV coordinates
   *
   * @return [Array<Number>] uvs
   */

  ARERectangleActor.prototype.generateUVs = function() {
    return [0, 1, 0, 0, 1, 0, 1, 1, 0, 1];
  };


  /*
   * Get stored width
   *
   * @return [Number] width
   */

  ARERectangleActor.prototype.getWidth = function() {
    return this.width;
  };


  /*
   * Get stored height
   *
   * @return [Number] height
   */

  ARERectangleActor.prototype.getHeight = function() {
    return this.height;
  };


  /*
   * Set width, causes a vert refresh
   *
   * @param [Number] width
   */

  ARERectangleActor.prototype.setWidth = function(width) {
    this.width = width;
    return this.updateVertices(this.generateVertices());
  };


  /*
   * Set height, causes a vert refresh
   *
   * @param [Number] height
   */

  ARERectangleActor.prototype.setHeight = function(height) {
    this.height = height;
    return this.updateVertices(this.generateVertices());
  };

  return ARERectangleActor;

})(ARERawActor);

AREPolygonActor = (function(_super) {
  __extends(AREPolygonActor, _super);

  AREPolygonActor._INDICE_BUFFER_CACHE = {};

  AREPolygonActor._VERTEX_CACHE = {};

  AREPolygonActor._UV_CACHE = {};


  /*
   * Sets us up with the supplied radius and segment count, generating our
   * vertex sets.
   *
   * NOTE: Texture support is not available! No UVs! ;(
   *
   * @param [ARERenderer] renderer
   * @param [Number] radius
   * @param [Number] segments
   */

  function AREPolygonActor(renderer, radius, segments) {
    var psyxVerts, uvs, verts;
    this.radius = radius;
    this.segments = segments;
    if (this.radius instanceof Array) {
      this._verts = this.radius;
      this.radius = null;
      uvs = this.generateUVs(this._verts);
      AREPolygonActor.__super__.constructor.call(this, renderer, this._verts, uvs);
      this.setPhysicsVertices(this._verts);
    } else {
      if (radius <= 0) {
        throw new Error("Invalid radius: " + radius);
      }
      if (segments <= 2) {
        throw new Error("Invalid segment count: " + segments);
      }
      verts = this.generateVertices();
      psyxVerts = this.generateVertices({
        mode: "physics"
      });
      uvs = this.generateUVs(verts);
      AREPolygonActor.__super__.constructor.call(this, renderer, verts, uvs);
      this.setPhysicsVertices(psyxVerts);
    }
    this.setRenderMode(ARERenderer.GL_MODE_TRIANGLE_FAN);
    this.validateCacheEntry();
  }


  /*
   * @private
   * Private method that rebuilds our vertex array.
   *
   * @param [Object] options optional generation options
   * @options options [Boolean] mode generation mode (normal, or for physics)
   */

  AREPolygonActor.prototype.generateVertices = function(options) {
    var cacheLookup, cachedVertexSet, i, radFactor, tanFactor, theta, tx, ty, verts, x, y, _i, _j, _ref, _ref1, _tv;
    options || (options = {});
    cacheLookup = "" + this.radius + "." + this.segments + "." + options.mode;
    cachedVertexSet = AREPolygonActor._VERTEX_CACHE[cacheLookup];
    if (cachedVertexSet) {
      return cachedVertexSet;
    }
    x = this.radius;
    y = 0;
    theta = (2.0 * 3.1415926) / this.segments;
    tanFactor = Math.tan(theta);
    radFactor = Math.cos(theta);
    verts = [];
    for (i = _i = 0, _ref = this.segments; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      verts[i * 2] = x;
      verts[(i * 2) + 1] = y;
      tx = -y;
      ty = x;
      x += tx * tanFactor;
      y += ty * tanFactor;
      x *= radFactor;
      y *= radFactor;
    }
    verts.push(verts[0]);
    verts.push(verts[1]);
    _tv = [];
    for (i = _j = 0, _ref1 = verts.length; _j < _ref1; i = _j += 2) {
      _tv.push(verts[verts.length - 2 - i]);
      _tv.push(verts[verts.length - 1 - i]);
    }
    verts = _tv;
    if (options.mode !== "physics") {
      verts.push(0);
      verts.push(0);
    }
    AREPolygonActor._VERTEX_CACHE[cacheLookup] = verts;
    return verts;
  };


  /*
   * Generate UV array from a vertex set, using our current radius
   *
   * @return [Array<Number>] uvs
   */

  AREPolygonActor.prototype.generateUVs = function(vertices) {
    var cacheLookup, cachedUVSet, uvs;
    cacheLookup = "" + this.radius + "." + this.segments;
    cachedUVSet = AREPolygonActor._UV_CACHE[cacheLookup];
    if (cachedUVSet) {
      return cachedUVSet;
    }
    uvs = _.map(vertices, function(v) {
      return ((v / this.radius) / 2) + 0.5;
    });
    AREPolygonActor._UV_CACHE[cacheLookup] = uvs;
    return uvs;
  };


  /*
   * Preforms a full vert refresh (vertices, physics vertics, and UVs)
   * @private
   */

  AREPolygonActor.prototype.fullVertRefresh = function() {
    var psyxVerts, uvs, verts;
    verts = this.generateVertices();
    psyxVerts = this.generateVertices({
      mode: "physics"
    });
    uvs = this.generateUVs(verts);
    this.updateVertices(verts, uvs);
    return this.setPhysicsVertices(psyxVerts);
  };


  /*
   * Ensure we are in the cache under our radius/segments pair, if no other poly
   * is.
   */

  AREPolygonActor.prototype.validateCacheEntry = function() {
    var cacheLookup, cachedActor;
    cacheLookup = "" + this.radius + "." + this.segments;
    if (AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup]) {
      cachedActor = AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup];
      return this.setHostIndiceBuffer(cachedActor.getIndiceBuffer(), cachedActor.getId());
    } else {
      AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup] = this;
      return this.clearHostIndiceBuffer();
    }
  };


  /*
   * Removes the Actor, cleaning the cache
   *
   * @return [null]
   */

  AREPolygonActor.prototype.destroy = function() {
    var cacheLookup;
    cacheLookup = "" + this.radius + "." + this.segments;
    if (AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup] === this) {
      AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup] = null;
    }
    return AREPolygonActor.__super__.destroy.call(this);
  };


  /*
   * Get stored radius
   *
   * @return [Number] radius
   */

  AREPolygonActor.prototype.getRadius = function() {
    return this.radius;
  };


  /*
   * Get stored segment count
   *
   * @return [Number] segments
   */

  AREPolygonActor.prototype.getSegments = function() {
    return this.segments;
  };


  /*
   * Set radius, causes a full vert refresh
   *
   * @param [Number] radius
   */

  AREPolygonActor.prototype.setRadius = function(radius) {
    this.radius = radius;
    if (radius <= 0) {
      throw new Error("Invalid radius: " + radius);
    }
    this.fullVertRefresh();
    return this.validateCacheEntry();
  };


  /*
   * Set segment count, causes a full vert refresh
   *
   * @param [Number] segments
   */

  AREPolygonActor.prototype.setSegments = function(segments) {
    this.segments = segments;
    if (segments <= 2) {
      throw new Error("Invalid segment count: " + segments);
    }
    this.fullVertRefresh();
    return this.validateCacheEntry();
  };

  return AREPolygonActor;

})(ARERawActor);

ARECircleActor = (function(_super) {
  __extends(ARECircleActor, _super);


  /*
   * Sets us up with the supplied radius and segment count, generating our
   * vertex sets.
   *
   * NOTE: Texture support is not available! No UVs! ;(
   *
   * @param [ARERenderer] renderer
   * @param [Number] radius
   */

  function ARECircleActor(renderer, radius) {
    this.radius = radius;
    ARECircleActor.__super__.constructor.call(this, renderer, radius, 32);
    delete this.setSegments;
    delete this.getSegments;
  }

  return ARECircleActor;

})(AREPolygonActor);

ARETriangleActor = (function(_super) {
  __extends(ARETriangleActor, _super);


  /*
   * Sets us up with the supplied base and height, generating both our vertex
   * and UV sets.
   *
   * @param [ARERenderer] renderer
   * @param [Number] base
   * @param [Number] height
   */

  function ARETriangleActor(renderer, base, height) {
    var uvs, verts;
    this.base = base;
    this.height = height;
    if (base <= 0) {
      throw new Error("Invalid base: " + base);
    }
    if (height <= 0) {
      throw new Error("Invalid height: " + height);
    }
    verts = this.generateVertices();
    uvs = this.generateUVs();
    ARETriangleActor.__super__.constructor.call(this, renderer, verts, uvs);
  }


  /*
   * Generate array of vertices using our dimensions
   *
   * @return [Array<Number>] vertices
   */

  ARETriangleActor.prototype.generateVertices = function() {
    var hB, hH;
    hB = this.base / 2;
    hH = this.height / 2;
    return [-hB, -hH, 0, hH, hB, -hH, -hB, -hH];
  };


  /*
   * Generate array of UV coordinates
   *
   * @return [Array<Number>] uvs
   */

  ARETriangleActor.prototype.generateUVs = function() {
    return [0, 1, 0, 0, 1, 0, 1, 1];
  };


  /*
   * Get stored base
   *
   * @return [Number] base
   */

  ARETriangleActor.prototype.getBase = function() {
    return this.base;
  };


  /*
   * Get stored height
   *
   * @return [Number] height
   */

  ARETriangleActor.prototype.getHeight = function() {
    return this.height;
  };


  /*
   * Set base, causes a vert refresh
   *
   * @param [Number] base
   */

  ARETriangleActor.prototype.setBase = function(base) {
    this.base = base;
    return this.updateVertices(this.generateVertices());
  };


  /*
   * Set height, causes a vert refresh
   *
   * @param [Number] height
   */

  ARETriangleActor.prototype.setHeight = function(height) {
    this.height = height;
    return this.updateVertices(this.generateVertices());
  };

  return ARETriangleActor;

})(ARERawActor);

AREColor3 = (function() {

  /*
   * Sets component values
   *
   * @param [Number] r red component
   * @param [Number] g green component
   * @param [Number] b blue component
   */
  function AREColor3(colOrR, g, b) {
    colOrR || (colOrR = 0);
    g || (g = 0);
    b || (b = 0);
    if (colOrR instanceof AREColor3) {
      this._r = colOrR.getR();
      this._g = colOrR.getG();
      this._b = colOrR.getB();
    } else {
      this.setR(colOrR);
      this.setG(g);
      this.setB(b);
    }
  }


  /*
   * Returns the red component as either an int or float
   *
   * @param [Boolean] float true if a float is requested
   * @return [Number] red
   */

  AREColor3.prototype.getR = function(asFloat) {
    if (asFloat !== true) {
      return this._r;
    }
    return this._r / 255;
  };


  /*
   * Returns the green component as either an int or float
   *
   * @param [Boolean] float true if a float is requested
   * @return [Number] green
   */

  AREColor3.prototype.getG = function(asFloat) {
    if (asFloat !== true) {
      return this._g;
    }
    return this._g / 255;
  };


  /*
   * Returns the blue component as either an int or float
   *
   * @param [Boolean] float true if a float is requested
   * @return [Number] blue
   */

  AREColor3.prototype.getB = function(asFloat) {
    if (asFloat !== true) {
      return this._b;
    }
    return this._b / 255;
  };


  /*
   * Set red component, takes a value between 0-255
   *
   * @param [Number] c
   */

  AREColor3.prototype.setR = function(c) {
    c = Number(c);
    if (c < 0) {
      c = 0;
    }
    if (c > 255) {
      c = 255;
    }
    return this._r = c;
  };


  /*
   * Set green component, takes a value between 0-255
   *
   * @param [Number] c
   */

  AREColor3.prototype.setG = function(c) {
    c = Number(c);
    if (c < 0) {
      c = 0;
    }
    if (c > 255) {
      c = 255;
    }
    return this._g = c;
  };


  /*
   * Set blue component, takes a value between 0-255
   *
   * @param [Number] c
   */

  AREColor3.prototype.setB = function(c) {
    c = Number(c);
    if (c < 0) {
      c = 0;
    }
    if (c > 255) {
      c = 255;
    }
    return this._b = c;
  };


  /*
   * Returns the value as a triple
   *
   * @return [String] triple in the form (r, g, b)
   */

  AREColor3.prototype.toString = function() {
    return "(" + this._r + ", " + this._g + ", " + this._b + ")";
  };

  return AREColor3;

})();

AREShader = (function() {

  /*
   * Doesn't do much except auto-build the shader if requested
   *
   * @param [String] vertSrc vertex shader source
   * @param [String] fragSrc fragment shader source
   * @param [Object] gl gl object if building
   * @param [Boolean] build if true, builds the shader now
   */
  function AREShader(_vertSrc, _fragSrc, _gl, build) {
    var _success;
    this._vertSrc = _vertSrc;
    this._fragSrc = _fragSrc;
    this._gl = _gl;
    build = !!build;
    this.errors = [];
    this._prog = null;
    this._vertShader = null;
    this._fragShader = null;
    this._handles = null;
    if (build === true) {
      _success = this.build(this._gl);
      if (_success === false) {
        throw new Error("Failed to build shader! " + (JSON.stringify(this.errors)));
      }
    }
  }


  /*
   * Builds the shader using the vert/frag sources supplied
   *
   * @param [Object] gl gl object to build shaders with/into
   * @return [Boolean] success false implies an error stored in @errors
   */

  AREShader.prototype.build = function(_gl) {
    var gl;
    this._gl = _gl;
    gl = this._gl;
    this.errors = [];
    if (gl === void 0 || gl === null) {
      throw new Error("Need a valid gl object to build a shader!");
    }
    this._vertShader = gl.createShader(gl.VERTEX_SHADER);
    this._fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(this._vertShader, this._vertSrc);
    gl.shaderSource(this._fragShader, this._fragSrc);
    gl.compileShader(this._vertShader);
    gl.compileShader(this._fragShader);
    if (!gl.getShaderParameter(this._vertShader, gl.COMPILE_STATUS)) {
      this.errors.push(gl.getShaderInfoLog(this._vertShader));
    }
    if (!gl.getShaderParameter(this._fragShader, gl.COMPILE_STATUS)) {
      this.errors.push(gl.getShaderInfoLog(this._fragShader));
    }
    this._prog = gl.createProgram();
    gl.attachShader(this._prog, this._vertShader);
    gl.attachShader(this._prog, this._fragShader);
    gl.linkProgram(this._prog);
    if (!gl.getProgramParameter(this._prog, gl.LINK_STATUS)) {
      this.errors.push("Failed to link!");
    }
    if (this.errors.length > 0) {
      return false;
    }
    return true;
  };


  /*
   * Really neat helper function, breaks out and supplies handles to all
   * variables. Really the meat of this class
   *
   * @return [Boolean] success fails if handles have already been generated
   */

  AREShader.prototype.generateHandles = function() {
    var h, l, src, _i, _j, _len, _len1, _makeHandle, _ref;
    if (this._prog === null) {
      AREEngine.getLog().error("Build program before generating handles");
      return false;
    }
    if (this._handles !== null) {
      AREEngine.getLog().warn("Refusing to re-generate handles!");
      return false;
    }
    this._handles = {};
    _makeHandle = function(l, type, me) {
      var name, ret;
      l = l.split(" ");
      name = l[l.length - 1].replace(";", "");
      if (type === 1) {
        ret = {
          n: name,
          h: me._gl.getUniformLocation(me._prog, name)
        };
        if (typeof ret.h !== "object") {
          throw new Error("Failed to get handle for uniform " + name + " [" + ret.h + "]");
        }
        return ret;
      } else if (type === 2) {
        ret = {
          n: name,
          h: me._gl.getAttribLocation(me._prog, name)
        };
        return ret;
      }
      throw new Error("Type not 1 or 2, WTF, internal error");
    };
    _ref = [this._vertSrc, this._fragSrc];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      src = _ref[_i];
      src = src.split(";");
      for (_j = 0, _len1 = src.length; _j < _len1; _j++) {
        l = src[_j];
        if (l.indexOf("main()") !== -1) {
          break;
        } else if (l.indexOf("attribute") !== -1) {
          h = _makeHandle(l, 2, this);
          this._handles[h.n] = h.h;
        } else if (l.indexOf("uniform") !== -1) {
          h = _makeHandle(l, 1, this);
          this._handles[h.n] = h.h;
        }
      }
    }
    return true;
  };


  /*
   * Get generated handles
   *
   * @return [Object] handles
   */

  AREShader.prototype.getHandles = function() {
    return this._handles;
  };


  /*
   * Get generated program (null by default)
   *
   * @return [Object] program
   */

  AREShader.prototype.getProgram = function() {
    return this._prog;
  };

  return AREShader;

})();

AREVector2 = (function() {
  function AREVector2(x, y) {
    this.x || (this.x = 0);
    this.y || (this.y = 0);
  }


  /*
   * @param [Boolean] bipolar should randomization occur in all directions?
   * @return [AREVector2] randomizedVector
   */

  AREVector2.prototype.random = function(options) {
    var bipolar, seed, x, y;
    options || (options = {});
    bipolar = !!options.bipolar;
    seed = options.seed || Math.random() * 0xFFFF;
    x = Math.random() * this.x;
    y = Math.random() * this.y;
    if (bipolar) {
      if (Math.random() < 0.5) {
        x = -x;
      }
      if (Math.random() < 0.5) {
        y = -y;
      }
    }
    return new AREVector2(x, y);
  };


  /*
   * @param [AREVector2]
   * @return [AREVector2]
   */

  AREVector2.prototype.add = function(other) {
    return new AREVector2(this.x + other.x, this.y + other.y);
  };


  /*
   * @param [AREVector2]
   * @return [AREVector2]
   */

  AREVector2.prototype.sub = function(other) {
    return new AREVector2(this.x - other.x, this.y - other.y);
  };


  /*
   * @param [AREVector2]
   * @return [AREVector2]
   */

  AREVector2.prototype.mul = function(other) {
    return new AREVector2(this.x * other.x, this.y * other.y);
  };


  /*
   * @param [AREVector2]
   * @return [AREVector2]
   */

  AREVector2.prototype.div = function(other) {
    return new AREVector2(this.x / other.x, this.y / other.y);
  };


  /*
   * @return [AREVector2]
   */

  AREVector2.prototype.floor = function() {
    return new AREVector2(Math.floor(this.x), Math.floor(this.y));
  };


  /*
   * @return [AREVector2]
   */

  AREVector2.prototype.ceil = function() {
    return new AREVector2(Math.ceil(this.x), Math.ceil(this.y));
  };


  /*
   * @return [AREVector2]
   */

  AREVector2.zero = function() {
    return new AREVector2(0, 0);
  };

  return AREVector2;

})();

AREShader.shaders = {};

AREShader.shaders.wire = {};

AREShader.shaders.solid = {};

AREShader.shaders.texture = {};

precision = "mediump";

varying_precision = "mediump";

precision_declaration = "precision " + precision + " float;";

AREShader.shaders.wire.vertex = "" + precision_declaration + "\n\nattribute vec2 aPosition;\n\nuniform mat4 uProjection;\nuniform mat4 uModelView;\n\nvoid main() {\n  gl_Position = uProjection * uModelView * vec4(aPosition, 1, 1);\n}";

AREShader.shaders.wire.fragment = "" + precision_declaration + "\n\nuniform vec4 uColor;\nuniform float uOpacity;\n\nvoid main() {\n  vec4 frag = uColor;\n  frag.a *= uOpacity;\n  gl_FragColor = frag;\n}";

AREShader.shaders.solid.vertex = AREShader.shaders.wire.vertex;

AREShader.shaders.solid.fragment = "" + precision_declaration + "\n\nuniform vec4 uColor;\nuniform float uOpacity;\n\nvoid main() {\n  vec4 frag = uColor;\n  frag.a *= uOpacity;\n  gl_FragColor = frag;\n}";

AREShader.shaders.texture.vertex = "" + precision_declaration + "\n\nattribute vec2 aPosition;\nattribute vec2 aTexCoord;\n\nuniform mat4 uProjection;\nuniform mat4 uModelView;\n\nvarying " + varying_precision + " vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = uProjection * uModelView * vec4(aPosition, 1, 1);\n  vTexCoord = aTexCoord;\n}";

AREShader.shaders.texture.fragment = "" + precision_declaration + "\n\nuniform sampler2D uSampler;\nuniform vec4 uColor;\nuniform float uOpacity;\nuniform vec4 uClipRect;\n\nvarying " + varying_precision + " vec2 vTexCoord;\n\nvoid main() {\n  vec4 baseColor = texture2D(uSampler,\n                             uClipRect.xy +\n                             vTexCoord * uClipRect.zw);\n  // baseColor *= uColor;\n  baseColor.a *= uOpacity;\n\n  gl_FragColor = baseColor;\n}";

ARERenderer = (function() {

  /*
   * Renderer Modes
   * 0: null
   *    The null renderer is the same as the canvas renderer, however
   *    it will only clear the screen each tick.
   * 1: canvas
   *    All rendering will be done using the 2d Context
   * 2: wgl
   *    All rendering will be done using WebGL
   * @enum
   */
  ARERenderer.RENDER_MODE_NULL = 0;

  ARERenderer.RENDER_MODE_CANVAS = 1;

  ARERenderer.RENDER_MODE_WGL = 2;


  /*
   * Render Modes
   * This affects the method GL will use to render a WGL element
   * @enum
   */

  ARERenderer.GL_MODE_LINE_LOOP = 0;

  ARERenderer.GL_MODE_TRIANGLE_FAN = 1;

  ARERenderer.GL_MODE_TRIANGLE_STRIP = 2;


  /*
   * A render style determines how a canvas element is drawn, this can
   * also be used for WebGL elements as well, as they fine tune the drawing
   * process.
  
   * STROKE will work with all RENDER_MODE*.
   * FILL will work with GL_MODE_TRIANGLE_FAN and
   * GL_MODE_TRIANGLE_STRIP only.
   * FILL_AND_STROKE will work with all current render modes, however
   * GL_MODE_LINE_LOOP will only use STROKE
   * @enum
   */

  ARERenderer.RENDER_STYLE_STROKE = 1;

  ARERenderer.RENDER_STYLE_FILL = 2;

  ARERenderer.RENDER_STYLE_FILL_AND_STROKE = 3;


  /*
   * Render Modes
   * This affects the method GL will use to render a WGL element
   * @enum
   */

  ARERenderer.MATERIAL_NONE = "none";

  ARERenderer.MATERIAL_FLAT = "flat";

  ARERenderer.MATERIAL_TEXTURE = "texture";


  /*
   * Sets up the renderer, using either an existing canvas or creating a new one
   * If a canvasId is provided but the element is not a canvas, it is treated
   * as a parent. If it is a canvas, it is adopted as our canvas.
   *
   * Bails early if the GL context could not be created
   *
   * @param [Object] options renderer initialization options
   * @option options [String] canvasId canvas id or parent selector
   * @option options [Number] width canvas width
   * @option options [Number] height canvas height
   * @option options [Number] renderMode optional render mode, defaults to WebGL
   * @option options [Boolean] antialias default true
   * @option options [Boolean] alpha default true
   * @option options [Boolean] premultipliedAlpha default true
   * @option options [Boolean] depth default true
   * @option options [Boolean] stencil default false
   * @option options [Boolean] preserveDrawingBuffer manual clears, default false
   *
   * @return [Boolean] success
   */

  function ARERenderer(opts) {
    var canvasId, renderMode, _createCanvas;
    this._width = opts.width;
    this._height = opts.height;
    canvasId = opts.canvasId || "";
    renderMode = opts.renderMode || ARERenderer.RENDER_MODE_WGL;
    opts.premultipliedAlpha || (opts.premultipliedAlpha = true);
    opts.antialias || (opts.antialias = true);
    opts.alpha || (opts.alpha = true);
    opts.depth || (opts.depth = true);
    opts.stencil || (opts.stencil = false);
    this._alwaysClearScreen = !!opts.preserveDrawingBuffer;
    this._nextID = 0;
    this._defaultShader = null;
    this._canvas = null;
    this._ctx = null;
    this._gl = null;
    this._actors = [];
    this._actor_hash = {};
    this._textures = [];
    this._culling = false;
    this._currentMaterial = "none";
    this._activeRendererMode = null;
    this._cameraPosition = {
      x: 0,
      y: 0
    };
    this._zoomFactor = 1;
    this._pickRenderRequested = false;
    this._pickRenderBuff = null;
    this._pickRenderSelectionRect = null;
    this._pickRenderCB = null;
    this._clearColor = new AREColor3(255, 255, 255);
    _createCanvas = (function(_this) {
      return function(parent, id) {
        var parentElm;
        _this._canvas = document.createElement("canvas");
        _this._canvas.width = _this._width;
        _this._canvas.height = _this._height;
        _this._canvas.id = id;
        parentElm = document.querySelector(parent);
        parentElm || (parentElm = document.getElementById(parent));
        parentElm.appendChild(_this._canvas);
        return ARELog.info("Creating canvas #" + id + " [" + _this._width + "x" + _this._height + "] <" + parent + ">");
      };
    })(this);
    if (!canvasId) {
      _createCanvas("body", "are_anvas");
    } else {
      this._canvas = document.getElementById(canvasId);
      if (!this._canvas) {
        _createCanvas("body", canvasId);
      } else {
        if (this._canvas.nodeName.toLowerCase() === "canvas") {
          this._canvas.width = this._width;
          this._canvas.height = this._height;
        } else {
          _createCanvas(canvasId, "are_canvas");
        }
      }
    }
    if (!this._canvas) {
      throw new Error("Failed to create or find suitable canvas!");
    }
    switch (renderMode) {
      case ARERenderer.RENDER_MODE_NULL:
        this._initializeNullRendering();
        break;
      case ARERenderer.RENDER_MODE_CANVAS:
        this._initializeCanvasRendering();
        break;
      case ARERenderer.RENDER_MODE_WGL:
        if (!this._initializeWebGLRendering(opts)) {
          ARELog.info("Falling back on regular canvas renderer");
          this._initializeCanvasRendering();
        }
        break;
      default:
        throw new Error("Invalid Renderer " + rendererMode);
    }
    ARELog.info("Using the " + this._activeRendererMode + " renderer mode");
    this.setClearColor(255, 255, 255);
    this.switchMaterial(ARERenderer.MATERIAL_FLAT);
  }


  /*
   * Initializes a WebGL renderer context
   *
   * @return [Boolean] success
   */

  ARERenderer.prototype._initializeWebGLRendering = function(options) {
    var b, g, r, shaders, solidShader, textureShader, wireShader;
    this._gl = this._canvas.getContext("webgl", options);
    if (!this._gl) {
      ARELog.warn("Continuing with experimental webgl support");
      this._gl = this._canvas.getContext("experimental-webgl", options);
    }
    if (!this._gl) {
      ARELog.warn("Failed to obtain WebGL context");
      return false;
    }
    ARELog.info("Obtained WebGL context");
    this._gl.enable(this._gl.DEPTH_TEST);
    this._gl.enable(this._gl.BLEND);
    this._gl.depthFunc(this._gl.LEQUAL);
    this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
    r = this._clearColor.getR(true);
    g = this._clearColor.getG(true);
    b = this._clearColor.getB(true);
    this._gl.clearColor(r, g, b, 1.0);
    shaders = AREShader.shaders;
    wireShader = shaders.wire;
    solidShader = shaders.solid;
    textureShader = shaders.texture;
    this._defaultShader = new AREShader(solidShader.vertex, solidShader.fragment, this._gl, true);
    this._defaultShader.generateHandles();
    this._wireShader = new AREShader(wireShader.vertex, wireShader.fragment, this._gl, true);
    this._wireShader.generateHandles();
    this._texShader = new AREShader(textureShader.vertex, textureShader.fragment, this._gl, true);
    this._texShader.generateHandles();
    ARELog.info("Initialized shaders");
    this._activeRendererMode = ARERenderer.RENDER_MODE_WGL;
    this.render = this._wglRender;
    this._pendingVBORefresh = false;
    this._vertexDataBuffer = this._gl.createBuffer();
    this.requestVBORefresh();
    ARELog.info("WebgL renderer initialized");
    return true;
  };


  /*
   * Initializes a canvas renderer context
   *
   * @return [Boolean]
   */

  ARERenderer.prototype._initializeCanvasRendering = function() {
    this._ctx = this._canvas.getContext("2d");
    this._activeRendererMode = ARERenderer.RENDER_MODE_CANVAS;
    this.render = this._cvRender;
    ARELog.info("Canvas renderer initialized");
    return true;
  };


  /*
   * Initializes a null renderer context
   * @return [Boolean]
   */

  ARERenderer.prototype._initializeNullRendering = function() {
    this._ctx = this._canvas.getContext("2d");
    this._activeRendererMode = ARERenderer.RENDER_MODE_NULL;
    this.render = this._nullRender;
    ARELog.info("Null renderer initialized");
    return true;
  };


  /*
   * Render method set by our mode, so we don't have to iterate over a
   * switch-case on each render call.
   *
   * Renders a frame, needs to be set in our constructor, by one of the init
   * methods.
   */

  ARERenderer.prototype.render = function() {};

  ARERenderer.prototype.enableCulling = function() {
    this._culling = true;
    return this;
  };

  ARERenderer.prototype.disableCulling = function() {
    this._culling = false;
    return this;
  };


  /*
   * Called once per frame, we perform various internal updates if needed
   */

  ARERenderer.prototype.update = function() {
    var VBOData, a, absBaseIndex, absI, actor, baseIndex, compiledVertices, currentOffset, deletedActors, i, indices, totalVertCount, vData, _i, _j, _k, _l, _len, _len1, _len2, _ref, _ref1, _ref2;
    deletedActors = _.remove(this._actors, function(a) {
      return a.flaggedForDeletion();
    });
    for (_i = 0, _len = deletedActors.length; _i < _len; _i++) {
      a = deletedActors[_i];
      a.rendererActorDelete();
    }
    if (this._pendingVBORefresh && this.isWGLRendererActive()) {
      currentOffset = 0;
      indices = [];
      compiledVertices = [];
      totalVertCount = 0;
      _ref = this._actors;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        actor = _ref[_j];
        if (actor.hasOwnIndiceBuffer()) {
          totalVertCount += actor.getRawVertexData().length;
        }
      }
      VBOData = new Float32Array(totalVertCount);
      _ref1 = this._actors;
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        actor = _ref1[_k];
        if (actor.hasOwnIndiceBuffer()) {
          vData = actor.getRawVertexData();
          indices = [];
          for (i = _l = 0, _ref2 = vData.length / 4; 0 <= _ref2 ? _l < _ref2 : _l > _ref2; i = 0 <= _ref2 ? ++_l : --_l) {
            baseIndex = currentOffset + i;
            indices.push(baseIndex);
            absBaseIndex = baseIndex * 4;
            absI = i * 4;
            VBOData[absBaseIndex] = vData[absI];
            VBOData[absBaseIndex + 1] = vData[absI + 1];
            VBOData[absBaseIndex + 2] = vData[absI + 2];
            VBOData[absBaseIndex + 3] = vData[absI + 3];
          }
          currentOffset += vData.length / 4;
          actor.updateIndices(indices);
        }
      }
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertexDataBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, VBOData, this._gl.STATIC_DRAW);
      return this._pendingVBORefresh = false;
    }
  };


  /*
   * Request VBO regeneration to be performed on next update
   */

  ARERenderer.prototype.requestVBORefresh = function() {
    return this._pendingVBORefresh = true;
  };


  /*
   * Returns the internal default shader
   *
   * @return [AREShader] shader default shader
   */

  ARERenderer.prototype.getDefaultShader = function() {
    return this._defaultShader;
  };


  /*
   * Returns the shader used for wireframe objects
   *
   * @return [AREShader] shader wire shader
   */

  ARERenderer.prototype.getWireShader = function() {
    return this._wireShader;
  };


  /*
   * Returns the shader used for textured objects
   *
   * @return [AREShader] shader texture shader
   */

  ARERenderer.prototype.getTextureShader = function() {
    return this._texShader;
  };


  /*
   * Returns canvas element
   *
   * @return [Object] canvas
   */

  ARERenderer.prototype.getCanvas = function() {
    return this._canvas;
  };


  /*
   * Returns canvas rendering context
   *
   * @return [Object] ctx
   */

  ARERenderer.prototype.getContext = function() {
    return this._ctx;
  };


  /*
   * Returns canvas width
   *
   * @return [Number] width
   */

  ARERenderer.prototype.getWidth = function() {
    return this._width;
  };


  /*
   * Returns canvas height
   *
   * @return [Number] height
   */

  ARERenderer.prototype.getHeight = function() {
    return this._height;
  };


  /*
   * @param [Object] position hash with x, y values
   */

  ARERenderer.prototype.setCameraPosition = function(_cameraPosition) {
    this._cameraPosition = _cameraPosition;
  };


  /*
   * @return [Object] position hash with x, y values
   */

  ARERenderer.prototype.getCameraPosition = function() {
    return {
      x: this._cameraPosition.x,
      y: this._cameraPosition.y
    };
  };


  /*
   * Sets a new zoom factor, and triggers a viewport refresh!
   *
   * @param [Number] zoom
   */

  ARERenderer.prototype.setCameraZoom = function(_zoomFactor) {
    var shader;
    this._zoomFactor = _zoomFactor;
    if (!(shader = this.getShaderForMaterial(this._currentMaterial))) {
      return;
    }
    return this.refreshViewport(shader);
  };


  /*
   * @return [Number] zoom
   */

  ARERenderer.prototype.getCameraZoom = function() {
    return this._zoomFactor;
  };


  /*
   * Returns the clear color
   *
   * @return [AREColor3] clearCol
   */

  ARERenderer.prototype.getClearColor = function() {
    return this._clearColor;
  };


  /*
   * Sets the clear color
   *
   * @overload setClearCol(col)
   *   Set using an AREColor3 object
   *   @param [AREColor3] col
   *
   * @overload setClearCol(r, g, b)
   *   Set using component values (0.0-1.0 or 0-255)
   *   @param [Number] r red component
   *   @param [Number] g green component
   *   @param [Number] b blue component
   */

  ARERenderer.prototype.setClearColor = function(colOrR, g, b) {
    var r;
    if (!this._clearColor) {
      this._clearColor = new AREColor3;
    }
    if (colOrR instanceof AREColor3) {
      this._clearColor = colOrR;
    } else {
      this._clearColor.setR(colOrR || 0);
      this._clearColor.setG(g || 0);
      this._clearColor.setB(b || 0);
    }
    if (this._activeRendererMode === ARERenderer.RENDER_MODE_WGL) {
      r = this._clearColor.getR(true);
      g = this._clearColor.getG(true);
      b = this._clearColor.getB(true);
      if (!!this._gl) {
        this._gl.clearColor(r, g, b, 1.0);
      }
    }
    return this;
  };


  /*
   * Request a frame to be rendered for scene picking.
   *
   * @param [FrameBuffer] buffer
   * @param [Method] cb cb to call post-render
   */

  ARERenderer.prototype.requestPickingRenderWGL = function(buffer, cb) {
    if (this._pickRenderRequested) {
      return ARELog.warn("Pick render already requested! No request queue");
    }
    this._pickRenderBuff = buffer;
    this._pickRenderSelectionRect = null;
    this._pickRenderCB = cb;
    this._pickRenderRequested = true;
    return this;
  };


  /*
   * Request a frame to be rendered for scene picking.
   *
   * @param [Object] selectionRect
   *   @property [Number] x
   *   @property [Number] y
   *   @property [Number] width
   *   @property [Number] height
   * @param [Method] cb cb to call post-render
   */

  ARERenderer.prototype.requestPickingRenderCanvas = function(selectionRect, cb) {
    if (this._pickRenderRequested) {
      return ARELog.warn("Pick render already requested! No request queue");
    }
    this._pickRenderBuff = null;
    this._pickRenderSelectionRect = selectionRect;
    this._pickRenderCB = cb;
    this._pickRenderRequested = true;
    return this;
  };


  /*
   * Draws a using WebGL frame
   * @return [Void]
   * @private
   */

  ARERenderer.prototype._wglRender = function() {
    var a, a_id, actorCount, actorIterator, bottomEdge, camPos, gl, leftEdge, rightEdge, topEdge, windowHeight_h, windowWidth_h, _id, _idSector, _savedColor, _savedOpacity;
    gl = this._gl;
    if (this._pickRenderRequested) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._pickRenderBuff);
    }
    if (this._alwaysClearScreen) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    actorCount = this._actors.length;
    actorIterator = this._actors.length;
    if (this._pickRenderRequested) {
      while (actorIterator--) {
        a = this._actors[actorCount - actorIterator - 1];
        if (a._visible) {
          a_id = a._id;
          _savedColor = {
            r: a._color._r,
            g: a._color._g,
            b: a._color._b
          };
          _savedOpacity = a._opacity;
          _id = a_id - (Math.floor(a_id / 255) * 255);
          _idSector = Math.floor(a_id / 255);
          this.switchMaterial(ARERenderer.MATERIAL_FLAT);
          a.setColor(_id, _idSector, 248);
          a.setOpacity(1.0);
          a.wglDraw(gl, this._defaultShader);
          a.setColor(_savedColor.r, _savedColor.g, _savedColor.b);
          a.setOpacity(_savedOpacity);
        }
      }
      this._pickRenderCB();
      this._pickRenderRequested = false;
      this._pickRenderBuff = null;
      this._pickRenderCB = null;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.render();
    } else {
      windowWidth_h = window.innerWidth * this._zoomFactor * 0.5;
      windowHeight_h = window.innerHeight * this._zoomFactor * 0.5;
      leftEdge = rightEdge = topEdge = bottomEdge = true;
      camPos = this._cameraPosition;
      while (actorIterator--) {
        a = this._actors[actorCount - actorIterator - 1];
        if (a._visible) {
          leftEdge = (a._position.x - camPos.x) + (a._bounds.w / 2) < -windowWidth_h;
          rightEdge = (a._position.x - camPos.x) - (a._bounds.w / 2) > windowWidth_h;
          topEdge = (a._position.y - camPos.y) + (a._bounds.h / 2) < -windowHeight_h;
          bottomEdge = (a._position.y - camPos.y) - (a._bounds.h / 2) > windowHeight_h;
          if (!this._culling || !(bottomEdge || topEdge || leftEdge || rightEdge)) {
            if (a._attachedTexture) {
              a = a.updateAttachment();
            }
            if (a._material !== this._currentMaterial) {
              this.switchMaterial(a._material);
            }
            a.wglDraw(gl);
          }
        }
      }
    }
    return this;
  };


  /*
   * Canavs render
   * @return [self]
   * @private
   */

  ARERenderer.prototype._cvRender = function() {
    var a, ctx, material, r, _i, _id, _idSector, _len, _ref, _savedColor, _savedOpacity;
    if (!this._ctx) {
      return;
    }
    ctx = this._ctx;
    if (this._clearColor) {
      ctx.fillStyle = "rgb" + this._clearColor;
      ctx.fillRect(0, 0, this._width, this._height);
    } else {
      ctx.clearRect(0, 0, this._width, this._height);
    }
    ctx.save();
    ctx.translate(0, this._height);
    ctx.scale(1, -1);
    _ref = this._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      ctx.save();
      if (this._pickRenderRequested) {
        _savedColor = a._color;
        _savedColor = {
          r: _savedColor._r,
          g: _savedColor._g,
          b: _savedColor._b
        };
        _savedOpacity = a._opacity;
        _id = a.getId() - (Math.floor(a.getId() / 255) * 255);
        _idSector = Math.floor(a.getId() / 255);
        this.switchMaterial(ARERenderer.MATERIAL_FLAT);
        a.setColor(_id, _idSector, 248);
        a.setOpacity(1.0);
        a.cvDraw(ctx);
        a.setColor(_savedColor.r, _savedColor.g, _savedColor.b);
        a.setOpacity(_savedOpacity);
      } else {
        a = a.updateAttachment();
        if ((material = a.getMaterial()) !== this._currentMaterial) {
          this.switchMaterial(material);
        }
        a.cvDraw(ctx);
      }
      ctx.restore();
    }
    ctx.restore();
    if (this._pickRenderRequested) {
      r = this._pickRenderSelectionRect;
      this._pickRenderCB(ctx.getImageData(r.x, r.y, r.width, r.height));
      this._pickRenderRequested = false;
      this._pickRenderBuff = null;
      this._pickRenderSelectionRect = null;
      this._pickRenderCB = null;
      this.render();
    }
    return this;
  };


  /*
   * "No render" function
   * @return [Void]
   * @private
   */

  ARERenderer.prototype._nullRender = function() {
    var a, ctx, _i, _len, _ref;
    if (!this._ctx) {
      return;
    }
    ctx = this._ctx;
    if (this._clearColor) {
      ctx.fillStyle = "rgb" + this._clearColor;
      ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    } else {
      ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
    _ref = this._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      a = a.updateAttachment();
      a.nullDraw(ctx);
    }
    return this;
  };


  /*
   * Manually clear the screen
   *
   * @return [Void]
   */

  ARERenderer.prototype.clearScreen = function() {
    switch (this._activeRendererMode) {
      case ARERenderer.RENDER_MODE_CANVAS:
        if (this._clearColor) {
          this._ctx.fillStyle = "rgb" + this._clearColor;
          this._ctx.fillRect(0, 0, this._width, this._height);
        } else {
          this._ctx.clearRect(0, 0, this._width, this._height);
        }
        break;
      case ARERenderer.RENDER_MODE_WGL:
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
    }
    return this;
  };


  /*
   * Returns the currently active renderer mode
   * @return [Number] rendererMode
   */

  ARERenderer.prototype.getActiveRendererMode = function() {
    return this._activeRendererMode;
  };


  /*
   * Is the null renderer active?
   * @return [Boolean] is_active
   */

  ARERenderer.prototype.isNullRendererActive = function() {
    return this._activeRendererMode === ARERenderer.RENDER_MODE_NULL;
  };


  /*
   * Is the canvas renderer active?
   * @return [Boolean] is_active
   */

  ARERenderer.prototype.isCanvasRendererActive = function() {
    return this._activeRendererMode === ARERenderer.RENDER_MODE_CANVAS;
  };


  /*
   * Is the WebGL renderer active?
   * @return [Boolean] is_active
   */

  ARERenderer.prototype.isWGLRendererActive = function() {
    return this._activeRendererMode === ARERenderer.RENDER_MODE_WGL;
  };


  /*
   * Returns a unique id, used by actors
   * @return [Number] id unique id
   */

  ARERenderer.prototype.getNextId = function() {
    return this._nextID++;
  };


  /*
   * Get GL context
   *
   * @return [Context] gl
   */

  ARERenderer.prototype.getGL = function() {
    return this._gl;
  };


  /*
   * Add an actor to our render list. A layer can be optionally specified, at
   * which point it will also be applied to the actor.
   *
   * If no layer is specified, we use the current actor layer (default 0)
   *
   * @param [ARERawActor] actor
   * @param [Number] layer
   * @return [ARERawActor] actor added actor
   */

  ARERenderer.prototype.addActor = function(actor, layer) {
    var layerIndex;
    if (!isNaN(layer)) {
      actor.layer = layer;
    }
    layerIndex = _.sortedIndex(this._actors, actor, "layer");
    this._actors.splice(layerIndex, 0, actor);
    this._actor_hash[actor.getId()] = actor;
    return actor;
  };


  /*
   * Remove an actor from our render list by either actor, or id
   *
   * @param [ARERawActor, Number] actorId actor id, or actor
   * @return [Boolean] success
   */

  ARERenderer.prototype.removeActor = function(actorId) {
    var removedActor;
    if (actorId instanceof ARERawActor) {
      actorId = actorId.getId();
    }
    removedActor = _.remove(this._actors, (function(a) {
      return a.getId() === actorId;
    }))[0];
    return !!removedActor;
  };

  ARERenderer.prototype.makeOrthoMatrix = function(left, right, bottom, top, znear, zfar) {
    return new Float32Array([2 / (right - left), 0, 0, 0, 0, 2 / (top - bottom), 0, 0, 0, 0, -2 / (zfar - znear), 0, -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(zfar + znear) / (zfar - znear), 1]);
  };


  /*
   * Reconstructs our viewport based on the camera scale, and uploads a fresh
   * projection matrix for the provided material (should be our current shader)
   */

  ARERenderer.prototype.refreshViewport = function(material) {
    var handles, height, ortho, width;
    width = this._width * this._zoomFactor;
    height = this._height * this._zoomFactor;
    ortho = this.makeOrthoMatrix(-width / 2, width / 2, height / 2, -height / 2, -10, 10);
    handles = material.getHandles();
    return this._gl.uniformMatrix4fv(handles.uProjection, false, ortho);
  };


  /*
   * Get the shader we are using for the specified material. Returns null if we
   * don't recognize it.
   *
   * @param [String] material
   * @return [AREShader] shader
   */

  ARERenderer.prototype.getShaderForMaterial = function(material) {
    switch (material) {
      case ARERenderer.MATERIAL_FLAT:
        return this._defaultShader;
      case ARERenderer.MATERIAL_TEXTURE:
        return this._texShader;
      default:
        return null;
    }
  };


  /*
   * Switch material (shader program)
   *
   * @param [String] material
   */

  ARERenderer.prototype.switchMaterial = function(material) {
    var shader;
    if (material === this._currentMaterial) {
      return false;
    }
    if (this.isWGLRendererActive()) {
      if (!(shader = this.getShaderForMaterial(material))) {
        throw new Error("Unknown material " + material);
      }
      this._gl.useProgram(shader.getProgram());
      this.refreshViewport(shader);
    }
    this._currentMaterial = material;
    return this;
  };


  /*
   * Checks if we have a texture loaded
   *
   * @param [String] name texture name to check for
   */

  ARERenderer.prototype.hasTexture = function(name) {
    return !!_.find(this._textures, function(t) {
      return t.name === name;
    });
  };


  /*
   * Fetches a texture by name
   *
   * @param [String] name name of texture to fetch
   * @param [Object] texture
   */

  ARERenderer.prototype.getTexture = function(name) {
    return _.find(this._textures, function(t) {
      return t.name === name;
    });
  };


  /*
   * Fetches texture size
   *
   * @param [String] name name of texture
   * @param [Object] size
   */

  ARERenderer.prototype.getTextureSize = function(name) {
    var t;
    if (t = this.getTexture(name)) {
      return {
        w: t.width * t.scaleX,
        h: t.height * t.scaleY
      };
    } else {
      return null;
    }
  };


  /*
   * Adds a texture to our internal collection
   *
   * @param [Object] texture texture object with name and gl texture
   */

  ARERenderer.prototype.addTexture = function(tex) {
    this._textures.push(tex);
    return this;
  };

  return ARERenderer;

})();


/*
 * PhysicsManager is in charge of starting and communicating with the physics
 * web worker.
 */

PhysicsManager = (function() {
  function PhysicsManager(_renderer, depPaths, cb) {
    var dependencies;
    this._renderer = _renderer;
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
      var request;
      if (dependency.raw) {
        return depCB(null, dependency.raw);
      }
      request = new XMLHttpRequest();
      request.open("GET", dependency.url, true);
      request.onerror = function(e) {
        return depCB("Connection error: " + e, null);
      };
      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          return depCB(null, request.responseText);
        } else {
          return depCB("Request returned " + request.status, null);
        }
      };
      return request.send();
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
        }
      };
    })(this);
  };

  return PhysicsManager;

})();

ARELog = (function() {
  function ARELog() {}

  ARELog.tags = ["", "[Error]> ", "[Warning]> ", "[Debug]> ", "[Info]> "];

  ARELog.level = 4;

  ARELog.w = function(level, str) {
    var me;
    me = ARELog;
    if (level > me.level || level === 0 || me.level === 0) {
      return;
    }
    if (level === 1 && console.error !== void 0) {
      if (console.error) {
        return console.error("" + me.tags[level] + str);
      } else {
        return console.log("" + me.tags[level] + str);
      }
    } else if (level === 2 && console.warn !== void 0) {
      if (console.warn) {
        return console.warn("" + me.tags[level] + str);
      } else {
        return console.log("" + me.tags[level] + str);
      }
    } else if (level === 3 && console.debug !== void 0) {
      if (console.debug) {
        return console.debug("" + me.tags[level] + str);
      } else {
        return console.log("" + me.tags[level] + str);
      }
    } else if (level === 4 && console.info !== void 0) {
      if (console.info) {
        return console.info("" + me.tags[level] + str);
      } else {
        return console.log("" + me.tags[level] + str);
      }
    } else if (level > 4 && me.tags[level] !== void 0) {
      return console.log("" + me.tags[level] + str);
    } else {
      return console.log(str);
    }
  };

  ARELog.error = function(str) {
    return this.w(1, str);
  };

  ARELog.warn = function(str) {
    return this.w(2, str);
  };

  ARELog.debug = function(str) {
    return this.w(3, str);
  };

  ARELog.info = function(str) {
    return this.w(4, str);
  };

  return ARELog;

})();

AREBezAnimation = (function() {

  /*
   * For all animateable properties the options param passes in the end value,
   * an array of [time, value] control points, the duration of the animation
   * and the property to be affected by these options.
   *
   * Properties are named by keys (rotation, position, color), with composite
   * values supplied as an array of the property name, and the composite name.
   *
   * i.e. ["position", "x"]
   * @param [ARERawActor] actor represents the actor we animate
   * @param [Object] options represents the options used to animate
   * @option options [Number] endVal
   * @option options [Array<Object>] controlPoints
   * @option options [Number] duration
   * @option options [String, Array] property
   * @option options [Number] fps framerate, defaults to 30
   * @option options [Method] cbStart callback to call before animating
   * @option options [Method] cbEnd callback to call after animating
   * @option options [Method] cbStep callback to call after each update
   * @param [Boolean] dryRun sets up for preCalculate only! Actor optional.
   */
  function AREBezAnimation(actor, options, dryRun) {
    this.actor = actor;
    dryRun = !!dryRun;
    this._duration = options.duration;
    this._property = options.property;
    this._controlPoints = options.controlPoints || [];
    this._fps = options.fps || 30;
    this._cbStep = options.cbStep || function() {};
    this._cbEnd = options.cbEnd || function() {};
    this._cbStart = options.cbStart || function() {};
    this._animated = false;
    this.bezOpt = {};
    this.bezOpt.degree = 0;
    if (options.controlPoints.length > 0) {
      this.bezOpt.degree = options.controlPoints.length;
      this.bezOpt.ctrl = options.controlPoints;
    }
    this.bezOpt.endPos = options.endVal;
    this.tIncr = 1 / (this._duration * (this._fps / 1000));
    if (dryRun) {
      this.bezOpt.startPos = options.startVal;
    } else {
      if (this._property[0] === "rotation") {
        this.bezOpt.startPos = this.actor.getRotation();
      }
      if (this._property[0] === "position") {
        if (this._property[1] === "x") {
          this.bezOpt.startPos = this.actor.getPosition().x;
        } else if (this._property[1] === "y") {
          this.bezOpt.startPos = this.actor.getPosition().y;
        }
      }
      if (this._property[0] === "color") {
        if (this._property[1] === "r") {
          this.bezOpt.startPos = this.actor.getColor().getR();
        } else if (this._property[1] === "g") {
          this.bezOpt.startPos = this.actor.getColor().getG();
        } else if (this._property[1] === "b") {
          this.bezOpt.startPos = this.actor.getColor().getB();
        }
      }
    }
  }


  /*
   * Updates the animation for a certain value t, between 0 and 1
   *
   * @param [Number] t animation state, 0.0-1.0
   * @param [Boolean] apply applies the updated value, defaults to true
   *
   * @return [Number] val new value
   * @private
   */

  AREBezAnimation.prototype._update = function(t, apply) {
    var val, _Mt, _Mt2, _Mt3, _t2, _t3;
    apply || (apply = true);
    if (t < 0) {
      t = 0;
    }
    if (t > 1) {
      t = 1;
    }
    if (this.bezOpt.degree === 0) {
      val = this.bezOpt.startPos + ((this.bezOpt.endPos - this.bezOpt.startPos) * t);
    } else if (this.bezOpt.degree === 1) {
      _Mt = 1 - t;
      _Mt2 = _Mt * _Mt;
      _t2 = t * t;
      val = (_Mt2 * this.bezOpt.startPos) + (2 * _Mt * t * this.bezOpt.ctrl[0].y) + _t2 * this.bezOpt.endPos;
    } else if (this.bezOpt.degree === 2) {
      _Mt = 1 - t;
      _Mt2 = _Mt * _Mt;
      _Mt3 = _Mt2 * _Mt;
      _t2 = t * t;
      _t3 = _t2 * t;
      val = (_Mt3 * this.bezOpt.startPos) + (3 * _Mt2 * t * this.bezOpt.ctrl[0].y) + (3 * _Mt * _t2 * this.bezOpt.ctrl[1].y) + (_t3 * this.bezOpt.endPos);
    } else {
      throw new Error("Invalid degree, can't evaluate (" + this.bezOpt.degree + ")");
    }
    if (apply) {
      this._applyValue(val);
      this._cbStep(val);
    }
    return val;
  };


  /*
   * Calculate value for each step, return an object with "values" and
   * "stepTime" keys
   *
   * @return [Object] bezValues
   */

  AREBezAnimation.prototype.preCalculate = function() {
    var bezValues, t;
    t = 0;
    bezValues = {
      stepTime: this._duration * this.tIncr
    };
    bezValues.values = [];
    while (t <= 1.0) {
      t += this.tIncr;
      if (t > 1 && t < (1 + this.tIncr)) {
        t = 1;
      } else if (t > 1) {
        break;
      }
      bezValues.values.push(this._update(t, false));
    }
    return bezValues;
  };


  /*
   * Apply value to our actor
   *
   * @param [Number] val
   * @private
   */

  AREBezAnimation.prototype._applyValue = function(val) {
    var _b, _g, _r;
    if (this._property[0] === "rotation") {
      return this.actor.setRotation(val);
    } else if (this._property[0] === "position") {
      if (this._property[1] === "x") {
        return this.actor.setPosition({
          x: val,
          y: this.actor.getPosition().y
        });
      } else if (this._property[1] === "y") {
        return this.actor.setPosition({
          x: this.actor.getPosition().x,
          y: val
        });
      }
    } else if (this._property[0] === "color") {
      if (this._property[1] === "r") {
        _r = val;
        _g = this.actor.getColor().getG();
        _b = this.actor.getColor().getB();
        return this.actor.setColor(_r, _g, _b);
      } else if (this._property[1] === "g") {
        _r = this.actor.getColor().getR();
        _g = val;
        _b = this.actor.getColor().getB();
        return this.actor.setColor(_r, _g, _b);
      } else if (this._property[1] === "b") {
        _r = this.actor.getColor().getR();
        _g = this.actor.getColor().getG();
        _b = val;
        return this.actor.setColor(_r, _g, _b);
      }
    }
  };


  /*
   * Called after construction of the animation object
   * to actually begin the animation
   */

  AREBezAnimation.prototype.animate = function() {
    var t;
    if (this._animated) {
      return;
    } else {
      this._animated = true;
    }
    this._cbStart();
    t = -this.tIncr;
    return this._intervalID = setInterval((function(_this) {
      return function() {
        t += _this.tIncr;
        if (t > 1) {
          t = 1;
        }
        _this._update(t);
        if (t === 1) {
          clearInterval(_this._intervalID);
          return _this._cbEnd();
        } else {
          return _this._cbStep();
        }
      };
    })(this), 1000 / this._fps);
  };

  return AREBezAnimation;

})();

AREVertAnimation = (function() {

  /*
   * Class to animate vertices using vertex delta sets. The delta sets describe
   * the change in vertice structure at a specific point in time.
   *
   * Note that vertex sets are stored flat, and deltas are interpreted the same
   * way. So deltas take the form of [deltaX1, deltaY1, deltaX2, deltaY2, ....]
   *
   * Vertices need to be passed in as deltas. Any vertices not currently present
   * in the actor (new vertices, index > actor.vertices.length) will be pushed
   * directly. If the new vertice set is smaller than that of the actor, the
   * difference will be dropped unless the ending vertice has a value of "|"
   *
   * Vertices with a value of "." will be left unchanged. Absolute values will
   * be set directly, whereas numbers prefixed with "-" or "+" will be offset
   * accordingly.
   *
   * Repeating series may also be passed in, signaling repetition with "...",
   * and ending delta parsing. As such, no unique deltas may exist after an
   * occurence of "..." is encountered! Repeating series also support partial
   * application (existing vert set length does not have to be divisible by
   * the repeat step)
   *
   * @example Example vertex set specifications
   *   ["+5", "-3", 3.53, 5, ".", "."]
   *   applied to
   *   [20, 42, 23, 67, 34, 75, 96, 32, 76, 23]
   *   yields
   *   [25, 39, 3.53, 5, 34, 75]
   *
   *   ["2", "|"]
   *   applied to
   *   [1, 1, 1, 1, 1, 1]
   *   yields
   *   [2, 1, 1, 1, 1, 1]
   *
   *   ["+1", ".", "..."]
   *   applies to
   *   [4, 4, 4, 4, 4, 4, 4, 4, 4]
   *   yields
   *   [5, 4, 5, 4, 5, 4, 5, 4, 5]
   *
   *   Values passed in as numbers (not strings) will be interpreted as absolute
   *   changes. If you need to set a negative value, use a number, not a string!
   *
   * @param [ARERawActor] actor the actor we apply the modifications to
   * @param [Object] options the options we apply
   * @option options [Number, Array<Number>] delays
   * @option options [Array, Array<Array>] deltas
   * @option options [Array<Number>] udata objects passed into step callback
   * @option options [Method] cbStart callback to call before animating
   * @option options [Method] cbStep callback to call on each delta application
   * @option options [Method] cbEnd callback to call after animating
   */
  function AREVertAnimation(actor, options) {
    this.actor = actor;
    this._delays = options.delays;
    this._deltas = options.deltas;
    this._udata = options.udata;
    this._cbStep = options.cbStep || function() {};
    this._cbEnd = options.cbEnd || function() {};
    this._cbStart = options.cbStart || function() {};
    if (this._delays.length !== this._deltas.length) {
      ARELog.warn("Vert animation delay count != delta set count! Bailing.");
      this._animated = true;
      return;
    }
    this._animated = false;
  }


  /*
   * Set the timeout for our _applyDeltas() method
   *
   * @param [Object] deltaSet set of deltas to apply to the actor
   * @param [Number] delay the delay in miliseconds to make the update
   * @param [Object] udata optional userdata to send to callback
   * @param [Boolean] last signals this is the last timeout
   * @private
   */

  AREVertAnimation.prototype._setTimeout = function(deltaSet, delay, udata, last) {
    return setTimeout((function(_this) {
      return function() {
        _this._applyDeltas(deltaSet, udata);
        if (last) {
          return _this._cbEnd();
        }
      };
    })(this), delay);
  };


  /*
   * @private
   * Applies the delta set to the actor
   *
   * @param [Array<String, Number>] deltaSet
   * @param [Object] udata optional userdata to send to callback
   */

  AREVertAnimation.prototype._applyDeltas = function(deltaSet, udata) {
    var d, finalVerts, i, repeat, val, _i, _ref;
    this._cbStep(udata);
    finalVerts = this.actor.getVertices();
    repeat = deltaSet.join("_").indexOf("...") !== -1;
    for (i = _i = 0, _ref = deltaSet.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      d = deltaSet[i];
      if (i >= finalVerts.length) {
        if (repeat) {
          break;
        }
        val = void 0;
      } else {
        val = finalVerts[i];
      }
      if (typeof d === "number") {
        val = d;
      } else if (typeof d === "string") {
        if (!val) {
          ARELog.warn("Vertex does not exist, yet delta is relative!");
          return;
        }
        if (d.charAt(0) === "|") {
          break;
        } else if (d.charAt(0) === "-") {
          val -= Number(d.slice(1));
        } else if (d.charAt(0) === "+") {
          val += Number(d.slice(1));
        } else if (d === "...") {
          i = 0;
        } else if (d.charAt(0) !== ".") {
          ARELog.warn("Unknown delta action, " + d + ", can't apply deltas.");
          return;
        }
      } else {
        ARELog.warn("Unknown delta type, can't apply deltas! " + d + " " + (typeof d));
        return;
      }
      if (i > finalVerts.length) {
        ARELog.warn("Vertex gap, can't push new vert! " + val + ":" + d + ":" + i);
        return;
      } else if (i === finalVerts.length) {
        finalVerts.push(val);
      } else {
        finalVerts[i] = val;
      }
    }
    return this.actor.updateVertices(finalVerts);
  };


  /*
   * Looks through all the options provided and sends them to the update
   * function so they are not lost when i updates
   */

  AREVertAnimation.prototype.animate = function() {
    var i, last, udata, _i, _ref, _results;
    if (this._animated) {
      return;
    } else {
      this._animated = true;
    }
    this._cbStart();
    _results = [];
    for (i = _i = 0, _ref = this._deltas.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      udata = null;
      if (this._udata) {
        if (this._udata instanceof Array) {
          if (i < this._udata.length) {
            udata = this._udata[i];
          }
        } else {
          udata = this._udata;
        }
      }
      last = i === (this._deltas.length - 1);
      _results.push(this._setTimeout(this._deltas[i], this._delays[i], udata, last));
    }
    return _results;
  };

  return AREVertAnimation;

})();

AREPsyxAnimation = (function() {

  /*
   * Class to "animate" physics properties which means changing them
   * at certain times by calling the createPhysicsBody method of an actor
   *
   * @param [ARERawActor] actor the actor we apply the modifications to
   * @param [Object] options
   * @option options [Number] mass
   * @option options [Number] friction
   * @option options [Number] elasticity
   * @option options [Number] timeout
   * @option options [Method] cbStart callback to call before animating
   * @option options [Method] cbEnd callback to call after animating
   */
  function AREPsyxAnimation(actor, options) {
    this.actor = actor;
    this._mass = options.mass || 0;
    this._friction = options.friction || 0;
    this._elasticity = options.elasticity || 0;
    this._timeout = options.timeout;
    this._cbStep = options.cbStep || function() {};
    this._cbEnd = options.cbEnd || function() {};
    this._cbStart = options.cbStart || function() {};
    this._animated = false;
  }


  /*
   * Activates the animation (can only be run once)
   */

  AREPsyxAnimation.prototype.animate = function() {
    if (this._animated) {
      return;
    } else {
      this._animated = true;
    }
    this._cbStart();
    return setTimeout((function(_this) {
      return function() {
        _this.actor.createPhysicsBody(_this._mass, _this._friction, _this._elasticity);
        return _this._cbEnd();
      };
    })(this), this._timeout);
  };

  return AREPsyxAnimation;

})();

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
   * Refresh actor vertices, passed in as a flat array
   *
   * @param [Number] id actor id
   * @param [Array<Number<] verts
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setVertices = function(id, verts) {
    var a;
    if (a = this._findActor(id)) {
      a.updateVertices(verts);
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


/*
 * Calculates the next power of 2 number from (x)
 * @param [Number] x
 */

nextHighestPowerOfTwo = function(x) {
  var i;
  --x;
  i = 1;
  while (i < 32) {
    x = x | x >> i;
    i <<= 1;
  }
  return x + 1;
};

AREEngineInterface = (function() {
  function AREEngineInterface(_masterInterface) {
    this._masterInterface = _masterInterface;
  }


  /*
   * Initialize the engine
   *
   * @param [Number] width
   * @param [Number] height
   * @param [Method] ad function to call to create ad
   * @param [Number] log loglevel, defaults to 1
   * @param [String] id id of element to instantiate on
   */

  AREEngineInterface.prototype.initialize = function(width, height, ad, log, id) {
    if (isNaN(log)) {
      log = 4;
    }
    id || (id = "");
    if (this._engine) {
      ARELog.warn("Re-initialize attempt, ignoring and passing through");
      return ad(this._engine);
    }

    /*
     * Should WGL textures be flipped by their Y axis?
     * NOTE. This does not affect existing textures.
     */
    this.wglFlipTextureY = true;
    this._engine = new ARE(width, height, (function(_this) {
      return function() {
        return ad(_this._engine);
      };
    })(this), log, id);
    this._masterInterface.setEngine(this._engine);
    this._renderer = this._engine.getRenderer();
    return this._engine;
  };


  /*
   * Set global render mode
   *   @see ARERenderer.RENDERER_MODE_*
   *
   * This is a special method only we implement; as such, any libraries
   * interfacing with us should check for the existence of the method before
   * calling it!
   */

  AREEngineInterface.prototype.getRendererMode = function() {
    return this._renderer.getActiveRendererMode();
  };


  /*
   * Set engine clear color
   *
   * @param [Object] color
   * @option color [Number] r red component
   * @option color [Number] g green component
   * @option color [Number] b blue component
   */

  AREEngineInterface.prototype.setClearColor = function(color) {
    if (!this._renderer) {
      return;
    }
    return this._renderer.setClearColor(color.r, color.g, color.b);
  };


  /*
   * Get engine clear color
   *
   * @return [Object] color {r, g, b}
   */

  AREEngineInterface.prototype.getClearColor = function() {
    var col;
    if (!this._renderer) {
      return;
    }
    col = this._renderer.getClearColor();
    return {
      r: col.getR(),
      g: col.getG(),
      b: col.getB()
    };
  };


  /*
   * Set log level
   *
   * @param [Number] level 0-4
   */

  AREEngineInterface.prototype.setLogLevel = function(level) {
    level = Number(level);
    if (isNaN(level)) {
      return ARELog.warn("Log level is NaN");
    }
    level = Math.round(level);
    if (level < 0) {
      level = 0;
    }
    if (level > 4) {
      level = 4;
    }
    return ARELog.level = level;
  };


  /*
   * Get the engine log level
   *
   * @return [Number] level
   */

  AREEngineInterface.prototype.getLogLevel = function() {
    return ARELog.level;
  };


  /*
   * Set camera center position with an object. Leaving out a component leaves it
   * unchanged.
   *
   * @param [Object] position
   * @option position [Number] x x component
   * @option position [Number] y y component
   */

  AREEngineInterface.prototype.setCameraPosition = function(position) {
    var currentPosition;
    currentPosition = this._renderer.getCameraPosition();
    if (position.x !== void 0) {
      currentPosition.x = position.x;
    }
    if (position.y !== void 0) {
      currentPosition.y = position.y;
    }
    return this._renderer.setCameraPosition(currentPosition);
  };


  /*
   * Fetch camera position as an object
   *
   * @return [Object] position {x, y}
   */

  AREEngineInterface.prototype.getCameraPosition = function() {
    return this._renderer.getCameraPosition();
  };


  /*
   * Return our engine's width
   *
   * @return [Number] width
   */

  AREEngineInterface.prototype.getWidth = function() {
    if (!this._renderer) {
      return -1;
    }
    return this._renderer.getWidth();
  };


  /*
   * Return our engine's height
   *
   * @return [Number] height
   */

  AREEngineInterface.prototype.getHeight = function() {
    if (!this._renderer) {
      return -1;
    }
    return this._renderer.getHeight();
  };


  /*
   * Enable/disable benchmarking.
   *
   * NOTE: This is a special method that only we have.
   *
   * @param [Boolean] benchmark
   */

  AREEngineInterface.prototype.setBenchmark = function(status) {
    if (!this._engine) {
      return;
    }
    this._engine.benchmark = status;
    return window.AREMessages.broadcast({
      value: status
    }, "physics.benchmark.set");
  };


  /*
   * Get the NRAID version string that this ad engine supports. It is implied
   * that we are backwards compatible with all previous versions.
   *
   * @return [String] version
   */

  AREEngineInterface.prototype.getNRAIDVersion = function() {
    return "1.0.0,freestanding";
  };


  /*
   * Fetch meta data as defined in loaded manifest
   *
   * @return [Object] meta
   */

  AREEngineInterface.prototype.getMetaData = function() {
    return this._metaData;
  };


  /*
   * Load a package.json manifest, assume texture paths are relative to our
   * own.
   *
   * As we are a browser engine built for the desktop, and therefore don't
   * support mobile device features like orientation, or need to load files off
   * the disk, we only support a subset of the NRAID creative manifest.
   *
   * @param [Object] manifest
   * @option manifest [String] version NRAID version string
   * @option manifest [Object] meta
   * @option manifest [Array<Object>] textures
   * @param [Method] cb callback to call once the load completes (textures)
   */

  AREEngineInterface.prototype.loadManifest = function(manifest, cb) {
    if (!manifest.version) {
      throw new Error("No manifest version provided!");
    }
    if (manifest.version.split(",")[0] > this.getNRAIDVersion().split(",")[0]) {
      throw new Error("Unsupported NRAID version");
    }
    this._metaData = manifest.meta;
    if (manifest.textures) {
      return async.each(manifest.textures, (function(_this) {
        return function(tex, done) {
          return _this.loadTexture(tex, function() {
            return done();
          }, _this.wglFlipTextureY);
        };
      })(this), cb);
    } else {
      return cb();
    }
  };


  /*
   * Loads a texture, and adds it to our renderer
   *
   * @param [Object] textureDef Texture definition object, NRAID-compatible
   * @param [Method] cb called when texture is loaded
   * @param [Boolean] flipTexture optional
   */

  AREEngineInterface.prototype.loadTexture = function(textureDef, cb, flipTexture) {
    var gl, img, tex;
    if (typeof flipTexture !== "boolean") {
      flipTexture = this.wglFlipTextureY;
    }
    if (!!textureDef.atlas) {
      throw new Error("This version of ARE does not support atlas loading!");
    }
    img = new Image();
    img.crossOrigin = "anonymous";
    gl = this._renderer.getGL();
    tex = null;
    if (this._renderer.isWGLRendererActive()) {
      tex = gl.createTexture();
      img.onload = (function(_this) {
        return function() {
          var canvas, ctx, h_NPOT, scaleX, scaleY, w_NPOT;
          ARELog.info("Loading GL tex: " + textureDef.name + ", " + textureDef.file);
          scaleX = 1;
          scaleY = 1;
          w_NPOT = (img.width & (img.width - 1)) !== 0;
          h_NPOT = (img.height & (img.height - 1)) !== 0;
          if (w_NPOT || h_NPOT) {
            canvas = document.createElement("canvas");
            canvas.width = nextHighestPowerOfTwo(img.width);
            canvas.height = nextHighestPowerOfTwo(img.height);
            scaleX = img.width / canvas.width;
            scaleY = img.height / canvas.height;
            ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            img = canvas;
          }
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipTexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.bindTexture(gl.TEXTURE_2D, null);
          _this._renderer.addTexture({
            name: textureDef.name,
            texture: tex,
            width: img.width,
            height: img.height,
            scaleX: scaleX,
            scaleY: scaleY
          });
          if (cb) {
            return cb();
          }
        };
      })(this);
    } else {
      img.onload = (function(_this) {
        return function() {
          ARELog.info("Loading canvas tex: " + textureDef.name + ", " + textureDef.file);
          _this._renderer.addTexture({
            name: textureDef.name,
            texture: img,
            width: img.width,
            height: img.height
          });
          if (cb) {
            return cb();
          }
        };
      })(this);
    }
    return img.src = textureDef.file;
  };


  /*
   * Get renderer texture size by name
   *
   * @param [String] name
   * @param [Object] size
   */

  AREEngineInterface.prototype.getTextureSize = function(name) {
    return this._renderer.getTextureSize(name);
  };

  return AREEngineInterface;

})();

AREAnimationInterface = (function() {
  AREAnimationInterface._animationMap = {
    "position": AREBezAnimation,
    "color": AREBezAnimation,
    "rotation": AREBezAnimation,
    "mass": AREPsyxAnimation,
    "friction": AREPsyxAnimation,
    "elasticity": AREPsyxAnimation,
    "physics": AREPsyxAnimation,
    "vertices": AREVertAnimation
  };

  function AREAnimationInterface(masterInterface) {}

  AREAnimationInterface.prototype.setEngine = function(engine) {
    return this._renderer = engine.getRenderer();
  };

  AREAnimationInterface.prototype.canAnimate = function(property) {
    return !!AREAnimationInterface._animationMap[property];
  };

  AREAnimationInterface.prototype.getAnimationName = function(property) {
    if (!AREAnimationInterface._animationMap[property]) {
      return false;
    } else {
      switch (AREAnimationInterface._animationMap[property]) {
        case AREBezAnimation:
          return "bezier";
        case AREPsyxAnimation:
          return "psyx";
        case AREVertAnimation:
          return "vert";
        default:
          return false;
      }
    }
  };

  AREAnimationInterface.prototype.animate = function(actorID, property, options) {
    var a, actor, name, _i, _len, _ref, _spawnAnim;
    options.start || (options.start = 0);
    actor = null;
    _ref = this._renderer._actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === actorID) {
        actor = a;
        break;
      }
    }
    if (actor === null) {
      throw new Error("Actor not found, can't animate! " + actorId);
    }
    name = property[0];
    if (options.property === void 0) {
      options.property = property;
    }
    _spawnAnim = function(_n, _a, _o) {
      if (AREAnimationInterface._animationMap[_n] === AREBezAnimation) {
        return new AREBezAnimation(_a, _o).animate();
      } else if (AREAnimationInterface._animationMap[_n] === AREPsyxAnimation) {
        return new AREPsyxAnimation(_a, _o).animate();
      } else if (AREAnimationInterface._animationMap[_n] === AREVertAnimation) {
        return new AREVertAnimation(_a, _o).animate();
      } else {
        return ARELog.warn("Unrecognized property: " + _n);
      }
    };
    if (options.start > 0) {
      return setTimeout((function() {
        return _spawnAnim(name, actor, options);
      }), options.start);
    } else {
      return _spawnAnim(name, actor, options);
    }
  };

  AREAnimationInterface.prototype.preCalculateBez = function(options) {
    options.controlPoints || (options.controlPoints = 0);
    options.fps || (options.fps = 30);
    return new AREBezAnimation(null, options, true).preCalculate();
  };

  return AREAnimationInterface;

})();

AREInterface = (function() {
  function AREInterface() {
    this._Actors = new AREActorInterface(this);
    this._Engine = new AREEngineInterface(this);
    this._Animations = new AREAnimationInterface(this);
  }

  AREInterface.prototype.Actors = function() {
    return this._Actors;
  };

  AREInterface.prototype.Engine = function() {
    return this._Engine;
  };

  AREInterface.prototype.Animations = function() {
    return this._Animations;
  };

  AREInterface.prototype.setEngine = function(engine) {
    this._Actors.setEngine(engine);
    return this._Animations.setEngine(engine);
  };

  return AREInterface;

})();

ARE = (function() {
  ARE.config = {
    physics: true,
    deps: {
      physics: {
        chipmunk: "/components/chipmunk/cp.js",
        physics_worker: "/lib/physics/worker.js"
      }
    }
  };

  ARE.Version = {
    MAJOR: 1,
    MINOR: 5,
    PATCH: 1,
    BUILD: null,
    STRING: "1.5.1"
  };


  /*
   * Instantiates the engine, starting the render loop and physics handler.
   * Further useage should happen through the interface layer, either manually
   * or with the aid of AJS.
   *
   * After instantiation, the cb is called with ourselves as an argument
   *
   * Checks for dependencies and bails early if all are not found.
   *
   * @param [Number] width optional width to pass to the canvas
   * @param [Number] height optional height to pass to the canvas
   * @param [Method] cb callback to execute when finished initializing
   * @param [Number] logLevel level to start ARELog at, defaults to 4
   * @param [String] canvas optional canvas selector to initalize the renderer
   */

  function ARE(width, height, cb, logLevel, canvas) {
    if (isNaN(logLevel)) {
      logLevel = 4;
    }
    ARELog.level = logLevel;
    canvas || (canvas = "");
    this._renderIntervalId = null;
    this._currentlyRendering = false;
    this.benchmark = false;
    this.setFPS(60);
    if (window._ === null || window._ === void 0) {
      return ARELog.error("Underscore.js is not present!");
    }
    this._renderer = new ARERenderer({
      canvasId: canvas,
      width: width,
      height: height
    });
    if (ARE.config.physics) {

      /*
       * We expose the physics manager to the window, so actors can directly
       * communicate with it
       */
      this._physics = new PhysicsManager(this._renderer, ARE.config.deps.physics, (function(_this) {
        return function() {
          _this.startRendering();
          return cb(_this);
        };
      })(this));
      window.AREPhysicsManager = this._physics;
    } else {
      ARELog.info("Proceeding without physics...");
      setTimeout((function(_this) {
        return function() {
          _this.startRendering();
          return cb(_this);
        };
      })(this));
    }
    this;
  }


  /*
   * Get our internal ARERenderer instance
   *
   * @return [ARERenderer] renderer
   */

  ARE.prototype.getRenderer = function() {
    return this._renderer;
  };


  /*
   * Set framerate as an FPS figure
   * @param [Number] fps
   * @return [self]
   */

  ARE.prototype.setFPS = function(fps) {
    this._framerate = 1.0 / fps;
    return this;
  };


  /*
   * Start render loop if it isn't already running
   */

  ARE.prototype.startRendering = function() {
    var render, renderer;
    if (this._currentlyRendering) {
      return;
    }
    this._currentlyRendering = true;
    ARELog.info("Starting render loop");
    renderer = this._renderer;
    render = function() {
      renderer.update();
      renderer.render();
      return window.requestAnimationFrame(render);
    };
    return window.requestAnimationFrame(render);
  };


  /*
   * Check if the render loop is currently running
   *
   * @return [Boolean] rendering
   */

  ARE.prototype.isRendering = function() {
    return this._currentlyRendering;
  };


  /*
   * Set renderer clear color in integer RGB form (passes through to renderer)
   *
   * @param [Number] r
   * @param [Number] g
   * @param [Number] b
   * @return [self]
   */

  ARE.prototype.setClearColor = function(r, g, b) {
    r || (r = 0);
    g || (g = 0);
    b || (b = 0);
    if (this._renderer instanceof ARERenderer) {
      this._renderer.setClearColor(r, g, b);
    }
    return this;
  };


  /*
   * Get clear color from renderer (if active, null otherwise)
   *
   * @return [AREColor3] color
   */

  ARE.prototype.getClearColor = function() {
    if (this._renderer instanceof ARERenderer) {
      return this._renderer.getClearColor();
    } else {
      return null;
    }
  };


  /*
   * Return our internal renderer width
   *
   * @return [Number] width
   */

  ARE.prototype.getWidth = function() {
    return this._renderer.getWidth();
  };


  /*
   * Return our internal renderer height
   *
   * @return [Number] height
   */

  ARE.prototype.getHeight = function() {
    return this._renderer.getHeight();
  };


  /*
   * Request a pick render, passed straight to the renderer
   *
   * @param [FrameBuffer] buffer
   * @param [Method] cb cb to call post-render
   */

  ARE.prototype.requestPickingRenderWGL = function(buffer, cb) {
    if (this._renderer.isWGLRendererActive()) {
      return this._renderer.requestPickingRenderWGL(buffer, cb);
    } else {
      return ARELog.warn("WebGL renderer available for WebGL pick!");
    }
  };


  /*
   * Request a pick render, passed straight to the renderer
   *
   * -param [FrameBuffer] buffer
   * @param [Method] cb cb to call post-render
   */

  ARE.prototype.requestPickingRenderCanvas = function(selectionRect, cb) {
    if (this._renderer.isCanvasRendererActive()) {
      return this._renderer.requestPickingRenderCanvas(selectionRect, cb);
    } else {
      return ARELog.warn("Canvas renderer available for canvas pick!");
    }
  };

  return ARE;

})();

window.AdefyGLI = window.AdefyRE = new AREInterface;

//# sourceMappingURL=are.js.map
