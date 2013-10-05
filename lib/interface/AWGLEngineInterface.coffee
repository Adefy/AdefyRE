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