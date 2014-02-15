##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Renderer interface class
class AWGLEngineInterface

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
    param.optional id

    # Bail if we've already been initalized
    if @_engine != undefined
      AWGLLog.warn "Engine already initialized, bailing"
      return

    me = @
    new AWGLEngine width, height, (awgl) ->
      me._engine = awgl

      awgl.startRendering()
      ad awgl
    , log

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
    else AWGLRenderer.me.setClearColor r, g, b

  # Get engine clear color as (r,g,b) JSON, fails with null
  #
  # @return [String] clearcol
  getClearColor: ->
    if @_engine == undefined then return null

    col = AWGLRenderer.me.getClearColor()
    JSON.stringify { r: col.getR(), g: col.getG(), b: col.getB() }

  # Set log level
  #
  # @param [Number] level 0-4
  setLogLevel: (level) ->
    param.required level, [0, 1, 2, 3, 4]

    AWGLLog.level = level

  # Set camera center position. Leaving out a component leaves it unchanged
  #
  # @param [Number] x
  # @param [Number] y
  setCameraPosition: (x, y) ->
    AWGLRenderer.camPos.x = param.optional x, AWGLRenderer.camPos.x
    AWGLRenderer.camPos.y = param.optional y, AWGLRenderer.camPos.y

  # Fetch camera position. Returns a JSON object with x,y keys
  #
  # @return [Object]
  getCameraPosition: -> JSON.stringify AWGLRenderer.camPos

  # Load a package.json manifest, assume texture paths are relative to our
  # own
  #
  # @param [String] json package.json source
  # @param [Method] cb callback to call once the load completes (textures)
  loadManifest: (json, cb) ->
    param.required json

    manifest = JSON.parse json
    gl = AWGLRenderer._gl

    count = 0

    # Loads a texture, and adds it to our renderer
    loadTexture = (name, path) ->

      # Create texture and image
      tex = gl.createTexture()
      img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = ->

        # Set up GL texture
        gl.bindTexture gl.TEXTURE_2D, tex
        gl.texImage2D gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img

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
        AWGLRenderer.addTexture
          name: name
          texture: tex
          width: img.width
          height: img.height

        # Call cb once we've loaded all textures
        count++
        if count == manifest.textures.length then cb()

      # Load!
      img.src = path

    if manifest.textures == undefined or manifest.textures.length == 0
      cb()
      return

    # Load textures
    for tex in manifest.textures

      # Feature check
      if tex.compression != undefined and tex.compression != "none"
        console.error tex.compression
        throw new Error "Only un-compressed textures are supported!"

      if tex.type != "image"
        console.error tex.type
        throw new Error "Only image textures are supported!"

      # Gogo
      loadTexture tex.name, tex.path

  # Get renderer texture size by name
  #
  # @param [String] name
  # @param [Object] size
  getTextureSize: (name) -> AWGLRenderer.getTextureSize name

  # TODO: Implement
  #
  # Set remind me later button region
  #
  # @param [Number] x
  # @param [Number] y
  # @param [Number] w
  # @param [Number] h
  setRemindMeButton: (x, y, w, h) ->
