# @depend actors/rectangle_actor.coffee
# @depend actors/circle_actor.coffee
# @depend actors/polygon_actor.coffee
# @depend actors/triangle_actor.coffee
#
# @depend renderer.coffee
# @depend physics/manager.coffee
# @depend util/log.coffee
# @depend animations/bez_animation.coffee
# @depend animations/vert_animation.coffee
# @depend animations/psyx_animation.coffee
# @depend interface/interface.coffee

# Requires Underscore.js from http://documentcloud.github.io/underscore
# Requires Chipmunk-js https://github.com/josephg/Chipmunk-js

# The WebGL Adefy engine. Implements the full AJS interface.
#
# ARELog is used for all logging throughout the application
class ARE

  @config:

    # When false, the physics engine will not be available, and chipmunk is
    # not needed!
    physics: true

    deps:
      physics:
        chipmunk: "/components/chipmunk/cp.min.js"
        physics_worker: "/lib/physics/worker.js"

  @Version:
    MAJOR: 1
    MINOR: 5
    PATCH: 2
    BUILD: null
    STRING: "1.5.2"

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
    logLevel = 4 if isNaN logLevel
    ARELog.level = logLevel
    canvas ||= ""

    # Holds a handle on the render loop interval
    @_renderIntervalId = null
    @_currentlyRendering = false
    @benchmark = false

    # Framerate for renderer, defaults to 60FPS
    @setFPS 60

    # Ensure Underscore.js is loaded
    if window._ == null or window._ == undefined
      return ARELog.error "Underscore.js is not present!"

    # Initialize physics worker
    @_renderer = new ARERenderer
      canvasId: canvas
      width: width
      height: height

    # Don't initialise physics if flagged otherwise
    if ARE.config.physics

      ###
      # We expose the physics manager to the window, so actors can directly
      # communicate with it
      ###
      @_physics = new PhysicsManager @_renderer, ARE.config.deps.physics, =>
        @startRendering()
        cb @

      window.AREPhysicsManager = @_physics

    else

      # We call the cb in a timeout so any init after us can finish
      ARELog.info "Proceeding without physics..."
      setTimeout =>
        @startRendering()
        cb @

    @

  ###
  # Get our internal ARERenderer instance
  #
  # @return [ARERenderer] renderer
  ###
  getRenderer: -> @_renderer

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
  ###
  startRendering: ->
    return if @_currentlyRendering
    @_currentlyRendering = true
    ARELog.info "Starting render loop"

    renderer = @_renderer
    render = ->
      renderer.update()
      renderer.render()
      window.requestAnimationFrame render

    window.requestAnimationFrame render

  ###
  # Check if the render loop is currently running
  #
  # @return [Boolean] rendering
  ###
  isRendering: -> @_currentlyRendering

  ###
  # Set renderer clear color in integer RGB form (passes through to renderer)
  #
  # @param [Number] r
  # @param [Number] g
  # @param [Number] b
  # @return [self]
  ###
  setClearColor: (r, g, b) ->
    r ||= 0
    g ||= 0
    b ||= 0

    if @_renderer
      @_renderer.setClearColor r, g, b

    @

  ###
  # Get clear color from renderer (if active, null otherwise)
  #
  # @return [AREColor3] color
  ###
  getClearColor: ->
    if @_renderer
      @_renderer.getClearColor()
    else
      null

  ###
  # Return our internal renderer width
  #
  # @return [Number] width
  ###
  getWidth: ->
    @_renderer.getWidth()

  ###
  # Return our internal renderer height
  #
  # @return [Number] height
  ###
  getHeight: ->
    @_renderer.getHeight()

  ###
  # Request a pick render, passed straight to the renderer
  #
  # @param [FrameBuffer] buffer
  # @param [Method] cb cb to call post-render
  ###
  requestPickingRenderWGL: (buffer, cb) ->
    if @_renderer.isWGLRendererActive()
      @_renderer.requestPickingRenderWGL buffer, cb
    else
      ARELog.warn "WebGL renderer available for WebGL pick!"

  ###
  # Request a pick render, passed straight to the renderer
  #
  # -param [FrameBuffer] buffer
  # @param [Method] cb cb to call post-render
  ###
  requestPickingRenderCanvas: (selectionRect, cb) ->
    if @_renderer.isCanvasRendererActive()
      @_renderer.requestPickingRenderCanvas selectionRect, cb
    else
      ARELog.warn "Canvas renderer available for canvas pick!"

window.AdefyGLI = window.AdefyRE = new AREInterface
