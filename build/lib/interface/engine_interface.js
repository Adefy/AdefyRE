
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
