var AREActorInterface, AREAnimationInterface, AREBezAnimation, ARECircleActor, AREColor3, AREEngine, AREEngineInterface, AREInterface, ARELog, AREPhysics, AREPolygonActor, AREPsyxAnimation, ARERawActor, ARERectangleActor, ARERenderer, AREShader, AREUtilParam, AREVersion, AREVertAnimation, nextHighestPowerOfTwo, precision, precision_declaration, varying_precision,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AREUtilParam = (function() {
  function AREUtilParam() {}

  AREUtilParam.required = function(p, valid, canBeNull) {
    var isValid, v, _i, _len;
    if (p === null && canBeNull !== true) {
      p = void 0;
    }
    if (p === void 0) {
      throw new Error("Required argument missing!");
    }
    if (valid instanceof Array) {
      if (valid.length > 0) {
        isValid = false;
        for (_i = 0, _len = valid.length; _i < _len; _i++) {
          v = valid[_i];
          if (p === v) {
            isValid = true;
            break;
          }
        }
        if (!isValid) {
          throw new Error("Required argument is not of a valid value!");
        }
      }
    }
    return p;
  };

  AREUtilParam.optional = function(p, def, valid, canBeNull) {
    var isValid, v, _i, _len;
    if (p === null && canBeNull !== true) {
      p = void 0;
    }
    if (p === void 0) {
      p = def;
    }
    if (valid instanceof Array) {
      if (valid.length > 0) {
        isValid = false;
        for (_i = 0, _len = valid.length; _i < _len; _i++) {
          v = valid[_i];
          if (p === v) {
            isValid = true;
            break;
          }
        }
        if (!isValid) {
          throw new Error("Required argument is not of a valid value!");
        }
      }
    }
    return p;
  };

  return AREUtilParam;

})();

