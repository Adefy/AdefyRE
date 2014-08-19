
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
