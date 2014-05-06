##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# @depend renderer.coffee
# @depend physics/manager.coffee
# @depend util/log.coffee
# @depend animations/bez_animation.coffee
# @depend animations/vert_animation.coffee
# @depend animations/psyx_animation.coffee
# @depend interface/interface.coffee

# Requires Underscore.js fromhttp://documentcloud.github.io/underscore
# Requires Chipmunk-js https://github.com/josephg/Chipmunk-js

# The WebGL Adefy engine. Implements the full AJS interface.
#
# ARELog is used for all logging throughout the application
class AREEngine

  ###
  # Instantiates the engine, starting the render loop and physics handler.
  # Further useage should happen through the interface layer, either manually
  # or with the aid of AJS.
  #
  # After instantiation, the cb is called with ourselves as an argument
  #
  # Checks for dependencies and bails early if all are not found.
  #
  # @param [Number] width optional width to pass to the canvas
  # @param [Number] height optional height to pass to the canvas
  # @param [Method] cb callback to execute when finished initializing
  # @param [Number] logLevel level to start ARELog at, defaults to 4
  # @param [String] canvas optional canvas selector to initalize the renderer
  ###
  constructor: (width, height, cb, logLevel, canvas) ->
    param.required width
    param.required height
    param.required cb

    ARELog.level = param.optional logLevel, 4
    canvas = param.optional canvas, ""

    # Holds a handle on the render loop interval
    @_renderIntervalId = null

    @benchmark = false

    # Framerate for renderer, defaults to 60FPS
    @setFPS(60)

    # Ensure Underscore.js is loaded
    if window._ == null or window._ == undefined
      return ARELog.error "Underscore.js is not present!"

    # Initialize messaging system
    window.AREMessages = new KoonFlock "AREMessages"
    window.AREMessages.registerKoon window.Bazar

    # Initialize physics worker
    @_physics = new PhysicsManager ARE.config.deps.physics

    @_renderer = new ARERenderer canvas, width, height

    @_currentlyRendering = false
    @startRendering()
    cb @

  ###
  # Set framerate as an FPS figure
  # @param [Number] fps
  # @return [self]
  ###
  setFPS: (fps) ->
    @_framerate = 1.0 / fps

    @

  ###
  # Start render loop if it isn't already running
  # @return [Void]
  ###
  startRendering: ->
    return if @_currentlyRendering
    @_currentlyRendering = true
    ARELog.info "Starting render loop"

    renderer = @_renderer
    render = ->
      renderer.render()
      window.requestAnimationFrame render

    window.requestAnimationFrame render

  ###
  # Set renderer clear color in integer RGB form (passes through to renderer)
  #
  # @param [Number] r
  # @param [Number] g
  # @param [Number] b
  # @return [self]
  ###
  setClearColor: (r, g, b) ->
    r = param.optional r, 0
    g = param.optional g, 0
    b = param.optional b, 0

    if @_renderer instanceof ARERenderer
      @_renderer.setClearColor r, g, b

    @

  ###
  # Get clear color from renderer (if active, null otherwise)
  #
  # @return [AREColor3] color
  ###
  getClearColor: ->
    if @_renderer instanceof ARERenderer
      @_renderer.getClearColor()
    else
      null

  ###
  # Return our internal renderer width, returns -1 if we don't have a renderer
  #
  # @return [Number] width
  ###
  getWidth: ->
    if @_renderer == null or @_renderer == undefined
      -1
    else
      @_renderer.getWidth()

  ###
  # Return our internal renderer height
  #
  # @return [Number] height
  ###
  getHeight: ->
    if @_renderer == null or @_renderer == undefined
      -1
    else
      @_renderer.getHeight()

  ###
  # Request a pick render, passed straight to the renderer
  #
  # @param [FrameBuffer] buffer
  # @param [Method] cb cb to call post-render
  ###
  requestPickingRenderWGL: (buffer, cb) ->
    if @_renderer == null or @_renderer == undefined
      ARELog.warn "Can't request a pick render, renderer not instantiated!"
    else
      if @_renderer.isWGLRendererActive()
        @_renderer.requestPickingRenderWGL buffer, cb
      else
        ARELog.warn "Can't request a WGL pick render, " + \
                    "not using WGL renderer"

  ###
  # Request a pick render, passed straight to the renderer
  #
  # -param [FrameBuffer] buffer
  # @param [Method] cb cb to call post-render
  ###
  requestPickingRenderCanvas: (selectionRect, cb) ->
    if @_renderer == null or @_renderer == undefined
      ARELog.warn "Can't request a pick render, renderer not instantiated!"
    else
      if @_renderer.isCanvasRendererActive()
        @_renderer.requestPickingRenderCanvas selectionRect, cb
      else
        ARELog.warn "Can't request a canvas pick render, " + \
                    "not using canvas renderer"

  ###
  # Get our renderer's gl object
  #
  # @return [Object] gl
  ###
  getGL: ->
    if ARERenderer._gl == null then ARELog.warn "Render not instantiated!"
    ARERenderer._gl

  ###
  # Return the current active renderer mode
  #
  # @return [Number]
  ###
  getActiveRendererMode: -> ARERenderer.activeRendererMode