if (window.param === void 0) {
  window.param = AREUtilParam;
}

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
    this._texRepeatX = 1;
    this._texRepeatY = 1;
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
      uvs.push((this._origTexVerts[i] / this._texRepeatX) * x);
      uvs.push((this._origTexVerts[i + 1] / this._texRepeatY) * y);
    }
    this._texRepeatX = x;
    this._texRepeatY = y;
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
    this.attachedTextureAnchor.width = width;
    this.attachedTextureAnchor.height = height;
    this.attachedTextureAnchor.x = param.optional(offx, 0);
    this.attachedTextureAnchor.y = param.optional(offy, 0);
    this.attachedTextureAnchor.angle = param.optional(angle, 0);
    if (!ARERenderer.hasTexture(texture)) {
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
    ARERenderer.removeActor(this._attachedTexture);
    this._attachedTexture = null;
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
      a.setPosition(pos);
      a.setRotation(rot);
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
    if (ARERenderer._currentMaterial === ARERenderer.MATERIAL_TEXTURE) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this._texBuffer);
      gl.vertexAttribPointer(this._sh_handles.aTexCoord, 2, gl.FLOAT, false, 0, 0);
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
    if (this._sh_handles.uClipRect) {
      gl.uniform4fv(this._sh_handles.uClipRect, this._clipRect);
    }
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
    if (ARERenderer._currentMaterial === ARERenderer.MATERIAL_TEXTURE) {

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
    if (!ARERenderer.force_pos0_0) {
      context.scale(1, -1);
    }
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
          if (ARERenderer._currentMaterial === ARERenderer.MATERIAL_TEXTURE) {
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

ARERectangleActor = (function(_super) {
  __extends(ARERectangleActor, _super);


  /*
   * Sets us up with the supplied width and height, generating both our vertex
   * and UV sets.
   *
   * @param [Number] width
   * @param [Number] height
   */

  function ARERectangleActor(width, height) {
    var uvs, verts;
    this.width = width;
    this.height = height;
    param.required(width);
    param.required(height);
    if (width <= 0) {
      throw new Error("Invalid width: " + width);
    }
    if (height <= 0) {
      throw new Error("Invalid height: " + height);
    }
    verts = this.generateVertices();
    uvs = this.generateUVs();
    ARERectangleActor.__super__.constructor.call(this, verts, uvs);
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
    return this.updateVertBuffer(this.generateVertices());
  };


  /*
   * Set height, causes a vert refresh
   *
   * @param [Number] height
   */

  ARERectangleActor.prototype.setHeight = function(height) {
    this.height = height;
    return this.updateVertBuffer(this.generateVertices());
  };

  return ARERectangleActor;

})(ARERawActor);

AREPolygonActor = (function(_super) {
  __extends(AREPolygonActor, _super);


  /*
   * Sets us up with the supplied radius and segment count, generating our
   * vertex sets.
   *
   * NOTE: Texture support is not available! No UVs! ;(
   *
   * @param [Number] radius
   * @param [Number] segments
   */

  function AREPolygonActor(radius, segments) {
    var psyxVerts, uvs, verts;
    this.radius = radius;
    this.segments = segments;
    param.required(radius);
    if (this.radius instanceof Array) {
      this._verts = this.radius;
      this.radius = null;
      uvs = this.generateUVs(this._verts);
      AREPolygonActor.__super__.constructor.call(this, this._verts, uvs);
      this.setPhysicsVertices(this._verts);
    } else {
      param.required(segments);
      if (radius <= 0) {
        throw new Error("Invalid radius: " + radius);
      }
      if (segments <= 2) {
        throw new ERror("Invalid segment count: " + segments);
      }
      verts = this.generateVertices();
      psyxVerts = this.generateVertices({
        mode: "physics"
      });
      uvs = this.generateUVs(verts);
      AREPolygonActor.__super__.constructor.call(this, verts, uvs);
      this.setPhysicsVertices(psyxVerts);
    }
    this.setRenderMode(ARERenderer.RENDER_MODE_TRIANGLE_FAN);
  }


  /*
   * @private
   * Private method that rebuilds our vertex array.
   *
   * @param [Object] options optional generation options
   * @options options [Boolean] mode generation mode (normal, or for physics)
   */

  AREPolygonActor.prototype.generateVertices = function(options) {
    var i, radFactor, tanFactor, theta, tx, ty, verts, x, y, _i, _j, _ref, _ref1, _tv;
    options = param.optional(options, {});
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
    return verts;
  };


  /*
   * Generate UV array from a vertex set, using our current radius
   *
   * @return [Array<Number>] uvs
   */

  AREPolygonActor.prototype.generateUVs = function(vertices) {
    var uvs, v, _i, _len;
    param.required(vertices);
    uvs = [];
    for (_i = 0, _len = vertices.length; _i < _len; _i++) {
      v = vertices[_i];
      uvs.push(((v / this.radius) / 2) + 0.5);
    }
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
    return this.fullVertRefresh();
  };


  /*
   * Set segment count, causes a full vert refresh
   *
   * @param [Number] segments
   */

  AREPolygonActor.prototype.setSegments = function(segments) {
    this.segments = segments;
    if (segments <= 2) {
      throw new ERror("Invalid segment count: " + segments);
    }
    return this.fullVertRefresh();
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
   * @param [Number] radius
   */

  function ARECircleActor(radius) {
    this.radius = radius;
    ARECircleActor.__super__.constructor.call(this, radius, 32);
    delete this.setSegments;
    delete this.getSegments;
  }

  return ARECircleActor;

})(AREPolygonActor);

AREColor3 = (function() {

  /*
   * Sets component values
   *
   * @param [Number] r red component
   * @param [Number] g green component
   * @param [Number] b blue component
   */
  function AREColor3(colOrR, g, b) {
    colOrR = param.optional(colOrR, 0);
    g = param.optional(g, 0);
    b = param.optional(b, 0);
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
    param.required(this._vertSrc);
    param.required(this._fragSrc);
    param.required(this._gl);
    build = param.optional(build, false);
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
    param.required(this._gl);
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

AREShader.shaders = {};

AREShader.shaders.wire = {};

AREShader.shaders.solid = {};

AREShader.shaders.texture = {};

precision = "mediump";

varying_precision = "highp";

precision_declaration = "precision " + precision + " float;";

AREShader.shaders.wire.vertex = "" + precision_declaration + "\n\nattribute vec2 aPosition;\n\nuniform mat4 uProjection;\nuniform mat4 uModelView;\n\nvoid main() {\n  gl_Position = uProjection * uModelView * vec4(aPosition, 1, 1);\n}";

AREShader.shaders.wire.fragment = "" + precision_declaration + "\n\nuniform vec4 uColor;\nuniform float uOpacity;\n\nvoid main() {\n  vec4 frag = uColor;\n  frag.a *= uOpacity;\n  gl_FragColor = frag;\n}";

AREShader.shaders.solid.vertex = AREShader.shaders.wire.vertex;

AREShader.shaders.solid.fragment = "" + precision_declaration + "\n\nuniform vec4 uColor;\nuniform float uOpacity;\n\nvoid main() {\n  vec4 frag = uColor;\n  frag.a *= uOpacity;\n  gl_FragColor = frag;\n}";

AREShader.shaders.texture.vertex = "" + precision_declaration + "\n\nattribute vec2 aPosition;\nattribute vec2 aTexCoord;\n/* attribute vec2 aUVScale; */\n\nuniform mat4 uProjection;\nuniform mat4 uModelView;\n\nvarying " + varying_precision + " vec2 vTexCoord;\n/* varying " + varying_precision + " vec2 vUVScale; */\n\nvoid main() {\n  gl_Position = uProjection * uModelView * vec4(aPosition, 1, 1);\n  vTexCoord = aTexCoord;\n  /* vUVScale = aUVScale; */\n}";

AREShader.shaders.texture.fragment = "" + precision_declaration + "\n\nuniform sampler2D uSampler;\nuniform vec4 uColor;\nuniform float uOpacity;\n/* uniform " + varying_precision + " vec2 uUVScale; */\nuniform vec4 uClipRect;\n\nvarying " + varying_precision + " vec2 vTexCoord;\n/* varying " + varying_precision + " vec2 vUVScale; */\n\nvoid main() {\n  vec4 baseColor = texture2D(uSampler,\n                             uClipRect.xy +\n                             vTexCoord * uClipRect.zw);\n                             //vTexCoord * uClipRect.zw * uUVScale);\n  baseColor *= uColor;\n\n  if(baseColor.rgb == vec3(1.0, 0.0, 1.0))\n    discard;\n\n  baseColor.a *= uOpacity;\n  gl_FragColor = baseColor;\n}";

ARERenderer = (function() {

  /*
   * @type [Number]
   */
  ARERenderer._nextID = 0;


  /*
   * GL Context
   * @type [Context]
   */

  ARERenderer._gl = null;


  /*
   * Physics pixel-per-meter ratio
   * @type [Number]
   */

  ARERenderer._PPM = 128;


  /*
   * Returns PPM ratio
   * @return [Number] ppm pixels-per-meter
   */

  ARERenderer.getPPM = function() {
    return ARERenderer._PPM;
  };


  /*
   * Returns MPP ratio
   * @return [Number] mpp meters-per-pixel
   */

  ARERenderer.getMPP = function() {
    return 1.0 / ARERenderer._PPM;
  };


  /*
   * Converts screen coords to world coords
   *
   * @param [B2Vec2] v vector in x, y form
   * @return [B2Vec2] ret v in world coords
   */

  ARERenderer.screenToWorld = function(v) {
    var ret;
    ret = new cp.v;
    ret.x = v.x / ARERenderer._PPM;
    ret.y = v.y / ARERenderer._PPM;
    return ret;
  };


  /*
   * Converts world coords to screen coords
   *
   * @param [B2Vec2] v vector in x, y form
   * @return [B2Vec2] ret v in screen coords
   */

  ARERenderer.worldToScreen = function(v) {
    var ret;
    ret = new cp.v;
    ret.x = v.x * ARERenderer._PPM;
    ret.y = v.y * ARERenderer._PPM;
    return ret;
  };


  /*
   * @property [Array<Object>] actors for rendering
   */

  ARERenderer.actors = [];


  /*
   * @property [Array<Object>] texture objects, with names and gl textures
   */

  ARERenderer.textures = [];


  /*
   * This is a tad ugly, but it works well. We need to be able to create
   * instance objects in the constructor, and provide one resulting object
   * to any class that asks for it, without an instance avaliable. @me is set
   * in the constructor, and an error is thrown if it is not already null.
   *
   * @property [ARERenderer] instance reference, enforced const in constructor
   */

  ARERenderer.me = null;


  /*
   * @property [Object] camPos Camera position, with x and y keys
   */

  ARERenderer.camPos = {
    x: 0,
    y: 0
  };


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

  ARERenderer.RENDERER_MODE_NULL = 0;

  ARERenderer.RENDERER_MODE_CANVAS = 1;

  ARERenderer.RENDERER_MODE_WGL = 2;


  /*
   * @type [Array<Number>]
   */

  ARERenderer.rendererModes = [0, 1, 2];


  /*
   * This denote the rendererMode that is wanted by the user
   * @type [Number]
   */

  ARERenderer.rendererMode = ARERenderer.RENDERER_MODE_WGL;


  /*
   * denotes the currently chosen internal Renderer, this value may be different
   * from the rendererMode, especially if webgl failed to load.
   * @type [Number]
   */

  ARERenderer.activeRendererMode = null;


  /*
   * Render Modes
   * This affects the method GL will use to render a WGL element
   * @enum
   */

  ARERenderer.RENDER_MODE_LINE_LOOP = 0;

  ARERenderer.RENDER_MODE_TRIANGLE_FAN = 1;

  ARERenderer.RENDER_MODE_TRIANGLE_STRIP = 2;


  /*
   * @type [Array<Number>]
   */

  ARERenderer.renderModes = [0, 1, 2];


  /*
   * Render Style
   * A render style determines how a canvas element is drawn, this can
   * also be used for WebGL elements as well, as they fine tune the drawing
   * process.
   * STROKE will work with all RENDER_MODE*.
   * FILL will work with RENDER_MODE_TRIANGLE_FAN and
   * RENDER_MODE_TRIANGLE_STRIP only.
   * FILL_AND_STROKE will work with all current render modes, however
   * RENDER_MODE_LINE_LOOP will only use STROKE
   * @enum
   */

  ARERenderer.RENDER_STYLE_STROKE = 1;

  ARERenderer.RENDER_STYLE_FILL = 2;

  ARERenderer.RENDER_STYLE_FILL_AND_STROKE = 3;


  /*
   * @type [Array<Number>]
   */

  ARERenderer.renderStyles = [0, 1, 2, 3];


  /*
   * Render Modes
   * This affects the method GL will use to render a WGL element
   * @enum
   */

  ARERenderer.MATERIAL_NONE = "none";

  ARERenderer.MATERIAL_FLAT = "flat";

  ARERenderer.MATERIAL_TEXTURE = "texture";


  /*
   * Signifies the current material; when this doesn't match, a material change
   * is made (different shader program)
   * @type [MATERIAL_*]
   */

  ARERenderer._currentMaterial = "none";


  /*
   * Should 0, 0 always be the top left position?
   */

  ARERenderer.force_pos0_0 = true;


  /*
   * Should the screen be cleared every frame, or should the engine handle
   * screen clearing. This option is only valid with the WGL renderer mode.
   * @type [Boolean]
   */

  ARERenderer.alwaysClearScreen = true;


  /*
   * Sets up the renderer, using either an existing canvas or creating a new one
   * If a canvasId is provided but the element is not a canvas, it is treated
   * as a parent. If it is a canvas, it is adopted as our canvas.
   *
   * Bails early if the GL context could not be created
   *
   * @param [String] id canvas id or parent selector
   * @param [Number] width canvas width
   * @param [Number] height canvas height
   * @return [Boolean] success
   */

  function ARERenderer(canvasId, _width, _height) {
    var _createCanvas;
    this._width = _width;
    this._height = _height;
    canvasId = param.optional(canvasId, "");
    this._defaultShader = null;
    this._canvas = null;
    this._ctx = null;
    this._pickRenderRequested = false;
    this._pickRenderBuff = null;
    this._pickRenderSelectionRect = null;
    this._pickRenderCB = null;
    this.initError = void 0;
    if (canvasId.length === 0) {
      canvasId = void 0;
    }
    if (ARERenderer.me !== null) {
      throw new Error("Only one instance of ARERenderer can be created!");
    } else {
      ARERenderer.me = this;
    }
    this._width = param.optional(this._width, 800);
    this._height = param.optional(this._height, 600);
    if (this._width <= 1 || this._height <= 1) {
      throw new Error("Canvas must be at least 2x2 in size");
    }
    _createCanvas = function(parent, id, w, h) {
      var _c;
      _c = ARERenderer.me._canvas = document.createElement("canvas");
      _c.width = w;
      _c.height = h;
      _c.id = "are_canvas";
      if (parent === "body") {
        return document.getElementsByTagName(parent)[0].appendChild(_c);
      } else {
        return document.getElementById(parent).appendChild(_c);
      }
    };
    if (canvasId === void 0 || canvasId === null) {
      _createCanvas("body", "are_canvas", this._width, this._height);
      ARELog.info("Creating canvas #are_canvas [" + this._width + "x" + this._height + "]");
      this._canvas = document.getElementById("are_canvas");
    } else {
      this._canvas = document.getElementById(canvasId);
      if (this._canvas === null) {
        _createCanvas("body", canvasId, this._width, this._height);
        ARELog.info("Creating canvas #" + canvasId + " [" + this._width + "x" + this._height + "]");
        this._canvas = document.getElementById(canvasId);
      } else {
        if (this._canvas.nodeName.toLowerCase() === "canvas") {
          ARELog.warn("Canvas exists, ignoring supplied dimensions");
          this._width = this._canvas.width;
          this._height = this._canvas.height;
          ARELog.info("Using canvas #" + canvasId + " [" + this._width + "x" + this._height + "]");
        } else {
          _createCanvas(canvasId, "are_canvas", this._width, this._height);
          ARELog.info("Creating canvas #are_canvas [" + this._width + "x" + this._height + "]");
        }
      }
    }
    if (this._canvas === null) {
      return ARELog.error("Canvas does not exist!");
    }
    switch (ARERenderer.rendererMode) {
      case ARERenderer.RENDERER_MODE_NULL:
        this.initializeNullContext();
        break;
      case ARERenderer.RENDERER_MODE_CANVAS:
        this.initializeCanvasContext();
        break;
      case ARERenderer.RENDERER_MODE_WGL:
        if (!this.initializeWGLContext(this._canvas)) {
          ARELog.info("Falling back on regular canvas renderer");
          this.initializeCanvasContext();
        }
        break;
      default:
        ARELog.error("Invalid Renderer " + ARERenderer.rendererMode);
    }
    ARELog.info("Using the " + ARERenderer.activeRendererMode + " renderer mode");
    this.setClearColor(0, 0, 0);
    this.switchMaterial(ARERenderer.MATERIAL_FLAT);
  }


  /*
   * Initializes a WebGL renderer context
   * @return [Boolean]
   */

  ARERenderer.prototype.initializeWGLContext = function(canvas) {
    var gl, options, shaders, solidShader, textureShader, wireShader;
    options = {
      preserveDrawingBuffer: ARERenderer.alwaysClearScreen,
      antialias: true,
      alpha: true,
      premultipliedAlpha: true,
      depth: true,
      stencil: false
    };
    gl = canvas.getContext("webgl", options);
    if (gl === null) {
      ARELog.warn("Continuing with experimental webgl support");
      gl = canvas.getContext("experimental-webgl");
    }
    if (gl === null) {
      return;
    }
    ARERenderer._gl = gl;
    ARELog.info("Created WebGL context");
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    ARELog.info("Renderer initialized");
    shaders = AREShader.shaders;
    wireShader = shaders.wire;
    solidShader = shaders.solid;
    textureShader = shaders.texture;
    this._defaultShader = new AREShader(solidShader.vertex, solidShader.fragment, gl, true);
    this._defaultShader.generateHandles();
    this._wireShader = new AREShader(wireShader.vertex, wireShader.fragment, gl, true);
    this._wireShader.generateHandles();
    this._texShader = new AREShader(textureShader.vertex, textureShader.fragment, gl, true);
    this._texShader.generateHandles();
    ARELog.info("Initialized shaders");
    ARELog.info("ARE WGL initialized");
    ARERenderer.activeRendererMode = ARERenderer.RENDERER_MODE_WGL;
    return true;
  };


  /*
   * Initializes a canvas renderer context
   * @return [Boolean]
   */

  ARERenderer.prototype.initializeCanvasContext = function() {
    this._ctx = this._canvas.getContext("2d");
    ARELog.info("ARE CTX initialized");
    ARERenderer.activeRendererMode = ARERenderer.RENDERER_MODE_CANVAS;
    return true;
  };


  /*
   * Initializes a null renderer context
   * @return [Boolean]
   */

  ARERenderer.prototype.initializeNullContext = function() {
    this._ctx = this._canvas.getContext("2d");
    ARELog.info("ARE Null initialized");
    ARERenderer.activeRendererMode = ARERenderer.RENDERER_MODE_NULL;
    return true;
  };


  /*
   * Returns instance (only one may exist, enforced in constructor)
   *
   * @return [ARERenderer] me
   */

  ARERenderer.getMe = function() {
    return ARERenderer.me;
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
   * Returns static gl object
   *
   * @return [Object] gl
   */

  ARERenderer.getGL = function() {
    return ARERenderer._gl;
  };


  /*
   * Returns canvas width
   *
   * @return [Number] width
   */

  ARERenderer.prototype.getWidth = function() {
    return this._width;
  };

  ARERenderer.getWidth = function() {
    return (this.me && this.me.getWidth()) || -1;
  };


  /*
   * Returns canvas height
   *
   * @return [Number] height
   */

  ARERenderer.prototype.getHeight = function() {
    return this._height;
  };

  ARERenderer.getHeight = function() {
    return (this.me && this.me.getHeight()) || -1;
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
    if (this._clearColor === void 0) {
      this._clearColor = new AREColor3;
    }
    if (colOrR instanceof AREColor3) {
      this._clearColor = colOrR;
    } else {
      this._clearColor.setR(colOrR || 0);
      this._clearColor.setG(g || 0);
      this._clearColor.setB(b || 0);
    }
    if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_WGL) {
      colOrR = this._clearColor.getR(true);
      g = this._clearColor.getG(true);
      b = this._clearColor.getB(true);
      if (ARERenderer._gl !== null && ARERenderer._gl !== void 0) {
        return ARERenderer._gl.clearColor(colOrR, g, b, 1.0);
      } else {
        return ARELog.error("Can't set clear color, ARERenderer._gl not valid!");
      }
    }
  };


  /*
   * Request a frame to be rendered for scene picking.
   *
   * @param [FrameBuffer] buffer
   * @param [Method] cb cb to call post-render
   */

  ARERenderer.prototype.requestPickingRenderWGL = function(buffer, cb) {
    param.required(buffer);
    param.required(cb);
    if (this._pickRenderRequested) {
      ARELog.warn("Pick render already requested! No request queue");
      return;
    }
    this._pickRenderBuff = buffer;
    this._pickRenderSelectionRect = null;
    this._pickRenderCB = cb;
    return this._pickRenderRequested = true;
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
    param.required(selectionRect);
    param.required(cb);
    if (this._pickRenderRequested) {
      ARELog.warn("Pick render already requested! No request queue");
      return;
    }
    this._pickRenderBuff = null;
    this._pickRenderSelectionRect = selectionRect;
    this._pickRenderCB = cb;
    return this._pickRenderRequested = true;
  };


  /*
   * Draws a using WebGL frame
   * @return [Void]
   */

  ARERenderer.prototype.wglRender = function() {
    var a, gl, _i, _id, _idSector, _len, _ref, _savedColor, _savedOpacity;
    gl = ARERenderer._gl;
    if (gl === void 0 || gl === null) {
      return;
    }
    if (this._pickRenderRequested) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._pickRenderBuff);
    }
    if (ARERenderer.alwaysClearScreen) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    _ref = ARERenderer.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (this._pickRenderRequested) {
        _savedColor = a.getColor();
        _savedOpacity = a.getOpacity();
        _id = a.getId() - (Math.floor(a.getId() / 255) * 255);
        _idSector = Math.floor(a.getId() / 255);
        this.switchMaterial(ARERenderer.MATERIAL_FLAT);
        a.setColor(_id, _idSector, 248);
        a.setOpacity(1.0);
        a.wglDraw(gl);
        a.setColor(_savedColor);
        a.setOpacity(_savedOpacity);
      } else {
        a = a.updateAttachment();
        if (a.getMaterial() !== ARERenderer._currentMaterial) {
          this.switchMaterial(a.getMaterial());
        }
        a.wglDraw(gl);
      }
    }
    if (this._pickRenderRequested) {
      this._pickRenderCB();
      this._pickRenderRequested = false;
      this._pickRenderBuff = null;
      this._pickRenderCB = null;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return this.render();
    }
  };


  /*
   * Canavs render
   * @return [Void]
   */

  ARERenderer.prototype.cvRender = function() {
    var a, ctx, material, r, _i, _id, _idSector, _len, _ref, _savedColor, _savedOpacity;
    ctx = this._ctx;
    if (ctx === void 0 || ctx === null) {
      return;
    }
    if (this._clearColor) {
      ctx.fillStyle = "rgb" + this._clearColor;
      ctx.fillRect(0, 0, this._width, this._height);
    } else {
      ctx.clearRect(0, 0, this._width, this._height);
    }
    ctx.save();
    if (!ARERenderer.force_pos0_0) {
      ctx.translate(0, this._height);
      ctx.scale(1, -1);
    }
    _ref = ARERenderer.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      ctx.save();
      if (this._pickRenderRequested) {
        _savedColor = a.getColor();
        _savedOpacity = a.getOpacity();
        _id = a.getId() - (Math.floor(a.getId() / 255) * 255);
        _idSector = Math.floor(a.getId() / 255);
        this.switchMaterial(ARERenderer.MATERIAL_FLAT);
        a.setColor(_id, _idSector, 248);
        a.setOpacity(1.0);
        a.cvDraw(ctx);
        a.setColor(_savedColor);
        a.setOpacity(_savedOpacity);
      } else {
        a = a.updateAttachment();
        if ((material = a.getMaterial()) !== ARERenderer._currentMaterial) {
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
      return this.render();
    }
  };


  /*
   * "No render" function
   * @return [Void]
   */

  ARERenderer.prototype.nullRender = function() {
    var a, ctx, _i, _len, _ref, _results;
    ctx = this._ctx;
    if (ctx === void 0 || ctx === null) {
      return;
    }
    if (this._clearColor) {
      ctx.fillStyle = "rgb" + this._clearColor;
      ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    } else {
      ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
    _ref = ARERenderer.actors;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      a = a.updateAttachment();
      _results.push(a.nullDraw(ctx));
    }
    return _results;
  };


  /*
   * main render function
   * @return [Void]
   */

  ARERenderer.prototype.render = function() {
    switch (ARERenderer.activeRendererMode) {
      case ARERenderer.RENDERER_MODE_NULL:
        return this.nullRender();
      case ARERenderer.RENDERER_MODE_CANVAS:
        return this.cvRender();
      case ARERenderer.RENDERER_MODE_WGL:
        return this.wglRender();
    }
  };


  /*
   * Returns the currently active renderer mode
   * @return [Number] rendererMode
   */

  ARERenderer.prototype.getActiveRendererMode = function() {
    return ARERenderer.activeRendererMode;
  };


  /*
   * Is the null renderer active?
   * @return [Boolean] is_active
   */

  ARERenderer.prototype.isNullRendererActive = function() {
    return this.getActiveRendererMode() === ARERenderer.RENDERER_MODE_NULL;
  };


  /*
   * Is the canvas renderer active?
   * @return [Boolean] is_active
   */

  ARERenderer.prototype.isCanvasRendererActive = function() {
    return this.getActiveRendererMode() === ARERenderer.RENDERER_MODE_CANVAS;
  };


  /*
   * Is the WebGL renderer active?
   * @return [Boolean] is_active
   */

  ARERenderer.prototype.isWGLRendererActive = function() {
    return this.getActiveRendererMode() === ARERenderer.RENDERER_MODE_WGL;
  };


  /*
   * Returns a unique id, used by actors
   * @return [Number] id unique id
   */

  ARERenderer.getNextId = function() {
    return ARERenderer._nextID++;
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

  ARERenderer.addActor = function(actor, layer) {
    var layerIndex;
    param.required(actor);
    layer = param.optional(layer, actor.layer);
    if (actor.layer !== layer) {
      actor.layer = layer;
    }
    layerIndex = _.sortedIndex(ARERenderer.actors, actor, "layer");
    ARERenderer.actors.splice(layerIndex, 0, actor);
    return actor;
  };


  /*
   * Remove an actor from our render list by either actor, or id
   *
   * @param [ARERawActor,Number] actor actor, or id of actor to remove
   * @param [Boolean] nodestroy optional, defaults to false
   * @return [Boolean] success
   */

  ARERenderer.removeActor = function(oactor, nodestroy) {
    var a, actor, i, _i, _len, _ref;
    param.required(oactor);
    nodestroy = param.optional(nodestroy, false);
    actor = oactor;
    if (actor instanceof ARERawActor) {
      actor = actor.getId();
    }
    _ref = ARERenderer.actors;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      a = _ref[i];
      if (a.getId() === actor) {
        ARERenderer.actors.splice(i, 1);
        if (!nodestroy) {
          oactor.destroy();
        }
        return true;
      }
    }
    return false;
  };


  /*
   * Switch material (shader program)
   *
   * @param [String] material
   */

  ARERenderer.prototype.switchMaterial = function(material) {
    var gl, handles, ortho;
    param.required(material);
    if (material === ARERenderer._currentMaterial) {
      return false;
    }
    if (this.isWGLRendererActive()) {
      ortho = Matrix4.makeOrtho(0, this._width, 0, this._height, -10, 10).flatten();
      ortho[15] = 1.0;
      gl = ARERenderer._gl;
      switch (material) {
        case ARERenderer.MATERIAL_FLAT:
          gl.useProgram(this._defaultShader.getProgram());
          handles = this._defaultShader.getHandles();
          gl.uniformMatrix4fv(handles.uProjection, false, ortho);
          gl.enableVertexAttribArray(handles.aPosition);
          break;
        case ARERenderer.MATERIAL_TEXTURE:
          gl.useProgram(this._texShader.getProgram());
          handles = this._texShader.getHandles();
          gl.uniformMatrix4fv(handles.uProjection, false, ortho);
          gl.enableVertexAttribArray(handles.aPosition);
          gl.enableVertexAttribArray(handles.aTexCoord);
          break;
        default:
          throw new Error("Unknown material " + material);
      }
    }
    ARERenderer._currentMaterial = material;
    return ARELog.info("ARERenderer Switched material " + ARERenderer._currentMaterial);
  };


  /*
   * Checks if we have a texture loaded
   *
   * @param [String] name texture name to check for
   */

  ARERenderer.hasTexture = function(name) {
    var t, _i, _len, _ref;
    _ref = ARERenderer.textures;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      t = _ref[_i];
      if (t.name === name) {
        return true;
      }
    }
    return false;
  };


  /*
   * Fetches a texture by name
   *
   * @param [String] name name of texture to fetch
   * @param [Object] texture
   */

  ARERenderer.getTexture = function(name) {
    var t, _i, _len, _ref;
    param.required(name);
    _ref = ARERenderer.textures;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      t = _ref[_i];
      if (t.name === name) {
        return t;
      }
    }
    return null;
  };


  /*
   * Fetches texture size
   *
   * @param [String] name name of texture
   * @param [Object] size
   */

  ARERenderer.getTextureSize = function(name) {
    var t;
    param.required(name);
    if (t = this.getTexture(name)) {
      return {
        w: t.width,
        h: t.height
      };
    }
    return null;
  };


  /*
   * Adds a texture to our internal collection
   *
   * @param [Object] texture texture object with name and gl texture
   */

  ARERenderer.addTexture = function(tex) {
    param.required(tex.name);
    param.required(tex.texture);
    return ARERenderer.textures.push(tex);
  };

  return ARERenderer;

})();

AREPhysics = (function() {
  AREPhysics.velIterations = 6;

  AREPhysics.posIterations = 2;

  AREPhysics.frameTime = 1.0 / 60.0;

  AREPhysics._gravity = new cp.v(0, 1);

  AREPhysics._stepIntervalId = null;

  AREPhysics._world = null;

  AREPhysics._densityRatio = 1 / 10000;

  AREPhysics.bodyCount = 0;

  AREPhysics.benchmark = false;

  function AREPhysics() {
    throw new Error("Physics constructor called");
  }

  AREPhysics.startStepping = function() {
    var avgStep, stepCount;
    if (this._stepIntervalId !== null) {
      return;
    }
    this._world = new cp.Space;
    this._world.gravity = this._gravity;
    this._world.iterations = 60;
    this._world.collisionSlop = 0.5;
    this._world.sleepTimeThreshold = 0.5;
    ARELog.info("Starting world update loop");
    avgStep = 0;
    stepCount = 0;
    return this._stepIntervalId = setInterval((function(_this) {
      return function() {
        var start;
        start = Date.now();
        _this._world.step(_this.frameTime);
        if (_this.benchmark) {
          stepCount++;
          avgStep = avgStep + ((Date.now() - start) / stepCount);
          if (stepCount % 500 === 0) {
            return console.log("Physics step time: " + (avgStep.toFixed(2)) + "ms");
          }
        }
      };
    })(this), this.frameTime);
  };

  AREPhysics.stopStepping = function() {
    if (this._stepIntervalId === null) {
      return;
    }
    ARELog.info("Halting world update loop");
    clearInterval(this._stepIntervalId);
    this._stepIntervalId = null;
    return this._world = null;
  };

  AREPhysics.getWorld = function() {
    return this._world;
  };

  AREPhysics.getDensityRatio = function() {
    return this._densityRatio;
  };

  AREPhysics.getGravity = function() {
    return this._gravity;
  };

  AREPhysics.setGravity = function(v) {
    if (!(v instanceof cp.Vect)) {
      throw new Error("You need to set space gravity using cp.v!");
    }
    this._gravity = v;
    if (this._world !== null && this._world !== void 0) {
      return this._world.gravity = v;
    }
  };

  return AREPhysics;

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
    dryRun = param.optional(dryRun, false);
    this.options = param.required(options);
    this._duration = param.required(options.duration);
    param.required(options.endVal);
    this._property = param.required(options.property);
    options.controlPoints = param.optional(options.controlPoints, []);
    this._fps = param.optional(options.fps, 30);
    if (dryRun) {
      param.optional(this.actor);
      param.required(options.startVal);
    } else {
      param.required(this.actor);
    }
    this._animated = false;
    this.bezOpt = {};
    if (options.controlPoints.length > 0) {
      this.bezOpt.degree = options.controlPoints.length;
      if (this.bezOpt.degree > 0) {
        param.required(options.controlPoints[0].x);
        param.required(options.controlPoints[0].y);
        if (this.bezOpt.degree === 2) {
          param.required(options.controlPoints[1].x);
          param.required(options.controlPoints[1].y);
        }
      }
      this.bezOpt.ctrl = options.controlPoints;
    } else {
      this.bezOpt.degree = 0;
    }
    this.bezOpt.endPos = param.required(options.endVal);
    this.tIncr = 1 / (this._duration * (this._fps / 1000));
    if (dryRun) {
      this.bezOpt.startPos = options.startVal;
    } else {
      if (this._property === "rotation") {
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
    param.required(t);
    apply = param.optional(apply, true);
    if (t > 1 || t < 0) {
      throw new Error("t out of bounds! " + t);
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
      if (this.options.cbStep !== void 0) {
        this.options.cbStep(val);
      }
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
    var pos, _b, _g, _r;
    if (this._property === "rotation") {
      this.actor.setRotation(val);
    }
    if (this._property[0] === "position") {
      if (this._property[1] === "x") {
        pos = new cp.v(val, this.actor.getPosition().y);
        this.actor.setPosition(pos);
      } else if (this._property[1] === "y") {
        pos = new cp.v(this.actor.getPosition().x, val);
        this.actor.setPosition(pos);
      }
    }
    if (this._property[0] === "color") {
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
    if (this.options.cbStart !== void 0) {
      this.options.cbStart();
    }
    t = -this.tIncr;
    return this._intervalID = setInterval((function(_this) {
      return function() {
        t += _this.tIncr;
        if (t > 1) {
          clearInterval(_this._intervalID);
          if (_this.options.cbEnd !== void 0) {
            return _this.options.cbEnd();
          }
        } else {
          _this._update(t);
          if (_this.options.cbStep !== void 0) {
            return _this.options.cbStep();
          }
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
    this.options = options;
    param.required(this.actor);
    param.required(this.options);
    param.required(this.options.delays);
    param.required(this.options.deltas);
    if (this.options.delays.length !== this.options.deltas.length) {
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
    param.required(deltaSet);
    param.required(delay);
    udata = param.optional(udata, null);
    return setTimeout(((function(_this) {
      return function() {
        _this._applyDeltas(deltaSet, udata);
        if (last) {
          if (_this.options.cbEnd !== void 0) {
            return _this.options.cbEnd();
          }
        }
      };
    })(this)), delay);
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
    param.required(deltaSet);
    if (this.options.cbStep !== void 0) {
      this.options.cbStep(udata);
    }
    finalVerts = this.actor.getVertices();
    if (deltaSet.join("_").indexOf("...") !== -1) {
      repeat = true;
    } else {
      repeat = false;
    }
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
        if (val === void 0) {
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
    if (this.options.cbStart !== void 0) {
      this.options.cbStart();
    }
    _results = [];
    for (i = _i = 0, _ref = this.options.deltas.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      udata = null;
      if (this.options.udata !== void 0) {
        if (this.options.udata instanceof Array) {
          if (i < this.options.udata.length) {
            udata = this.options.udata[i];
          }
        } else {
          udata = this.options.udata;
        }
      }
      if (i === (this.options.deltas.length - 1)) {
        last = true;
      } else {
        last = false;
      }
      _results.push(this._setTimeout(this.options.deltas[i], this.options.delays[i], udata, last));
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
    this.options = options;
    param.required(this.actor);
    param.required(this.options.mass);
    param.required(this.options.friction);
    param.required(this.options.elasticity);
    param.required(this.options.timeout);
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
    if (this.options.cbStart !== void 0) {
      this.options.cbStart();
    }
    return setTimeout((function(_this) {
      return function() {
        _this.actor.createPhysicsBody(_this.options.mass, _this.options.friction, _this.options.elasticity);
        if (_this.options.cbEnd !== void 0) {
          return _this.options.cbEnd();
        }
      };
    })(this), this.options.timeout);
  };

  return AREPsyxAnimation;

})();

AREActorInterface = (function() {
  function AREActorInterface() {}


  /*
   * Fails with null
   * @private
   */

  AREActorInterface.prototype._findActor = function(id) {
    var a, _i, _len, _ref;
    param.required(id);
    _ref = ARERenderer.actors;
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
    return new ARERawActor(JSON.parse(verts)).getId();
  };


  /*
   * Create a variable sided actor of the specified radius
   *
   * @param [Number] radius
   * @param [Number] segments
   * @return [Number] id created actor handle
   */

  AREActorInterface.prototype.createPolygonActor = function(radius, segments) {
    param.required(radius);
    if (typeof radius === "string") {
      return this.createRawActor(radius);
    } else {
      param.required(segments);
      return new AREPolygonActor(radius, segments).getId();
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
    param.required(width);
    param.required(height);
    return new ARERectangleActor(width, height).getId();
  };


  /*
   * Creates a circle actor with the specified radius
   *
   * @param [Number] radius
   * @return [Number] id created actor handle
   */

  AREActorInterface.prototype.createCircleActor = function(radius) {
    param.required(radius);
    return new ARECircleActor(radius).getId();
  };


  /*
   * Fetch the width of the rectangle actor with the specified ID
   *
   * @param [Number] id
   * @return [Number] width
   */

  AREActorInterface.prototype.getRectangleActorWidth = function(id) {
    var a, _i, _len, _ref;
    _ref = ARERenderer.actors;
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
    _ref = ARERenderer.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof ARERectangleActor) {
        return a.getHeight();
      }
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
    _ref = ARERenderer.actors;
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
    _ref = ARERenderer.actors;
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
   * Fetch the radius of the circle actor with the specified ID
   *
   * @param [Number] id
   * @return [Number] radius
   */

  AREActorInterface.prototype.getCircleActorRadius = function(id) {
    var a, _i, _len, _ref;
    _ref = ARERenderer.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof AREPolygonActor) {
        return a.getRadius();
      }
    }
    return null;
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
    _ref = ARERenderer.actors;
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
    param.required(id);
    param.required(texture);
    param.required(w);
    param.required(h);
    x = param.optional(x, 0);
    y = param.optional(y, 0);
    angle = param.optional(angle, 0);
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
    param.required(id);
    param.required(layer);
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
    param.required(id);
    param.required(layer);
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
    param.required(id);
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
    param.required(visible);
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
    param.required(verts);
    param.required(id);
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
    param.required(id);
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
    var a, i, _i, _len, _ref;
    param.required(id);
    _ref = ARERenderer.actors;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      a = _ref[i];
      if (a.getId() === id) {
        a.destroyPhysicsBody();
        ARERenderer.actors.splice(i, 1);
        a = void 0;
        return true;
      }
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
    param.required(verts);
    param.required(id);
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
    mode = param.required(mode, ARERenderer.renderModes);
    param.required(id);
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
    param.required(opacity);
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      a.setOpacity(opacity);
      return true;
    }
    return false;
  };


  /*
   * Get actor opacity using handle, fails with null
   *
   * @param [Number] id
   * @return [Number] opacity
   */

  AREActorInterface.prototype.getActorOpacity = function(id) {
    var a;
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      return a.getOpacity();
    }
    return null;
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
    param.required(visible);
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      a.setVisible(visible);
      return true;
    }
    return false;
  };


  /*
   * Get actor visible using handle, fails with null
   *
   * @param [Number] id
   * @return [Boolean] visible
   */

  AREActorInterface.prototype.getActorVisible = function(id) {
    var a;
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      return a.getVisible();
    }
    return null;
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
    param.required(x);
    param.required(y);
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      a.setPosition(new cp.v(x, y));
      return true;
    }
    return false;
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
    param.required(id);
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
   * Set actor rotation using handle, fails with false
   *
   * @param [Number] angle in degrees or radians
   * @param [Number] id
   * @param [Boolean] radians defaults to false
   * @return [Boolean] success
   */

  AREActorInterface.prototype.setActorRotation = function(angle, id, radians) {
    var a;
    param.required(angle);
    param.required(id);
    radians = param.optional(radians, false);
    if ((a = this._findActor(id)) !== null) {
      a.setRotation(angle, radians);
      return true;
    }
    return false;
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
    param.required(id);
    radians = param.optional(radians, false);
    if ((a = this._findActor(id)) !== null) {
      return a.getRotation(radians);
    }
    return 0.000001;
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
    param.required(r);
    param.required(g);
    param.required(b);
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      a.setColor(new AREColor3(r, g, b));
      return true;
    }
    return false;
  };


  /*
   * Returns actor color as a JSON triple, in 0-255 range
   * Uses id, fails with null
   *
   * @param [Number] id
   * @return [String] col
   */

  AREActorInterface.prototype.getActorColor = function(id) {
    var a;
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      return JSON.stringify({
        r: a.getColor().getR(),
        g: a.getColor().getG(),
        b: a.getColor().getB()
      });
    }
    return null;
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
    param.required(id);
    param.required(mass);
    param.required(friction);
    param.required(elasticity);
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
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      a.destroyPhysicsBody();
      true;
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
    param.required(name);
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      a.setTexture(name);
      true;
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
    param.required(x);
    param.required(id);
    y = param.optional(y, 1);
    if ((a = this._findActor(id)) !== null) {
      a.setTextureRepeat(x, y);
      true;
    }
    return false;
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
  function AREEngineInterface() {}


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
    param.required(ad);
    param.required(width);
    param.required(height);
    log = param.optional(log, 4);
    id = param.optional(id, "");
    ARERenderer.actors = [];
    ARERenderer.textures = [];
    ARERenderer._gl = null;
    ARERenderer.me = null;
    ARERenderer._currentMaterial = "none";
    ARERenderer.camPos = {
      x: 0,
      y: 0
    };

    /*
     * Should WGL textures be flipped by their Y axis?
     * NOTE. This does not affect existing textures.
     */
    this.wglFlipTextureY = false;
    AREPhysics.stopStepping();
    return new AREEngine(width, height, (function(_this) {
      return function(are) {
        _this._engine = are;
        are.startRendering();
        return ad(are);
      };
    })(this), log, id);
  };


  /*
   * Set global render mode
   *   @see ARERenderer.RENDERER_MODE_*
   * This is a special method only we implement; as such, any libraries
   * interfacing with us should check for the existence of the method before
   * calling it!
   */

  AREEngineInterface.prototype.getRendererMode = function() {
    return ARERenderer.rendererMode;
  };

  AREEngineInterface.prototype.setRendererMode = function(mode) {
    return ARERenderer.rendererMode = mode;
  };


  /*
   * Set engine clear color
   *
   * @param [Number] r
   * @param [Number] g
   * @param [Number] b
   */

  AREEngineInterface.prototype.setClearColor = function(r, g, b) {
    param.required(r);
    param.required(g);
    param.required(b);
    if (this._engine === void 0) {

    } else {
      return ARERenderer.me.setClearColor(r, g, b);
    }
  };


  /*
   * Get engine clear color as (r,g,b) JSON, fails with null
   *
   * @return [String] clearcol
   */

  AREEngineInterface.prototype.getClearColor = function() {
    var col;
    if (this._engine === void 0) {
      return null;
    }
    col = ARERenderer.me.getClearColor();
    return JSON.stringify({
      r: col.getR(),
      g: col.getG(),
      b: col.getB()
    });
  };


  /*
   * Set log level
   *
   * @param [Number] level 0-4
   */

  AREEngineInterface.prototype.setLogLevel = function(level) {
    param.required(level, [0, 1, 2, 3, 4]);
    return ARELog.level = level;
  };


  /*
   * Set camera center position. Leaving out a component leaves it unchanged
   *
   * @param [Number] x
   * @param [Number] y
   */

  AREEngineInterface.prototype.setCameraPosition = function(x, y) {
    ARERenderer.camPos.x = param.optional(x, ARERenderer.camPos.x);
    return ARERenderer.camPos.y = param.optional(y, ARERenderer.camPos.y);
  };


  /*
   * Fetch camera position. Returns a JSON object with x,y keys
   *
   * @return [Object]
   */

  AREEngineInterface.prototype.getCameraPosition = function() {
    return JSON.stringify(ARERenderer.camPos);
  };


  /*
   * Return our engine's width
   *
   * @return [Number] width
   */

  AREEngineInterface.prototype.getWidth = function() {
    if (this._engine === null || this._engine === void 0) {
      return -1;
    } else {
      return this._engine.getWidth();
    }
  };


  /*
   * Return our engine's height
   *
   * @return [Number] height
   */

  AREEngineInterface.prototype.getHeight = function() {
    if (this._engine === null || this._engine === void 0) {
      return -1;
    } else {
      return this._engine.getHeight();
    }
  };


  /*
   * Enable/disable benchmarking
   *
   * @param [Boolean] benchmark
   */

  AREEngineInterface.prototype.setBenchmark = function(status) {
    AREPhysics.benchmark = status;
    return this._engine.benchmark = status;
  };


  /*
   * Load a package.json manifest, assume texture paths are relative to our
   * own
   *
   * @param [String] json package.json source
   * @param [Method] cb callback to call once the load completes (textures)
   */

  AREEngineInterface.prototype.loadManifest = function(json, cb) {
    var count, flipTexture, loadTexture, manifest, tex, _i, _len, _results;
    param.required(json);
    manifest = JSON.parse(json);
    if (manifest.textures !== void 0) {
      manifest = manifest.textures;
    }
    if (_.isEmpty(manifest)) {
      return cb();
    }
    count = 0;
    flipTexture = this.wglFlipTextureY;
    loadTexture = function(name, path) {
      var gl, img, tex;
      ARELog.info("Loading texture: " + name + ", " + path);
      img = new Image();
      img.crossOrigin = "anonymous";
      gl = ARERenderer._gl;
      tex = null;
      if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_WGL) {
        ARELog.info("Loading Gl Texture");
        tex = gl.createTexture();
        img.onload = function() {
          var canvas, ctx, h, scaleX, scaleY, w;
          scaleX = 1;
          scaleY = 1;
          w = (img.width & (img.width - 1)) !== 0;
          h = (img.height & (img.height - 1)) !== 0;
          if (w || h) {
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
          ARERenderer.addTexture({
            name: name,
            texture: tex,
            width: img.width,
            height: img.height,
            scaleX: scaleX,
            scaleY: scaleY
          });
          count++;
          if (count === manifest.length) {
            return cb();
          }
        };
      } else {
        ARELog.info("Loading Canvas Image");
        img.onload = function() {
          ARERenderer.addTexture({
            name: name,
            texture: img,
            width: img.width,
            height: img.height
          });
          count++;
          if (count === manifest.length) {
            return cb();
          }
        };
      }
      return img.src = path;
    };
    _results = [];
    for (_i = 0, _len = manifest.length; _i < _len; _i++) {
      tex = manifest[_i];
      if (tex.compression !== void 0 && tex.compression !== "none") {
        console.error(tex.compression);
        throw new Error("Only un-compressed textures are supported!");
      }
      if (tex.type !== void 0 && tex.type !== "image") {
        console.error(tex.type);
        throw new Error("Only image textures are supported!");
      }
      _results.push(loadTexture(tex.name, tex.path));
    }
    return _results;
  };


  /*
   * Get renderer texture size by name
   *
   * @param [String] name
   * @param [Object] size
   */

  AREEngineInterface.prototype.getTextureSize = function(name) {
    return ARERenderer.getTextureSize(name);
  };


  /*
   * TODO: Implement
   *
   * Set remind me later button region
   *
   * @param [Number] x
   * @param [Number] y
   * @param [Number] w
   * @param [Number] h
   */

  AREEngineInterface.prototype.setRemindMeButton = function(x, y, w, h) {};

  return AREEngineInterface;

})();

AREAnimationInterface = (function() {
  function AREAnimationInterface() {}

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

  AREAnimationInterface.prototype.canAnimate = function(property) {
    if (AREAnimationInterface._animationMap[property] === void 0) {
      return false;
    }
    return true;
  };

  AREAnimationInterface.prototype.getAnimationName = function(property) {
    var type;
    if (AREAnimationInterface._animationMap[property] === void 0) {
      return false;
    } else {
      type = AREAnimationInterface._animationMap[property];
      if (type === AREBezAnimation) {
        return "bezier";
      } else if (type === AREPsyxAnimation) {
        return "psyx";
      } else if (type === AREVertAnimation) {
        return "vert";
      }
    }
  };

  AREAnimationInterface.prototype.animate = function(actorID, property, options) {
    var a, actor, name, _i, _len, _ref, _spawnAnim;
    param.required(actorID);
    property = JSON.parse(param.required(property));
    options = JSON.parse(param.required(options));
    options.start = param.optional(options.start, 0);
    actor = null;
    _ref = ARERenderer.actors;
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
    var ret;
    options = JSON.parse(param.required(options));
    param.required(options.startVal);
    param.required(options.endVal);
    param.required(options.duration);
    options.controlPoints = param.required(options.controlPoints, []);
    options.fps = param.required(options.fps, 30);
    ret = new AREBezAnimation(null, options, true).preCalculate();
    return JSON.stringify(ret);
  };

  return AREAnimationInterface;

})();

AREInterface = (function() {
  function AREInterface() {
    this._Actors = new AREActorInterface();
    this._Engine = new AREEngineInterface();
    this._Animations = new AREAnimationInterface();
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

  return AREInterface;

})();

AREEngine = (function() {

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
  function AREEngine(width, height, cb, logLevel, canvas) {
    param.required(width);
    param.required(height);
    param.required(cb);
    ARELog.level = param.optional(logLevel, 4);
    canvas = param.optional(canvas, "");
    this._renderIntervalId = null;
    this.benchmark = false;
    this.setFPS(60);
    if (window._ === null || window._ === void 0) {
      return ARELog.error("Underscore.js is not present!");
    }
    if (window.cp === void 0 || window.cp === null) {
      return ARELog.error("Chipmunk-js is not present!");
    }
    this._renderer = new ARERenderer(canvas, width, height);
    this.startRendering();
    cb(this);
  }


  /*
   * Set framerate as an FPS figure
   * @param [Number] fps
   * @return [self]
   */

  AREEngine.prototype.setFPS = function(fps) {
    this._framerate = 1.0 / fps;
    return this;
  };


  /*
   * Start render loop if it isn't already running
   * @return [Void]
   */

  AREEngine.prototype.startRendering = function() {
    var avgStep, stepCount;
    if (this._renderIntervalId !== null) {
      return;
    }
    ARELog.info("Starting render loop");
    avgStep = 0;
    stepCount = 0;
    return this._renderIntervalId = setInterval((function(_this) {
      return function() {
        var fps, start;
        start = Date.now();
        _this._renderer.render();
        if (_this.benchmark) {
          stepCount++;
          avgStep = avgStep + ((Date.now() - start) / stepCount);
          if (stepCount % 500 === 0) {
            fps = (1000 / avgStep).toFixed(2);
            return console.log("Render step time: " + (avgStep.toFixed(2)) + "ms (" + fps + " FPS)");
          }
        }
      };
    })(this), this._framerate);
  };


  /*
   * Halt render loop if it's running
   * @return [Void]
   */

  AREEngine.prototype.stopRendering = function() {
    if (this._renderIntervalId === null) {
      return;
    }
    ARELog.info("Halting render loop");
    clearInterval(this._renderIntervalId);
    return this._renderIntervalId = null;
  };


  /*
   * Set renderer clear color in integer RGB form (passes through to renderer)
   *
   * @param [Number] r
   * @param [Number] g
   * @param [Number] b
   * @return [self]
   */

  AREEngine.prototype.setClearColor = function(r, g, b) {
    r = param.optional(r, 0);
    g = param.optional(g, 0);
    b = param.optional(b, 0);
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

  AREEngine.prototype.getClearColor = function() {
    if (this._renderer instanceof ARERenderer) {
      return this._renderer.getClearColor();
    } else {
      return null;
    }
  };


  /*
   * Return our internal renderer width, returns -1 if we don't have a renderer
   *
   * @return [Number] width
   */

  AREEngine.prototype.getWidth = function() {
    if (this._renderer === null || this._renderer === void 0) {
      return -1;
    } else {
      return this._renderer.getWidth();
    }
  };


  /*
   * Return our internal renderer height
   *
   * @return [Number] height
   */

  AREEngine.prototype.getHeight = function() {
    if (this._renderer === null || this._renderer === void 0) {
      return -1;
    } else {
      return this._renderer.getHeight();
    }
  };


  /*
   * Request a pick render, passed straight to the renderer
   *
   * @param [FrameBuffer] buffer
   * @param [Method] cb cb to call post-render
   */

  AREEngine.prototype.requestPickingRenderWGL = function(buffer, cb) {
    if (this._renderer === null || this._renderer === void 0) {
      return ARELog.warn("Can't request a pick render, renderer not instantiated!");
    } else {
      if (this._renderer.isWGLRendererActive()) {
        return this._renderer.requestPickingRenderWGL(buffer, cb);
      } else {
        return ARELog.warn("Can't request a WGL pick render, " + "not using WGL renderer");
      }
    }
  };


  /*
   * Request a pick render, passed straight to the renderer
   *
   * -param [FrameBuffer] buffer
   * @param [Method] cb cb to call post-render
   */

  AREEngine.prototype.requestPickingRenderCanvas = function(selectionRect, cb) {
    if (this._renderer === null || this._renderer === void 0) {
      return ARELog.warn("Can't request a pick render, renderer not instantiated!");
    } else {
      if (this._renderer.isCanvasRendererActive()) {
        return this._renderer.requestPickingRenderCanvas(selectionRect, cb);
      } else {
        return ARELog.warn("Can't request a canvas pick render, " + "not using canvas renderer");
      }
    }
  };


  /*
   * Get our renderer's gl object
   *
   * @return [Object] gl
   */

  AREEngine.prototype.getGL = function() {
    if (ARERenderer._gl === null) {
      ARELog.warn("Render not instantiated!");
    }
    return ARERenderer._gl;
  };


  /*
   * Return the current active renderer mode
   *
   * @return [Number]
   */

  AREEngine.prototype.getActiveRendererMode = function() {
    return ARERenderer.activeRendererMode;
  };

  return AREEngine;

})();

window.AdefyGLI = window.AdefyRE = new AREInterface;

AREVersion = {
  MAJOR: 1,
  MINOR: 0,
  PATCH: 3,
  BUILD: null,
  STRING: "1.0.3"
};

//# sourceMappingURL=are.js.map
