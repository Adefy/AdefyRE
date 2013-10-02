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
    @_engine = new AWGLEngine null, log, (awgl) ->
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

  # Get engine clear color as (r,g,b), fails with null
  #
  # @return [Object] clearcol
  getClearColor: ->
    if @_engine == undefined then return null

    col = AWGLRenderer.me.getClearColor()
    { r: col.getR(), g: col.getG(), b: col.getB() }