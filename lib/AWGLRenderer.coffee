# AWGLRenderer
#
# @depend objects/AWGLColor3.coffee
#
# Keeps track of and renders objects, manages textures, and replicates all the
# necessary functionality from the AdefyLib renderer
class AWGLRenderer

  @defaultVertShaderSrc: "" +
    "attribute vec3 Position;" +
    "uniform mat4 Projection;" +
    "uniform mat4 ModelView;" +
    "void main() {" +
    "  mat4 mvp = Projection * ModelView;" +
    "  gl_Position = mvp * vec4(Position.xy, 1, 1);" +
    "}\n";

  @defaultFragShaderSrc: "" +
    "precision mediump float;" +
    "uniform vec4 Color;" +
    "void main() {" +
    "  gl_FragColor = Color;" +
    "}\n";

  @defaultVertShader: null
  @defaultFragShader: null

  @defaultShaderProg: null

  @attrVertPosition: null
  @attrModelView: null
  @attrProjection: null
  @attrColor: null

  _canvas: null     # HTML <canvas> element
  _ctx: null        # Drawing context
  _clearColor: null # blanking color
  @_nextID: 0

  @_gl: null        # GL context
  @_PPM: 128        # Physics pixel-per-meter ratio

  # Returns PPM ratio
  # @return [Number] ppm pixels-per-meter
  @getPPM: -> AWGLRenderer._PPM

  # Returns MPP ratio
  # @return [Number] mpp meters-per-pixel
  @getMPP: -> 1.0 / AWGLRenderer._PPM

  # Converts screen coords to world coords
  #
  # @param [B2Vec2] v vector in x, y form
  # @return [B2Vec2] ret v in world coords
  @screenToWorld: (v) ->
    ret = new cp.v
    ret.x = v.x / AWGLRenderer._PPM
    ret.y = v.y / AWGLRenderer._PPM
    ret

  # Converts world coords to screen coords
  #
  # @param [B2Vec2] v vector in x, y form
  # @return [B2Vec2] ret v in screen coords
  @worldToScreen: (v) ->
    ret = new cp.v
    ret.x = v.x * AWGLRenderer._PPM
    ret.y = v.y * AWGLRenderer._PPM
    ret

  # @property [Array<Object>] actors for rendering
  @actors: []

  # @property [String] Defined if there was an error during initialization
  initError: undefined

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

    log = AWGLEngine._log
    gl = null

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
      gl = @_canvas.getContext("webgl") || @_canvas.getContext("experimental-webgl")
    catch e
      console.error e
      @initSuccess = e
      return

    if gl is null
      alert "Your browser does not support WebGL!"
      @initError = "Your browser does not support WebGL!"
      return

    AWGLRenderer._gl = gl
    @_ctx = @_canvas.getContext "2d"

    log.info "Created WebGL context"

    # Perform rendering setup
    gl.clearColor 0.0, 0.0, 0.0, 1.0 # Default to black
    gl.enable gl.DEPTH_TEST
    gl.depthFunc gl.LEQUAL

    log.info "Renderer initialized"

    ## Shaders
    # Create them
    AWGLRenderer.defaultVertShader = gl.createShader gl.VERTEX_SHADER
    AWGLRenderer.defaultFragShader = gl.createShader gl.FRAGMENT_SHADER

    # Grab shader source
    gl.shaderSource AWGLRenderer.defaultVertShader, AWGLRenderer.defaultVertShaderSrc
    gl.shaderSource AWGLRenderer.defaultFragShader, AWGLRenderer.defaultFragShaderSrc

    # Compile shaders
    gl.compileShader AWGLRenderer.defaultVertShader
    gl.compileShader AWGLRenderer.defaultFragShader

    if !gl.getShaderParameter(AWGLRenderer.defaultVertShader, gl.COMPILE_STATUS)
      log.error "Unable to compile shader: #{gl.getShaderInfoLog(AWGLRenderer.defaultVertShader)}"

    if !gl.getShaderParameter(AWGLRenderer.defaultFragShader, gl.COMPILE_STATUS)
      log.error "Unable to compile shader: #{gl.getShaderInfoLog(AWGLRenderer.defaultFragShader)}"

    # Link into program
    AWGLRenderer.defaultShaderProg = gl.createProgram()
    gl.attachShader AWGLRenderer.defaultShaderProg, AWGLRenderer.defaultVertShader
    gl.attachShader AWGLRenderer.defaultShaderProg, AWGLRenderer.defaultFragShader
    gl.linkProgram AWGLRenderer.defaultShaderProg

    # Check for errors
    if !gl.getProgramParameter(AWGLRenderer.defaultShaderProg, gl.LINK_STATUS)
      log.error "Unable to link shader program"

    # Use program
    gl.useProgram AWGLRenderer.defaultShaderProg

    # Grab handles
    AWGLRenderer.attrVertPosition = gl.getAttribLocation AWGLRenderer.defaultShaderProg, "Position"

    AWGLRenderer.attrModelView = gl.getUniformLocation AWGLRenderer.defaultShaderProg, "ModelView";

    AWGLRenderer.attrProjection = gl.getUniformLocation AWGLRenderer.defaultShaderProg, "Projection";

    AWGLRenderer.attrColor = gl.getUniformLocation AWGLRenderer.defaultShaderProg, "Color";

    gl.enableVertexAttribArray AWGLRenderer.attrVertPosition
    gl.enableVertexAttribArray AWGLRenderer.attrVertColor

    # Set up projection
    gl.uniformMatrix4fv AWGLRenderer.attrProjection, false, makeOrtho(0, @_width, 0, @_height, -10, 10).flatten()

    log.info "Initialized shaders"

  # Returns canvas element
  #
  # @return [Object] canvas
  getCanvas: -> @_canvas

  # Returns canvas rendering context
  #
  # @return [Object] ctx
  getContext: -> @_ctx

  # Returns static gl object
  #
  # @return [Object] gl
  @getGL: -> AWGLRenderer._gl

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
  setClearColor: (colOrR, g, b) ->

    if colOrR instanceof AWGLColor3
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
    if @_gl != null and @_gl != undefined
      @_gl.clearColor @_clearColor.getR(true), @_clearColor.getG(true), @_clearColor.getB(true), 1.0

  # Draws a frame
  render: ->

    gl = AWGLRenderer._gl # Code asthetics

    # Probably unecessary, but better to be safe
    if gl == undefined or gl == null then return

    # Clear the screen
    gl.clear gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT

    # Draw everything!
    for a in AWGLRenderer.actors
      a.draw gl

  # Returns a unique id, used by actors
  # @return [Number] id unique id
  @getNextId: -> AWGLRenderer._nextID++
