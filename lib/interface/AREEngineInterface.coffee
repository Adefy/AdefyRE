##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Renderer interface class
class AREEngineInterface

  # Initialize the engine
  #
  # @param [Number] width
  # @param [Number] height
  # @param [Method] ad function to call to create ad
  # @param [Number] log loglevel, defaults to 1
  # @param [String] id id of element to instantiate on
  initialize: (width, height, ad, log, id) ->
    param.required ad
    param.required width
    param.required height
    log = param.optional log, 4
    id = param.optional id, ""

    # Clean us up just in case we are being initialized for a second time
    ARERenderer.actors = []
    ARERenderer.textures = []
    ARERenderer._gl = null
    ARERenderer.me = null
    ARERenderer._currentMaterial = "none"
    ARERenderer.camPos = x: 0, y: 0

    # Clear out physics world
    AREPhysics.stopStepping()

    me = @
    new AREEngine width, height, (are) ->
      me._engine = are

      are.startRendering()
      ad are
    , log, id

  # Set global render mode
  #
  #   0 - Canvas
  #   1 - WebGL
  #
  # This is a special method only we implement; as such, any libraries
  # interfacing with us should check for the existence of the method before
  # calling it!
  setRenderMode: (mode) -> ARERenderer.rendererMode = mode

  # Set engine clear color
  #
  # @param [Number] r
  # @param [Number] g
  # @param [Number] b
  setClearColor: (r, g, b) ->
    param.required r
    param.required g
    param.required b

    if @_engine == undefined then return
    else ARERenderer.me.setClearColor r, g, b

  # Get engine clear color as (r,g,b) JSON, fails with null
  #
  # @return [String] clearcol
  getClearColor: ->
    if @_engine == undefined then return null

    col = ARERenderer.me.getClearColor()
    JSON.stringify { r: col.getR(), g: col.getG(), b: col.getB() }

  # Set log level
  #
  # @param [Number] level 0-4
  setLogLevel: (level) ->
    param.required level, [0, 1, 2, 3, 4]

    ARELog.level = level

  # Set camera center position. Leaving out a component leaves it unchanged
  #
  # @param [Number] x
  # @param [Number] y
  setCameraPosition: (x, y) ->
    ARERenderer.camPos.x = param.optional x, ARERenderer.camPos.x
    ARERenderer.camPos.y = param.optional y, ARERenderer.camPos.y

  # Fetch camera position. Returns a JSON object with x,y keys
  #
  # @return [Object]
  getCameraPosition: -> JSON.stringify ARERenderer.camPos

  # Enable/disable benchmarking
  #
  # @param [Boolean] benchmark
  setBenchmark: (status) ->
    AREPhysics.benchmark = status
    @_engine.benchmark = status

  # Load a package.json manifest, assume texture paths are relative to our
  # own
  #
  # @param [String] json package.json source
  # @param [Method] cb callback to call once the load completes (textures)
  loadManifest: (json, cb) ->
    param.required json

    manifest = JSON.parse json

    ##
    ## NOTE: The manifest only contains textures now, but for the sake of
    ##       backwards compatibilty, we check for a textures array

    if manifest.textures != undefined then manifest = manifest.textures

    count = 0

    # Loads a texture, and adds it to our renderer
    loadTexture = (name, path) ->

      # Create texture and image
      img = new Image()
      img.crossOrigin = "anonymous"

      gl = ARERenderer._gl
      tex = null

      if ARERenderer.activeRendererMode == 1

        ARELog.info "Loading Gl Texture"

        tex = gl.createTexture()
        img.onload = ->

          # Set up GL texture
          gl.bindTexture gl.TEXTURE_2D, tex
          gl.texImage2D gl.TEXTURE_2D, 0,
                        gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img

          # If image is a power of two
          pot = false
          if (img.width & (img.width - 1)) == 0
            if (img.height & (img.height - 1)) == 0
              gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT
              gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT
              pot = true

          if not pot
            gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE
            gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE

          gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR
          gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR

          # gl.generateMipmap gl.TEXTURE_2D
          gl.bindTexture gl.TEXTURE_2D, null

          # Add to renderer
          ARERenderer.addTexture
            name: name
            texture: tex
            width: img.width
            height: img.height

          # Call cb once we've loaded all textures
          count++
          if count == manifest.length then cb()

      else

        img.onload = ->

          # Add to renderer
          ARERenderer.addTexture
            name: name
            texture: img
            width: img.width
            height: img.height

          # Call cb once we've loaded all textures
          count++
          if count == manifest.length then cb()

      # Load!
      img.src = path

    # Load textures
    for tex in manifest

      # Feature check
      if tex.compression != undefined and tex.compression != "none"
        console.error tex.compression
        throw new Error "Only un-compressed textures are supported!"

      if tex.type != undefined and tex.type != "image"
        console.error tex.type
        throw new Error "Only image textures are supported!"

      # Gogo
      loadTexture tex.name, tex.path

  # Get renderer texture size by name
  #
  # @param [String] name
  # @param [Object] size
  getTextureSize: (name) -> ARERenderer.getTextureSize name

  # TODO: Implement
  #
  # Set remind me later button region
  #
  # @param [Number] x
  # @param [Number] y
  # @param [Number] w
  # @param [Number] h
  setRemindMeButton: (x, y, w, h) ->
