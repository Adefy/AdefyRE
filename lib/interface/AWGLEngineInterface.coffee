##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Renderer interface class
class AWGLEngineInterface

  # Initialize the engine
  #
  # @param [Method] ad function to call to create ad
  # @param [Number] width
  # @param [Number] height
  # @param [Number] log loglevel, defaults to 1
  # @param [String] id id of element to instantiate on
  initialize: (ad, width, height, log, id) ->
    param.required ad
    param.required width
    param.required height
    log = param.optional log, 4
    param.optional id

    # Bail if we've already been initalized
    if @_engine != undefined
      AWGLLog.warn "Engine already initialized, bailing"
      return

    window.ajax = microAjax
    me = @
    new AWGLEngine null, log, (awgl) ->
      me._engine = awgl

      awgl.startRendering()
      ad awgl
    , id, width, height

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
      img.onload = ->

        # Set up GL texture
        gl.bindTexture gl.TEXTURE_2D, tex
        gl.texImage2D gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, \
          gl.LINEAR_MIPMAP_NEAREST
        gl.generateMipmap gl.TEXTURE_2D
        gl.bindTexture gl.TEXTURE_2D, null

        # Add to renderer
        AWGLRenderer.addTexture
          name: name
          texture: tex

        # Call cb once we've loaded all textures
        count++
        if count == manifest.textures.length then cb()

      # Load!
      img.src = path
      console.log "attempting load of #{path}"

    if manifest.textures == undefined or manifest.textures.length == 0
      cb()
      return

    # Load textures
    for tex in manifest.textures

      # Feature check
      if tex.compression != undefined and tex.compression != "none"
        throw new Error "Only un-compressed textures are supported!"

      if tex.type != "image"
        throw new Error "Only image textures are supported!"

      # Gogo
      loadTexture tex.name, tex.path
