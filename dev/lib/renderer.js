var ARERenderer;

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
    this._width = param.required(opts.width);
    this._height = param.required(opts.height);
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
    this._currentMaterial = "none";
    this._activeRendererMode = null;
    this._cameraPosition = {
      x: 0,
      y: 0
    };
    this._pickRenderRequested = false;
    this._pickRenderBuff = null;
    this._pickRenderSelectionRect = null;
    this._pickRenderCB = null;
    this._clearColor = new AREColor3(255, 255, 255);
    _createCanvas = (function(_this) {
      return function(parent, id) {
        _this._canvas = document.createElement("canvas");
        _this._canvas.width = _this._width;
        _this._canvas.height = _this._height;
        _this._canvas.id = id;
        document.querySelector(parent).appendChild(_this._canvas);
        return ARELog.info("Creating canvas #" + id + " [" + _this._width + "x" + _this._height + "]");
      };
    })(this);
    if (!canvasId) {
      _createCanvas("body", "are_canvas");
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
    this.setClearColor(0, 0, 0);
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


  /*
   * Called once per frame, we perform various internal updates if needed
   */

  ARERenderer.prototype.update = function() {
    var VBOData, absBaseIndex, absI, actor, baseIndex, compiledVertices, currentOffset, i, indices, totalVertCount, vData, _i, _j, _k, _len, _len1, _ref, _ref1, _ref2;
    if (this._pendingVBORefresh && this.isWGLRendererActive()) {
      currentOffset = 0;
      indices = [];
      compiledVertices = [];
      totalVertCount = 0;
      _ref = this._actors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        actor = _ref[_i];
        if (actor.hasOwnIndiceBuffer()) {
          totalVertCount += actor.getRawVertexData().length;
        }
      }
      VBOData = new Float32Array(totalVertCount);
      _ref1 = this._actors;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        actor = _ref1[_j];
        if (actor.hasOwnIndiceBuffer()) {
          vData = actor.getRawVertexData();
          indices = [];
          for (i = _k = 0, _ref2 = vData.length / 4; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
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

  ARERenderer.prototype.setCameraPosition = function(_cameraPosition) {
    this._cameraPosition = _cameraPosition;
  };

  ARERenderer.prototype.getCameraPosition = function() {
    return this._cameraPosition;
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
      if (this._gl) {
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
    param.required(buffer);
    param.required(cb);
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
    param.required(selectionRect);
    param.required(cb);
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
    var a, a_id, actorCount, bottomEdge, gl, leftEdge, rightEdge, topEdge, _id, _idSector, _savedColor, _savedOpacity;
    gl = this._gl;
    if (this._pickRenderRequested) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._pickRenderBuff);
    }
    if (this._alwaysClearScreen) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    actorCount = this._actors.length;
    if (this._pickRenderRequested) {
      while (actorCount--) {
        a = this._actors[actorCount];
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
      this._pickRenderCB();
      this._pickRenderRequested = false;
      this._pickRenderBuff = null;
      this._pickRenderCB = null;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.render();
    } else {
      leftEdge = rightEdge = topEdge = bottomEdge = true;
      while (actorCount--) {
        a = this._actors[actorCount];
        leftEdge = a._position.x + (a._size.x / 2) < 0;
        rightEdge = a._position.x - (a._size.x / 2) > window.innerWidth;
        topEdge = a._position.y + (a._size.y / 2) < 0;
        bottomEdge = a._position.y - (a._size.y / 2) > window.innerHeight;
        if (!(bottomEdge || topEdge || leftEdge || rightEdge)) {
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
    param.required(actor);
    actor.layer = layer || actor.layer;
    layerIndex = _.sortedIndex(this._actors, actor, "layer");
    this._actors.splice(layerIndex, 0, actor);
    this._actor_hash[actor.getId()] = actor;
    return actor;
  };


  /*
   * Remove an actor from our render list by either actor, or id
   *
   * @param [ARERawActor, Number] actorId actor id, or actor
   * @param [Boolean] noDestroy optional, defaults to false
   * @return [Boolean] success
   */

  ARERenderer.prototype.removeActor = function(actorId, noDestroy) {
    var removedActor;
    param.required(actorId);
    noDestroy = !!noDestroy;
    if (actorId instanceof ARERawActor) {
      actorId = actorId.getId();
    }
    removedActor = _.remove(this._actors, function(a) {
      return a.getId() === actorId;
    });
    if (removedActor && !noDestroy) {
      removedActor.destroy();
    }
    return !!removedActor;
  };


  /*
   * Switch material (shader program)
   *
   * @param [String] material
   */

  ARERenderer.prototype.switchMaterial = function(material) {
    var gl, handles, ortho;
    param.required(material);
    if (material === this._currentMaterial) {
      return false;
    }
    if (this.isWGLRendererActive()) {
      ortho = Matrix4.makeOrtho(0, this._width, this._height, 0, -10, 10).flatten();
      ortho[15] = 1.0;
      gl = this._gl;
      switch (material) {
        case ARERenderer.MATERIAL_FLAT:
          gl.useProgram(this._defaultShader.getProgram());
          handles = this._defaultShader.getHandles();
          gl.uniformMatrix4fv(handles.uProjection, false, ortho);
          break;
        case ARERenderer.MATERIAL_TEXTURE:
          gl.useProgram(this._texShader.getProgram());
          handles = this._texShader.getHandles();
          gl.uniformMatrix4fv(handles.uProjection, false, ortho);
          break;
        default:
          throw new Error("Unknown material " + material);
      }
    }
    this._currentMaterial = material;
    ARELog.info("Switched material " + this._currentMaterial);
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
    param.required(name);
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
    param.required(name);
    if (t = this.getTexture(name)) {
      return {
        w: t.width * t.scaleX,
        h: t.height * t.scaleY
      };
    }
    return null;
  };


  /*
   * Adds a texture to our internal collection
   *
   * @param [Object] texture texture object with name and gl texture
   */

  ARERenderer.prototype.addTexture = function(tex) {
    param.required(tex);
    param.required(tex.name);
    param.required(tex.texture);
    this._textures.push(tex);
    return this;
  };

  return ARERenderer;

})();
