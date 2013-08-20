# AWGLRenderer
#
# @depend objects/AWGLColor3.coffee
# @depend objects/AWGLShader.coffee
#
# Keeps track of and renders objects, manages textures, and replicates all the
# necessary functionality from the AdefyLib renderer
class AWGLRenderer

  _defaultShader: null  # Default shader used for drawing actors
  _canvas: null         # HTML <canvas> element
  _ctx: null            # Drawing context
  _clearColor: null     # blanking color
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

  # @property [String] defined if there was an error during initialization
  initError: undefined

  # This is a tad ugly, but it works well. We need to be able to create
  # instance objects in the constructor, and provide one resulting object
  # to any class that asks for it, without an instance avaliable. @me is set
  # in the constructor, and an error is thrown if it is not already null.
  #
  # @property [AWGLRenderer] instance reference, enforced const in constructor
  @me: null

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

    # Two renderers cannot exist at the same time, or else we lose track of
    # the default shaders actor-side. Specifically, we grab the default shader
    # from the @me object, and if it ever changes, future actors will switch
    # to the new @me, without any warning. Blegh.
    #
    # TODO: fugly
    if AWGLRenderer.me != null
      throw new Error "Only one instance of AWGLRenderer can be created!"
    else
      AWGLRenderer.me = @

    log = AWGLEngine._log
    gl = null

    @_width = AWGLUtil.param @_width, 800, false, "Using width of 800"
    @_height = AWGLUtil.param @_height, 600, false, "Using height of 600"

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
    gl = @_canvas.getContext("webgl")

    # If null, use experimental-webgl
    if gl is null
      log.warn "Continuing with experimental webgl support"
      gl = @_canvas.getContext("experimental-webgl")

    # If still null, FOL
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
    vertSrc = "" +
      "attribute vec3 Position;" +
      "uniform mat4 Projection;" +
      "uniform mat4 ModelView;" +
      "void main() {" +
      "  mat4 mvp = Projection * ModelView;" +
      "  gl_Position = mvp * vec4(Position.xy, 1, 1);" +
      "}\n"

    fragSrc = "" +
      "precision mediump float;" +
      "uniform vec4 Color;" +
      "void main() {" +
      "  gl_FragColor = Color;" +
      "}\n"

    @_defaultShader = new AWGLShader vertSrc, fragSrc, gl, true
    @_defaultShader.generateHandles()
    handles = @_defaultShader.getHandles()

    # Use program
    gl.useProgram @_defaultShader.getProgram()

    gl.enableVertexAttribArray AWGLRenderer.attrVertPosition
    gl.enableVertexAttribArray AWGLRenderer.attrVertColor

    # Set up projection
    ortho = makeOrtho(0, @_width, 0, @_height, -10, 10).flatten()
    gl.uniformMatrix4fv handles["Projection"], false, ortho

    log.info "Initialized shaders"

  # Returns instance (only one may exist, enforced in constructor)
  #
  # @return [AWGLRenderer] me
  @getMe: -> AWGLRenderer.me

  # Returns the internal default shader
  #
  # @return [AWGLShader] shader default shader
  getDefaultShader: -> @_defaultShader

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

    # Serves to apply bounds checks automatically
    colOrR = @_clearColor.getR true
    g = @_clearColor.getG true
    b = @_clearColor.getB true

    # Actually set the color if possible
    if @_gl != null and @_gl != undefined
      @_gl.clearColor colOrR, g, b, 1.0

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
