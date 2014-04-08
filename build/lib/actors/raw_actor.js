var ARERawActor;

ARERawActor = (function() {
  ARERawActor.defaultFriction = 0.3;

  ARERawActor.defaultMass = 10;

  ARERawActor.defaultElasticity = 0.2;


  /*
   * Null offset, used when creating dynamic bodies
   * @private
   */

  ARERawActor._nullV = new cp.v(0, 0);


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

  function ARERawActor(verts, texverts) {
    param.required(verts);
    texverts = param.optional(texverts, null);
    this._initializeValues();
    this._registerWithRenderer();
    this.updateVertices(verts, texverts);
    this.setColor(new AREColor3(255, 255, 255));
    this.clearTexture();
  }


  /*
   * Gets an id and registers our existence with the renderer
   * @private
   */

  ARERawActor.prototype._registerWithRenderer = function() {
    this._id = ARERenderer.getNextId();
    return ARERenderer.addActor(this);
  };


  /*
   * Sets up default values and initializes our data structures.
   * @private
   */

  ARERawActor.prototype._initializeValues = function() {
    if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_WGL) {
      this._gl = ARERenderer._gl;
      if (this._gl === void 0 || this._gl === null) {
        throw new Error("GL context is required for actor initialization!");
      }
    }
    this._rotV = new Vector3([0, 0, 1]);
    this._transV = new Vector3([0, 0, 1]);
    this._modelM = new Matrix4();
    this._color = null;
    this._strokeColor = null;
    this._strokeWidth = 1;
    this._colArray = null;
    this._opacity = 1.0;
    this.lit = false;
    this._visible = true;
    this.layer = 0;
    this._physicsLayer = ~0;
    this._id = -1;
    this._position = new cp.v(0, 0);
    this._rotation = 0;
    this._size = {
      x: 0,
      y: 0
    };

    /*
     * Chipmunk-js values
     */
    this._shape = null;
    this._body = null;
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
     * @see AREREnderer.RENDER_MODE_*
     */
    this._renderMode = ARERenderer.RENDER_MODE_TRIANGLE_FAN;

    /*
     * Render styles decide how the object is filled/stroked
     * @see AREREnderer.RENDER_STYLE_*
     */
    this._renderStyle = ARERenderer.RENDER_STYLE_FILL;
    this._texture = null;
    this._attachedTexture = null;
    return this.attachedTextureAnchor = {
      x: 0,
      y: 0,
      angle: 0
    };
  };


  /*
   * Removes the Actor
   * @return [null]
   */

  ARERawActor.prototype.destroy = function() {
    this.destroyPhysicsBody();
    return null;
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
   * Set our render layer. Higher layers render on top of lower ones
   *
   * @param [Number] layer
   */

  ARERawActor.prototype.setLayer = function(layer) {
    this.layer = param.required(layer);
    ARERenderer.removeActor(this, true);
    return ARERenderer.addActor(this);
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
    if (!ARERenderer.hasTexture(name)) {
      throw new Error("No such texture loaded: " + name);
    }
    this._texture = ARERenderer.getTexture(name);
    this.setShader(ARERenderer.getMe().getTextureShader());
    this._material = ARERenderer.MATERIAL_TEXTURE;
    return this;
  };


  /*
   * Clear our internal texture, leaving us to render with a flat color
   * @return [this]
   */

  ARERawActor.prototype.clearTexture = function() {
    this._texture = void 0;
    this.setShader(ARERenderer.getMe().getDefaultShader());
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
   * Set shader used to draw actor. For the time being, the routine mearly
   * pulls out handles for the ModelView, Color, and Position structures
   *
   * @param [AREShader] shader
   * @return [this]
   */

  ARERawActor.prototype.setShader = function(shader) {
    var handles;
    if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_WGL) {
      param.required(shader);
      if (shader.getProgram() === null) {
        throw new Error("Shader has to be built before it can be used!");
      }
      if (shader.getHandles() === null) {
        shader.generateHandles();
      }
      handles = shader.getHandles();
      return this._sh_handles = handles;
    } else {

    }
  };


  /*
   * Creates the internal physics body, if one does not already exist
   *
   * @param [Number] mass 0.0 - unbound
   * @param [Number] friction 0.0 - unbound
   * @param [Number] elasticity 0.0 - unbound
   */

  ARERawActor.prototype.createPhysicsBody = function(_mass, _friction, _elasticity) {
    var a, i, moment, origVerts, pos, space, vertIndex, verts, x, y, _i, _ref;
    this._mass = _mass;
    this._friction = _friction;
    this._elasticity = _elasticity;
    if (AREPhysics.getWorld() === null || AREPhysics.getWorld() === void 0) {
      AREPhysics.startStepping();
    }
    if (this._shape === !null) {
      return;
    }
    if (AREPhysics.bodyCount === 0) {
      AREPhysics.startStepping();
    }
    AREPhysics.bodyCount++;
    if (this._mass === void 0 || this._mass === null) {
      this._mass = 0;
    }
    if (this._mass < 0) {
      this._mass = 0;
    }
    if (this._friction === void 0) {
      this._friction = ARERawActor.defaultFriction;
    } else if (this._friction < 0) {
      this._friction = 0;
    }
    if (this._elasticity === void 0) {
      this._elasticity = ARERawActor.defaultElasticity;
    } else if (this._elasticity < 0) {
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
      verts.push(origVerts[i] / ARERenderer.getPPM());
      verts.push(origVerts[i + 1] / ARERenderer.getPPM());
      if (this._mass === 0) {
        x = verts[verts.length - 2];
        y = verts[verts.length - 1];
        a = this._rotation;
        verts[verts.length - 2] = x * Math.cos(a) - (y * Math.sin(a));
        verts[verts.length - 1] = x * Math.sin(a) + (y * Math.cos(a));
      }
    }
    space = AREPhysics.getWorld();
    pos = ARERenderer.screenToWorld(this._position);
    if (this._mass === 0) {
      this._shape = space.addShape(new cp.PolyShape(space.staticBody, verts, pos));
      this._shape.setLayers(this._physicsLayer);
      this._body = null;
    } else {
      moment = cp.momentForPoly(this._mass, verts, ARERawActor._nullV);
      this._body = space.addBody(new cp.Body(this._mass, moment));
      this._body.setPos(pos);
      this._body.setAngle(this._rotation);
      this._shape = new cp.PolyShape(this._body, verts, ARERawActor._nullV);
      this._shape = space.addShape(this._shape);
      this._shape.setLayers(this._physicsLayer);
    }
    this._shape.setFriction(this._friction);
    this._shape.setElasticity(this._elasticity);
    return this;
  };


  /*
   * Destroys the physics body if one exists
   */

  ARERawActor.prototype.destroyPhysicsBody = function() {
    if (AREPhysics.bodyCount === 0) {
      return;
    }
    if (this._shape === null) {
      return;
    }
    AREPhysics.bodyCount--;
    AREPhysics.getWorld().removeShape(this._shape);
    if (this._body) {
      AREPhysics.getWorld().removeBody(this._body);
    }
    this._shape = null;
    this._body = null;
    if (AREPhysics.bodyCount === 0) {
      return AREPhysics.stopStepping();
    } else if (AREPhysics.bodyCount < 0) {
      throw new Error("Body count is negative!");
    }
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
    this._physicsLayer = 1 << param.required(layer, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    if (this._shape !== null) {
      return this._shape.setLayers(this._physicsLayer);
    }
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
    var newTexVerts, newVertices;
    newVertices = param.optional(vertices, this._vertices);
    newTexVerts = param.optional(texverts, this._texVerts);
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
    if (newVertices !== this._vertices) {
      this.updateVertBuffer(newVertices);
    }
    if (newTexVerts !== this._texVerts) {
      return this.updateUVBuffer(newTexVerts);
    }
  };


  /*
   * Updates vertex buffer
   * NOTE: No check is made as to the validity of the supplied data!
   *
   * @private
   * @param [Array<Number>] vertices
   */

  ARERawActor.prototype.updateVertBuffer = function(_vertices) {
    var i, mnx, mny, mxx, mxy, _i, _ref;
    this._vertices = _vertices;
    this._vertBufferFloats = new Float32Array(this._vertices);
    if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_WGL) {
      this._vertBuffer = this._gl.createBuffer();
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertBufferFloats, this._gl.STATIC_DRAW);
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    }
    mnx = 0;
    mny = 0;
    mxx = 0;
    mxy = 0;
    for (i = _i = 1, _ref = this._vertices.length / 2; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
      if (this._vertices[i * 2] < mnx) {
        mnx = this._vertices[i * 2];
      }
      if (mxx < this._vertices[i * 2]) {
        mxx = this._vertices[i * 2];
      }
      if (this._vertices[i * 2 + 1] < mny) {
        mny = this._vertices[i * 2 + 1];
      }
      if (mxy < this._vertices[i * 2 + 1]) {
        mxy = this._vertices[i * 2 + 1];
      }
    }
    this._size.x = mxx - mnx;
    return this._size.y = mxy - mny;
  };


  /*
   * Updates UV buffer (should only be called by updateVertices())
   * NOTE: No check is made as to the validity of the supplied data!
   *
   * @private
   * @param [Array<Number>] vertices
   */

  ARERawActor.prototype.updateUVBuffer = function(_texVerts) {
    this._texVerts = _texVerts;
    if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_WGL) {
      this._origTexVerts = this._texVerts;
      this._texVBufferFloats = new Float32Array(this._texVerts);
      this._texBuffer = this._gl.createBuffer();
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._texBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, this._texVBufferFloats, this._gl.STATIC_DRAW);
      return this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    }
  };


  /*
   * Set texture repeat per coordinate axis
   *
   * @param [Number] x horizontal repeat
   * @param [Number] y vertical repeat (default 1)
   */

  ARERawActor.prototype.setTextureRepeat = function(x, y) {
    var i, uvs, _i, _ref;
    param.required(x);
    y = param.optional(y, 1);
    uvs = [];
    for (i = _i = 0, _ref = this._origTexVerts.length; _i < _ref; i = _i += 2) {
      uvs.push(this._origTexVerts[i] * y);
      uvs.push(this._origTexVerts[i + 1] * x);
    }
    this.updateUVBuffer(uvs);
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
    if (this._body !== null) {
      this.destroyPhysicsBody();
      return this.createPhysicsBody(this._mass, this._friction, this._elasticity);
    }
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
    this.attachedTextureAnchor.x = param.optional(offx, 0);
    this.attachedTextureAnchor.y = param.optional(offy, 0);
    this.attachedTextureAnchor.angle = param.optional(angle, 0);
    if (!ARERenderer.hasTexture(texture)) {
      throw new Error("No such texture loaded: " + texture);
    }
    if (this._attachedTexture !== null) {
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
    var a, i, _i, _len, _ref;
    if (this._attachedTexture === null) {
      return false;
    }
    _ref = ARERenderer.actors;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      a = _ref[i];
      if (a.getId() === this._attachedTexture.getId()) {
        a.destroyPhysicsBody();
        ARERenderer.actors.splice(i, 1);
        this._attachedTexture = null;
        return true;
      }
    }
    return false;
  };


  /*
   * Set attachment visiblity. Fails if we don't have an attached texture
   *
   * @param [Boolean] visible
   * @return [Boolean] success
   */

  ARERawActor.prototype.setAttachmentVisibility = function(visible) {
    param.required(visible);
    if (this._attachedTexture === null) {
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
      this.updatePosition();
      pos = this.getPosition();
      rot = this.getRotation();
      pos.x += this.attachedTextureAnchor.x;
      pos.y += this.attachedTextureAnchor.y;
      rot += this.attachedTextureAnchor.angle;
      a = this.getAttachment();
      this.setPosition(pos);
      this.setRotation(rot);
      return a;
    }
    return this;
  };


  /*
   * Update position from physics body if we have one
   */

  ARERawActor.prototype.updatePosition = function() {
    if (this._body !== null) {
      this._position = ARERenderer.worldToScreen(this._body.getPos());
      this._rotation = this._body.a;
    }
    return this;
  };


  /*
   * Binds the actor's WebGL Texture with all needed attributes
   * @param [Object] gl WebGL Context
   */

  ARERawActor.prototype.wglBindTexture = function(gl) {
    if (this._material === ARERenderer.MATERIAL_TEXTURE) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this._texBuffer);
      gl.vertexAttribPointer(this._sh_handles.aTexCoord, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(this._sh_handles.uUVScale, this._texture.scaleX, this._texture.scaleY);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this._texture.texture);
      gl.uniform1i(this._sh_handles.uSampler, 0);
    }
    return this;
  };


  /*
   * Renders the Actor using the WebGL interface, this function should only
   * be called by a ARERenderer in WGL mode
   * @param [Object] gl WebGL context
   */

  ARERawActor.prototype.wglDraw = function(gl) {
    var flatMV;
    param.required(gl);
    if (!this._visible) {
      return false;
    }
    this.updatePosition();
    this._modelM = new Matrix4();
    this._transV.elements[0] = this._position.x - ARERenderer.camPos.x;
    if (ARERenderer.force_pos0_0) {
      this._transV.elements[1] = ARERenderer.getHeight() - this._position.y + ARERenderer.camPos.y;
    } else {
      this._transV.elements[1] = this._position.y - ARERenderer.camPos.y;
    }
    this._modelM.translate(this._transV);
    this._modelM.rotate(-this._rotation, this._rotV);
    flatMV = this._modelM.flatten();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertBuffer);
    gl.vertexAttribPointer(this._sh_handles.aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(this._sh_handles.uModelView, false, flatMV);
    gl.uniform4f(this._sh_handles.uColor, this._colArray[0], this._colArray[1], this._colArray[2], 1.0);
    gl.uniform1f(this._sh_handles.uOpacity, this._opacity);
    this.wglBindTexture(gl);

    /*
     * @TODO, actually apply the RENDER_STYLE_*
     */
    switch (this._renderMode) {
      case ARERenderer.RENDER_MODE_LINE_LOOP:
        gl.drawArrays(gl.LINE_LOOP, 0, this._vertices.length / 2);
        break;
      case ARERenderer.RENDER_MODE_TRIANGLE_FAN:
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this._vertices.length / 2);
        break;
      case ARERenderer.RENDER_MODE_TRIANGLE_STRIP:
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this._vertices.length / 2);
        break;
      default:
        throw new Error("Invalid render mode! " + this._renderMode);
    }
    return this;
  };


  /*
   * Updates the context settings with the Actor's strokeStyle and fillStyle
   * @param [Object] 2d context
   */

  ARERawActor.prototype.cvSetupStyle = function(context) {
    if (this._strokeWidth !== null) {
      context.lineWidth = this._strokeWidth;
    } else {
      context.lineWidth = 1;
    }
    if (this._strokeColor) {
      context.strokeStyle = "rgb" + this._strokeColor;
    } else {
      context.strokeStyle = "#FFF";
    }
    if (this._material === ARERenderer.MATERIAL_TEXTURE) {

    } else {
      if (this._color) {
        context.fillStyle = "rgb" + this._color;
      } else {
        context.fillStyle = "#FFF";
      }
    }
    return this;
  };


  /*
   * Renders the current actor using the 2d context, this function should only
   * be called by a ARERenderer in CANVAS mode
   * @param [Object] 2d context
   */

  ARERawActor.prototype.cvDraw = function(context) {
    var i, x, y, _i, _ref;
    param.required(context);
    if (!this._visible) {
      return false;
    }
    this.updatePosition();
    this._transV.elements[0] = this._position.x - ARERenderer.camPos.x;
    this._transV.elements[1] = this._position.y - ARERenderer.camPos.y;
    x = this._transV.elements[0];
    y = this._transV.elements[1];
    context.translate(x, y);
    context.beginPath();
    context.rotate(this._rotation);
    context.moveTo(this._vertices[0], this._vertices[1]);
    for (i = _i = 1, _ref = this._vertices.length / 2; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
      context.lineTo(this._vertices[i * 2], this._vertices[i * 2 + 1]);
    }
    context.closePath();
    this.cvSetupStyle(context);
    switch (this._renderMode) {
      case ARERenderer.RENDER_MODE_LINE_LOOP:
        context.stroke();
        break;
      case ARERenderer.RENDER_MODE_TRIANGLE_STRIP:
      case ARERenderer.RENDER_MODE_TRIANGLE_FAN:
        if ((this._renderStyle & ARERenderer.RENDER_STYLE_STROKE) > 0) {
          context.stroke();
        }
        if ((this._renderStyle & ARERenderer.RENDER_STYLE_FILL) > 0) {
          if (this._material === ARERenderer.MATERIAL_TEXTURE) {
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
    param.required(context);
    if (!this._visible) {
      return false;
    }
    this.updatePosition();
    return this;
  };


  /*
   * Set actor render mode, decides how the vertices are perceived
   * @see ARERenderer.RENDER_MODE_*
   *
   * @paran [Number] mode
   * @return [self]
   */

  ARERawActor.prototype.setRenderMode = function(mode) {
    this._renderMode = param.required(mode, ARERenderer.renderModes);
    return this;
  };


  /*
   * Set actor render style, decides how the object is filled/stroked
   * @see ARERenderer.RENDER_STYLE_*
   *
   * @paran [Number] mode
   * @return [self]
   */

  ARERawActor.prototype.setRenderStyle = function(mode) {
    this._renderStyle = param.required(mode, ARERenderer.renderStyles);
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
    param.required(this._opacity);
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
    param.required(position);
    if (this._shape === null) {
      if (position instanceof cp.v) {
        this._position = position;
      } else {
        this._position = new cp.v(Number(position.x), Number(position.y));
      }
    } else if (this._body !== null) {
      this._body.setPos(ARERenderer.screenToWorld(position));
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
    param.required(rotation);
    radians = param.optional(radians, false);
    if (radians === false) {
      rotation = Number(rotation) * 0.0174532925;
    }
    this._rotation = rotation;
    if (this._body !== null) {
      this._body.setAngle(this._rotation);
    } else if (this._shape !== null) {
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
    radians = param.optional(radians, false);
    if (radians === false) {
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

  return ARERawActor;

})();
