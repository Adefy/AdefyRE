var ARERawActor,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ARERawActor = (function(_super) {
  __extends(ARERawActor, _super);

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
   * @param [Array<Number>] vertices flat array of vertices (x1, y1, x2, ...)
   * @param [Array<Number>] texverts flat array of texture coords, optional
   */

  function ARERawActor(_renderer, verts, texverts) {
    this._renderer = _renderer;
    param.required(_renderer);
    param.required(verts);
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
    ARERawActor.__super__.constructor.call(this, "Actor_" + this._id);
    window.AREMessages.registerKoon(this, /^actor\..*/);
  }


  /*
   * Sets up default values and initializes our data structures.
   * @private
   */

  ARERawActor.prototype._initializeValues = function() {
    if (this._renderer.isWGLRendererActive()) {
      if (!(this._gl = this._renderer.getGL())) {
        throw new Error("GL context is required for actor initialization!");
      }
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
    this._initializeModelMatrix();
    this._updateModelMatrix();
    this._size = {
      x: 0,
      y: 0
    };

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
    this.layer = param.required(layer);
    this._renderer.removeActor(this, true);
    return this._renderer.addActor(this);
  };


  /*
   * We support a single texture per actor for the time being. UV coords are
   * generated automatically internally, for a flat map.
   *
   * @param [String] name name of texture to use from renderer
   * @return [this]
   */

  ARERawActor.prototype.setTexture = function(name) {
    param.required(name);
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
    param.required(shader);
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
   */

  ARERawActor.prototype.createPhysicsBody = function(_mass, _friction, _elasticity) {
    var a, bodyDef, i, origVerts, shapeDef, vertIndex, verts, x, y, _i, _ref;
    this._mass = _mass;
    this._friction = _friction;
    this._elasticity = _elasticity;
    if (!(this._mass !== null && this._mass !== void 0)) {
      return;
    }
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
    this.broadcast({}, "physics.enable");
    if (bodyDef) {
      this.broadcast({
        def: bodyDef
      }, "physics.body.create");
    }
    if (shapeDef) {
      this.broadcast({
        def: shapeDef
      }, "physics.shape.create");
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
    this.broadcast({
      id: this._id
    }, "physics.shape.remove");
    if (this._mass !== 0) {
      this.broadcast({
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
    this.destroyPhysicsBody();
    return this.createPhysicsBody(this._mass, this._friction, this._elasticity);
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

  ARERawActor.prototype.refreshPhysics = function() {
    if (!this.hasPhysics()) {
      return;
    }
    this.destroyPhysicsBody();
    return this.createPhysicsBody(this._mass, this._friction, this._elasticity);
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
    this._physicsLayer = 1 << param.required(layer, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    return this.broadcast({
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
    this._size = {
      x: mxx - mnx,
      y: mxy - mny
    };
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
    this._psyxVertices = param.required(verts);
    this.destroyPhysicsBody();
    return this.createPhysicsBody(this._mass, this._friction, this._elasticity);
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
    param.required(texture);
    param.required(width);
    param.required(height);
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
    param.required(visible);
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
            context.drawImage(this._texture.texture, -this._size.x / 2, -this._size.y / 2, this._size.x, this._size.y);
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
   * Set actor position, affects either the actor or the body directly if one
   * exists
   *
   * @param [Object] position x, y
   * @return [self]
   */

  ARERawActor.prototype.setPosition = function(position) {
    this._position = param.required(position);
    this.broadcast({
      id: this._id,
      position: position
    }, "physics.body.set.position");
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
    param.required(rotation);
    radians = !!radians;
    if (!radians) {
      rotation = Number(rotation) * 0.0174532925;
    }
    this._rotation = rotation;
    if (this._mass > 0) {
      this.broadcast({
        id: this._id,
        rotation: this._rotation
      }, "physics.body.set.rotation");
    } else {
      this.destroyPhysicsBody();
      this.createPhysicsBody(this._mass, this._friction, this._elasticity);
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
    param.required(colOrR);
    if (colOrR instanceof AREColor3) {
      target.setR(colOrR.getR());
      target.setG(colOrR.getG());
      target.setB(colOrR.getB());
    } else {
      param.required(g);
      param.required(b);
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
    param.required(colOrR);
    if (!this._color) {
      this._color = new AREColor3;
    }
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
    param.required(colOrR);
    if (!this._strokeColor) {
      this._strokeColor = new AREColor3;
    }
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


  /*
   * Returns actor rotation as an angle in degrees
   *
   * @param [Boolean] radians true to return in radians
   * @return [Number] angle rotation in degrees on z axis
   */

  ARERawActor.prototype.getRotation = function(radians) {
    if (!radians) {
      return this._rotation * 57.2957795;
    } else {
      return this._rotation;
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
        return this._rotation = message.rotation;
    }
  };

  return ARERawActor;

})(Koon);
