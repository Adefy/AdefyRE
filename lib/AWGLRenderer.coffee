# AWGLRenderer
#
# Keeps track of and renders objects, manages textures, and replicates all the
# necessary functionality from the AdefyLib renderer
class AWGLRenderer

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
  constructor: (canvsId, width, height) ->

    ## Private vars
    canvas = null   # HTML <canvas> element
    ctx = null      # Drawing context
    gl = null       # GL context

    # Create a new canvas, or pull it in if provided
    if width is undefined or height is undefined
      canvas = document.createElement "canvas"
      canvas.width = width
      canvas.height = height
    else
      canvas = document.getElementById canvasId

    # Initialize GL context
    try
      gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    catch e
      console.error e
      return false

    if gl is null
      alert "Your browser does not support WebGL!"
      return false

    ##
    ## Accessor functions
    ##
    ## Defined here to make them private, duplicates are defined below
    ## so as to appear in the documentation
    @__getCanvas = -> canvas
    @__getContext = -> canvas.getContext "2d"
    @__getGL = -> gl
    @__getWidth = -> width
    @__getHeight = -> height

    true

  # Returns canvas element
  #
  # @return [Object] canvas
  getCanvas: -> __getCanvas()

  # Returns canvas rendering context
  #
  # @return [Object] ctx
  getContext: -> __getContext()

  # Returns gl object
  #
  # @return [Object] gl
  getGL: -> __getGL()

  # Returns canvas width
  #
  # @return [Number] width
  getWidth: -> __getWidth()

  # Returns canvas height
  #
  # @return [Number] height
  getHeight: -> __getHeight()

  # Draws a frame
  render: ->


