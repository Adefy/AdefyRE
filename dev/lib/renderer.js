var ARERenderer;

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
   * @property [Array<Object>] actors for rendering
   */

  ARERenderer.actors = [];


  /*
   * @property [Object] actor_hash actor objects stored by id, for faster access
   */

  ARERenderer.actor_hash = {};


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
        a.wglDraw(gl, this._defaultShader);
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
    ARERenderer.actor_hash[actor.getId()] = actor;
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

  ARERenderer.addTexture = function(tex) {
    param.required(tex.name);
    param.required(tex.texture);
    return ARERenderer.textures.push(tex);
  };

  return ARERenderer;

})();
