# AWGLRenderer
# @depend objects/AWGLColor3.coffee
#
# Keeps track of and renders objects, manages textures, and replicates all the
# necessary functionality from the AdefyLib renderer
class AWGLRenderer

  _canvas: null     # HTML <canvas> element
  _ctx: null        # Drawing context
  _gl: null         # GL context
  _clearColor: null # blanking color

  # @property [Array<Object>] actors for rendering
  actors: []

  # Sets up the renderer, using either an existing canvas or creating a new one
  #
  # Passing multiple parameters implies the creation of the canvas with the
  # specified id.
  #
  # Returns false if the GL context could not be created
  #
  # @param [String] id canvas id
  # @param [Number] width canvas width
  # @param [Number] height canvas height
  # @return [Boolean] success
  constructor: (canvasId, @_width, @_height) ->

    log = AWGLEngine.getLog()

    if @_width == undefined or @_width == null or @_height == undefined or @_height == null

      log.warn "No/invalid dimensions provided, continuing with defaults"
      @_width = 800
      @_height = 600

    if @_width <= 1 or @_height <= 1
      throw "Canvas must be at least 2x2 in size"

    # Start out with black
    @_clearColor = new AWGLColor3 0, 0, 0

    # Create a new canvas, or pull it in if provided
    if canvasId == undefined or canvasId == null

      # Create canvas
      @_canvas = document.createElement "canvas"
      @_canvas.width = @_width
      @_canvas.height = @_height
      @_canvas.id = "awgl_canvas"

      # Attach to the body
      document.getElementsByTagName("body")[0].appendChild @_canvas

      log.info "Creating canvas #awgl_canvas [#{@_width}x#{@_height}]"
    else
      @_canvas = document.getElementById canvasId
      log.info "Using canvas ##{canvasId}"

    # Initialize GL context
    try
      @_gl = @_canvas.getContext("webgl") || @_canvas.getContext("experimental-webgl")
    catch e
      console.error e
      return false

    if @_gl is null
      alert "Your browser does not support WebGL!"
      return false

    @_ctx = @_canvas.getContext "2d"

    log.info "Created WebGL context"

    # Perform rendering setup
    @_gl.clearColor 0.0, 0.0, 0.0, 1.0 # Default to black
    @_gl.enable @_gl.DEPTH_TEST
    @_gl.depthFunc @_gl.LEQUAL

    log.info "Renderer initialized"

    true

  # Returns canvas element
  #
  # @return [Object] canvas
  getCanvas: -> @_canvas

  # Returns canvas rendering context
  #
  # @return [Object] ctx
  getContext: -> @_ctx

  # Returns gl object
  #
  # @return [Object] gl
  getGL: -> @_gl

  # Returns canvas width
  #
  # @return [Number] width
  getWidth: -> @_width

  # Returns canvas height
  #
  # @return [Number] height
  getHeight: -> @_height

  # Returns the clear color
  #
  # @return [AWGLColor3] clearCol
  getClearColor: -> @_clearColor

  # Sets the clear color
  #
  # @overload setClearCol(col)
  #   Set using an AWGLColor3 object
  #   @param [AWGLColor3] col
  #
  # @overload setClearCol(r, g, b)
  #   Set using component values (0.0-1.0 or 0-255)
  #   @param [Number] r red component
  #   @param [Number] g green component
  #   @param [Number] b blue component
  setClearCol: (colOrR, g, b) ->

    if colorOrR instanceof AWGLColor3
      @_clearColor = colOrR
      return
    else

      # Sanity checks
      if colOrR == undefined or colOrR == null then colOrR = 0
      if g == undefined or g == null then g = 0
      if b == undefined or b == null then b = 0

      @_clearColor.setR colOrR
      @_clearColor.setG g
      @_clearColor.setB b

    # Actually set the color if possible
    if @_gl != null
      @_gl.clearColor @_clearColor.getR(true), @_clearColor.getG(true), @_clearColor.getB(true), 1.0

  # Draws a frame
  render: ->

    gl = @_gl # Code asthetics

    # Probably unecessary, but better to be safe
    if gl == undefined or gl == null then return

    # Clear the screen
    gl.clear gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT
