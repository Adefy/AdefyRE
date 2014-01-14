##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# @depend AWGLRenderer.coffee
# @depend AWGLPhysics.coffee
# @depend util/AWGLLog.coffee
# @depend animations/AWGLBezAnimation.coffee
# @depend animations/AWGLVertAnimation.coffee
# @depend animations/AWGLPsyxAnimation.coffee
# @depend interface/AWGLInterface.coffee

# Requires Underscore.js fromhttp://documentcloud.github.io/underscore
# Requires Chipmunk-js https://github.com/josephg/Chipmunk-js

# The WebGL Adefy engine. Implements the full AJS interface.
#
# AWGLLog is used for all logging throughout the application
class AWGLEngine

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
  # @param [Number] logLevel level to start AWGLLog at, defaults to 4
  # @param [String] canvas optional canvas selector to initalize the renderer
  constructor: (width, height, cb, logLevel, canvas) ->
    param.required width
    param.required height
    param.required cb
    AWGLLog.level = param.optional logLevel, 4
    canvas = param.optional canvas, ""

    # Holds a handle on the render loop interval
    @_renderIntervalId = null

    # Framerate for renderer, defaults to 60FPS
    @_framerate = 1.0 / 60.0

    # Ensure Underscore.js is loaded
    if window._ == null or window._ == undefined
      return AWGLLog.error "Underscore.js is not present!"

    # Ensure Chipmunk-js is loaded
    if window.cp == undefined or window.cp == null
      return AWGLLog.error "Chipmunk-js is not present!"

    @_renderer = new AWGLRenderer canvas, width, height
    @startRendering()
    cb @

  # Set framerate as an FPS figure
  # @param [Number] fps
  setFPS: (fps) -> @_framerate = 1.0 / fps

  # Start render loop if it isn't already running
  startRendering: ->
    if @_renderIntervalId != null then return

    AWGLLog.info "Starting render loop"
    @_renderIntervalId = setInterval (=> @_renderer.render()), @_framerate

  # Halt render loop if it's running
  stopRendering: ->
    if @_renderIntervalId == null then return

    AWGLLog.info "Halting render loop"
    clearInterval @_renderIntervalId
    @_renderIntervalId = null

  # Set renderer clear color in integer RGB form (passes through to renderer)
  #
  # @param [Number] r
  # @param [Number] g
  # @param [Number] b
  setClearColor: (r, g, b) ->
    r = param.optional r, 0
    g = param.optional g, 0
    b = param.optional b, 0

    if @_renderer instanceof AWGLRenderer
      @_renderer.setClearColor r, g, b

  # Get clear color from renderer (if active, null otherwise)
  #
  # @return [AWGLColor3] color
  getClearColor: ->
    if @_renderer instanceof AWGLRenderer
      @_renderer.getClearColor()
    else
      null

  # Return our internal renderer width, returns -1 if we don't have a renderer
  #
  # @return [Number] width
  getWidth: ->
    if @_renderer == null or @_renderer == undefined
      -1
    else
      @_renderer.getWidth()

  # Return our internal renderer height
  #
  # @return [Number] height
  getHeight: ->
    if @_renderer == null or @_renderer == undefined
      -1
    else
      @_renderer.getHeight()

  # Request a pick render, passed straight to the renderer
  #
  # @param [FrameBuffer] buffer
  # @param [Method] cb cb to call post-render
  requestPickingRender: (buffer, cb) ->
    if @_renderer == null or @_renderer == undefined
      AWGLLog.warn "Can't request a pick render, renderer not instantiated!"
    else
      @_renderer.requestPickingRender buffer, cb

  # Get our renderer's gl object
  #
  # @return [Object] gl
  getGL: ->
    if AWGLRenderer._gl == null then AWGLLog.warn "Render not instantiated!"
    AWGLRenderer._gl

# Break out an interface. Use responsibly
window.AdefyGLI = new AWGLInterface
