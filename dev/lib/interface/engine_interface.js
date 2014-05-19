
/*
 * Calculates the next power of 2 number from (x)
 * @param [Number] x
 */
var AREEngineInterface, nextHighestPowerOfTwo;

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
    param.required(ad);
    log || (log = 4);
    id || (id = "");

    /*
     * Should WGL textures be flipped by their Y axis?
     * NOTE. This does not affect existing textures.
     */
    this.wglFlipTextureY = false;
    return new ARE(width, height, (function(_this) {
      return function(_engine) {
        _this._engine = _engine;
        _this._masterInterface.setEngine(_this._engine);
        _this._renderer = _this._engine.getRenderer();
        _this._engine.startRendering();
        return ad(_this._engine);
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
    return this._renderer.getActiveRendererMode();
  };


  /*
   * Set engine clear color
   *
   * @param [Number] r
   * @param [Number] g
   * @param [Number] b
   */

  AREEngineInterface.prototype.setClearColor = function(r, g, b) {
    if (!this._renderer) {
      return;
    }
    return this._renderer.setClearColor(r, g, b);
  };


  /*
   * Get engine clear color as (r,g,b) JSON, fails with null
   *
   * @return [String] clearcol
   */

  AREEngineInterface.prototype.getClearColor = function() {
    var col;
    if (!this._renderer) {
      return;
    }
    col = this._renderer.getClearColor();
    return "{ r: " + (col.getR()) + ", g: " + (col.getG()) + ", b: " + (col.getB()) + " }";
  };


  /*
   * Set log level
   *
   * @param [Number] level 0-4
   */

  AREEngineInterface.prototype.setLogLevel = function(level) {
    return ARELog.level = param.required(level, [0, 1, 2, 3, 4]);
  };


  /*
   * Set camera center position. Leaving out a component leaves it unchanged
   *
   * @param [Number] x
   * @param [Number] y
   */

  AREEngineInterface.prototype.setCameraPosition = function(x, y) {
    var currentPosition;
    currentPosition = this._renderer.getCameraPosition();
    return this._renderer.setCameraPosition({
      x: x || currentPosition.x,
      y: y || currentPosition.y
    });
  };


  /*
   * Fetch camera position. Returns a JSON object with x,y keys
   *
   * @return [Object]
   */

  AREEngineInterface.prototype.getCameraPosition = function() {
    return JSON.stringify(this._renderer.getCameraPosition());
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
   * Enable/disable benchmarking
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
   * Load a package.json manifest, assume texture paths are relative to our
   * own
   *
   * @param [String] json package.json source
   * @param [Method] cb callback to call once the load completes (textures)
   */

  AREEngineInterface.prototype.loadManifest = function(json, cb) {
    var count, flipTexture, manifest, tex, _i, _len, _results;
    manifest = JSON.parse(param.required(json));
    if (manifest.textures) {
      manifest = manifest.textures;
    }
    if (_.isEmpty(manifest)) {
      return cb();
    }
    count = 0;
    flipTexture = this.wglFlipTextureY;
    _results = [];
    for (_i = 0, _len = manifest.length; _i < _len; _i++) {
      tex = manifest[_i];
      if (tex.compression && tex.compression !== "none") {
        throw new Error("Texture is compressed! [" + tex.compression + "]");
      }
      if (tex.type && tex.type !== "image") {
        throw new Error("Texture is not an image! [" + tex.type + "]");
      }
      _results.push(this.loadTexture(tex.name, tex.path, flipTexture, function() {
        count++;
        if (count === manifest.length) {
          return cb();
        }
      }));
    }
    return _results;
  };


  /*
   * Loads a texture, and adds it to our renderer
   *
   * @param [String] name
   * @param [String] path
   * @param [Boolean] flipTexture
   * @param [Method] cb called when texture is loaded
   */

  AREEngineInterface.prototype.loadTexture = function(name, path, flipTexture, cb) {
    var gl, img, tex;
    if (typeof flipTexture !== "boolean") {
      flipTexture = this.wglFlipTextureY;
    }
    ARELog.info("Loading texture: " + name + ", " + path);
    img = new Image();
    img.crossOrigin = "anonymous";
    gl = this._renderer.getGL();
    tex = null;
    if (this._renderer.isWGLRendererActive()) {
      ARELog.info("Loading Gl Texture");
      tex = gl.createTexture();
      img.onload = (function(_this) {
        return function() {
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
          _this._renderer.addTexture({
            name: name,
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
      ARELog.info("Loading Canvas Image");
      img.onload = (function(_this) {
        return function() {
          _this._renderer.addTexture({
            name: name,
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
    return img.src = path;
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
