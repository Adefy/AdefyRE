var ARE;

ARE = (function() {
  ARE.config = {
    physics: true,
    deps: {
      physics: {
        chipmunk: "/components/chipmunk/cp.min.js",
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
    if (this._renderer) {
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
    if (this._renderer) {
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
