var AREEngine;

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
    window.AREMessages = new KoonFlock("AREMessages");
    window.AREMessages.registerKoon(window.Bazar);
    this._physics = new PhysicsManager();
    this._renderer = new ARERenderer(canvas, width, height);
    this._currentlyRendering = false;
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
    var render, renderer;
    if (this._currentlyRendering) {
      return;
    }
    this._currentlyRendering = true;
    ARELog.info("Starting render loop");
    renderer = this._renderer;
    render = function() {
      renderer.activeRenderMethod();
      return window.requestAnimationFrame(render);
    };
    return window.requestAnimationFrame(render);
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
