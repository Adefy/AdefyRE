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

    # If we've already initialised once, show a warning and just callback
    # immediately
    if @_engine
      ARELog.warn "Re-initialize attempt, ignoring and passing through"
      return ad @_engine

    ###
    # Should WGL textures be flipped by their Y axis?
    # NOTE. This does not affect existing textures.
    ###
    @wglFlipTextureY = true

    # Callback fires *after* physics init, which takes awhile
    @_engine = new ARE width, height, =>
      ad @_engine
    , log, id

    # Initiliase our engine as everything is ready at this point (except psyx)
    @_masterInterface.setEngine @_engine
    @_renderer = @_engine.getRenderer()
    @_engine.startRendering()

    @_engine

  ###
  # Set global render mode
  #   @see ARERenderer.RENDERER_MODE_*
  #
  # This is a special method only we implement; as such, any libraries
  # interfacing with us should check for the existence of the method before
  # calling it!
  ###
  getRendererMode: -> @_renderer.getActiveRendererMode()

  ###
  # Set engine clear color
  #
  # @param [Object] color
  # @option color [Number] r red component
  # @option color [Number] g green component
  # @option color [Number] b blue component
  ###
  setClearColor: (color) ->    
    return unless @_renderer
    @_renderer.setClearColor color.r, color.g, color.b

  ###
  # Get engine clear color
  #
  # @return [Object] color {r, g, b}
  ###
  getClearColor: ->
    return unless @_renderer

    col = @_renderer.getClearColor()
    
    {
      r: col.getR()
      g: col.getG()
      b: col.getB()
    }

  ###
  # Set log level
  #
  # @param [Number] level 0-4
  ###
  setLogLevel: (level) ->
    level = Number level

    if isNaN level
      return ARELog.warn "Log level is NaN"

    level = Math.round level
    level = 0 if level < 0
    level = 4 if level > 4

    ARELog.level = level

  ###
  # Get the engine log level
  #
  # @return [Number] level
  ###
  getLogLevel: ->
    ARELog.level

  ###
  # Set camera center position with an object. Leaving out a component leaves it
  # unchanged.
  #
  # @param [Object] position
  # @option position [Number] x x component
  # @option position [Number] y y component
  ###
  setCameraPosition: (position) ->
    currentPosition = @_renderer.getCameraPosition()

    currentPosition.x = position.x if position.x != undefined
    currentPosition.y = position.y if position.y != undefined

    @_renderer.setCameraPosition currentPosition

  ###
  # Fetch camera position as an object
  #
  # @return [Object] position {x, y}
  ###
  getCameraPosition: ->
    @_renderer.getCameraPosition()

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
  # Enable/disable benchmarking.
  #
  # NOTE: This is a special method that only we have.
  #
  # @param [Boolean] benchmark
  ###
  setBenchmark: (status) ->
    return unless @_engine
    @_engine.benchmark = status
    window.AREMessages.broadcast value: status, "physics.benchmark.set"

  ###
  # Get the NRAID version string that this ad engine supports. It is implied
  # that we are backwards compatible with all previous versions.
  #
  # @return [String] version
  ###
  getNRAIDVersion: ->
    "1.0.0,freestanding"

  ###
  # Fetch meta data as defined in loaded manifest
  #
  # @return [Object] meta
  ###
  getMetaData: ->
    @_metaData

  ###
  # Load a package.json manifest, assume texture paths are relative to our
  # own.
  #
  # As we are a browser engine built for the desktop, and therefore don't
  # support mobile device features like orientation, or need to load files off
  # the disk, we only support a subset of the NRAID creative manifest.
  #
  # @param [Object] manifest
  # @option manifest [String] version NRAID version string
  # @option manifest [Object] meta
  # @option manifest [Array<Object>] textures
  # @param [Method] cb callback to call once the load completes (textures)
  ###
  loadManifest: (manifest, cb) ->
    param.required manifest.version

    # Ensure we are of the proper version
    if manifest.version.split(",")[0] > @getNRAIDVersion().split(",")[0]
      throw new Error "Unsupported NRAID version"

    # We store meta data on ourselves
    @_metaData = manifest.meta

    if manifest.textures
      async.each manifest.textures, (tex, done) =>
        @loadTexture tex, ->
          done()
        , @wglFlipTextureY
      , cb
    else
      cb()

  ###
  # Loads a texture, and adds it to our renderer
  #
  # @param [Object] textureDef Texture definition object, NRAID-compatible
  # @param [Method] cb called when texture is loaded
  # @param [Boolean] flipTexture optional
  ###
  loadTexture: (textureDef, cb, flipTexture) ->
    param.required textureDef.name
    param.required textureDef.file

    flipTexture = @wglFlipTextureY if typeof flipTexture != "boolean"
    
    if !!textureDef.atlas
      throw new Error "This version of ARE does not support atlas loading!"

    # Create texture and image
    img = new Image()
    img.crossOrigin = "anonymous"

    gl = @_renderer.getGL()
    tex = null

    if @_renderer.isWGLRendererActive()

      tex = gl.createTexture()
      img.onload = =>
        ARELog.info "Loading GL tex: #{textureDef.name}, #{textureDef.file}"

        scaleX = 1
        scaleY = 1

        # Resize image if needed
        w_NPOT = (img.width & (img.width - 1)) != 0
        h_NPOT = (img.height & (img.height - 1)) != 0

        if w_NPOT || h_NPOT

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

        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR

        # gl.generateMipmap gl.TEXTURE_2D
        gl.bindTexture gl.TEXTURE_2D, null

        # Add to renderer
        @_renderer.addTexture
          name: textureDef.name
          texture: tex
          width: img.width
          height: img.height
          scaleX: scaleX
          scaleY: scaleY

        cb() if cb

    else
      img.onload = =>
        ARELog.info "Loading canvas tex: #{textureDef.name}, #{textureDef.file}"

        # Add to renderer
        @_renderer.addTexture
          name: textureDef.name
          texture: img
          width: img.width
          height: img.height

        cb() if cb

    # Load!
    img.src = textureDef.file

  ###
  # Get renderer texture size by name
  #
  # @param [String] name
  # @param [Object] size
  ###
  getTextureSize: (name) ->
    @_renderer.getTextureSize name
