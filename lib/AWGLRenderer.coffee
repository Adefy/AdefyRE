# AWGLRenderer
#
# Keeps track of and renders objects, manages textures, and replicates all the
# necessary functionality from the AdefyLib renderer
class AWGLRenderer

  _canvas: null   # HTML <canvas> element
  _ctx: null      # Drawing context
  _gl: null       # GL context

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
  constructor: (canvsId, @_width, @_height) ->


    # Create a new canvas, or pull it in if provided
    if @_width is undefined or @_height is undefined
      @_canvas = document.createElement "canvas"
      @_canvas.width = @_width
      @_canvas.height = @_height
    else
      @_canvas = document.getElementById canvasId

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

  # Draws a frame
  render: ->


