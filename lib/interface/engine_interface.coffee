###
# Calculates the next power of 2 number from (x)
# @param [Number] x
###
nextHighestPowerOfTwo = (x) ->
  --x
  i = 1

  while i < 32
    x = x | x >> i
    i <<= 1

  x + 1

# Renderer interface class
class AREEngineInterface

  constructor: (@_masterInterface) ->

  ###
  # Initialize the engine
  #
  # @param [Number] width
  # @param [Number] height
  # @param [Method] ad function to call to create ad
  # @param [Number] log loglevel, defaults to 1
  # @param [String] id id of element to instantiate on
  ###
  initialize: (width, height, ad, log, id) ->
    param.required ad
    log ||= 4
    id ||= ""

    ###
    # Should WGL textures be flipped by their Y axis?
    # NOTE. This does not affect existing textures.
    ###
    @wglFlipTextureY = false

    new ARE width, height, (@_engine) =>

      @_masterInterface.setEngine @_engine
      @_renderer = @_engine.getRenderer()
      @_engine.startRendering()

      ad @_engine

    , log, id

  ###
  # Set global render mode
  #   @see ARERenderer.RENDERER_MODE_*
  # This is a special method only we implement; as such, any libraries
  # interfacing with us should check for the existence of the method before
  # calling it!
  ###
  getRendererMode: -> @_renderer.getActiveRendererMode()

  ###
  # Set engine clear color
  #
  # @param [Number] r
  # @param [Number] g
  # @param [Number] b
  ###
  setClearColor: (r, g, b) ->
    return unless @_renderer
    @_renderer.setClearColor r, g, b

  ###
  # Get engine clear color as (r,g,b) JSON, fails with null
  #
  # @return [String] clearcol
  ###
  getClearColor: ->
    return unless @_renderer

    col = @_renderer.getClearColor()
    "{ r: #{col.getR()}, g: #{col.getG()}, b: #{col.getB()} }"

  ###
  # Set log level
  #
  # @param [Number] level 0-4
  ###
  setLogLevel: (level) ->
    ARELog.level = param.required level, [0, 1, 2, 3, 4]

  ###
  # Set camera center position. Leaving out a component leaves it unchanged
  #
  # @param [Number] x
  # @param [Number] y
  ###
  setCameraPosition: (x, y) ->
    currentPosition = @_renderer.getCameraPosition()

    @_renderer.setCameraPosition
      x: x or currentPosition.x
      y: y or currentPosition.y

  ###
  # Fetch camera position. Returns a JSON object with x,y keys
  #
  # @return [Object]
  ###
  getCameraPosition: -> JSON.stringify @_renderer.getCameraPosition()

  ###
  # Return our engine's width
  #
  # @return [Number] width
  ###
  getWidth: ->
    return -1 unless @_renderer
    @_renderer.getWidth()

  ###
  # Return our engine's height
  #
  # @return [Number] height
  ###
  getHeight: ->
    return -1 unless @_renderer
    @_renderer.getHeight()

  ###
  # Enable/disable benchmarking
  #
  # @param [Boolean] benchmark
  ###
  setBenchmark: (status) ->
    return unless @_engine
    @_engine.benchmark = status
    window.AREMessages.broadcast value: status, "physics.benchmark.set"

  ###
  # Load a package.json manifest, assume texture paths are relative to our
  # own
  #
  # @param [String] json package.json source
  # @param [Method] cb callback to call once the load completes (textures)
  ###
  loadManifest: (json, cb) ->
    manifest = JSON.parse param.required json

    ##
    ## NOTE: The manifest only contains textures now, but for the sake of
    ##       backwards compatibilty, we check for a textures array

    manifest = manifest.textures if manifest.textures
    return cb() if _.isEmpty(manifest)

    count = 0
    flipTexture = @wglFlipTextureY

    # Load textures
    for tex in manifest

      # Feature check
      if tex.compression and tex.compression != "none"
        throw new Error "Texture is compressed! [#{tex.compression}]"

      if tex.type and tex.type != "image"
        throw new Error "Texture is not an image! [#{tex.type}]"

      # Gogo
      @loadTexture tex.name, tex.path, flipTexture, ->
        count++
        cb() if count == manifest.length

  ###
  # Loads a texture, and adds it to our renderer
  #
  # @param [String] name
  # @param [String] path
  # @param [Boolean] flipTexture
  # @param [Method] cb called when texture is loaded
  ###
  loadTexture: (name, path, flipTexture, cb) ->
    flipTexture = @wglFlipTextureY if typeof flipTexture != "boolean"
    ARELog.info "Loading texture: #{name}, #{path}"

    # Create texture and image
    img = new Image()
    img.crossOrigin = "anonymous"

    gl = @_renderer.getGL()
    tex = null

    if @_renderer.isWGLRendererActive()
      ARELog.info "Loading Gl Texture"

      tex = gl.createTexture()
      img.onload = =>

        scaleX = 1
        scaleY = 1

        # Resize image if needed
        w = (img.width & (img.width - 1)) != 0
        h = (img.height & (img.height - 1)) != 0
        if w || h

          canvas = document.createElement "canvas"

          canvas.width = nextHighestPowerOfTwo img.width
          canvas.height = nextHighestPowerOfTwo img.height

          scaleX = img.width / canvas.width
          scaleY = img.height / canvas.height

          ctx = canvas.getContext "2d"
          ctx.drawImage img, 0, 0, canvas.width, canvas.height

          img = canvas

        # Set up GL texture
        gl.bindTexture gl.TEXTURE_2D, tex
        gl.pixelStorei gl.UNPACK_FLIP_Y_WEBGL, flipTexture
        gl.texImage2D gl.TEXTURE_2D, 0,
                      gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img

        # if not pot
        #  gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE
        #  gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE

        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR

        # gl.generateMipmap gl.TEXTURE_2D
        gl.bindTexture gl.TEXTURE_2D, null

        # Add to renderer
        @_renderer.addTexture
          name: name
          texture: tex
          width: img.width
          height: img.height
          scaleX: scaleX
          scaleY: scaleY

        cb() if cb

    else
      ARELog.info "Loading Canvas Image"
      img.onload = =>

        # Add to renderer
        @_renderer.addTexture
          name: name
          texture: img
          width: img.width
          height: img.height

        cb() if cb

    # Load!
    img.src = path

  ###
  # Get renderer texture size by name
  #
  # @param [String] name
  # @param [Object] size
  ###
  getTextureSize: (name) -> @_renderer.getTextureSize name

  ###
  # TODO: Implement
  #
  # Set remind me later button region
  #
  # @param [Number] x
  # @param [Number] y
  # @param [Number] w
  # @param [Number] h
  ###
  setRemindMeButton: (x, y, w, h) ->
