##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# AWGLRenderer
#
# @depend objects/AWGLColor3.coffee
# @depend objects/AWGLShader.coffee
#
# Keeps track of and renders objects, manages textures, and replicates all the
# necessary functionality from the AdefyLib renderer
class AWGLRenderer

  @_nextID: 0

  # GL Context
  @_gl: null

  # Physics pixel-per-meter ratio
  @_PPM: 128

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

  # @property [Array<Object>] texture objects, with names and gl textures
  @textures: []

  # This is a tad ugly, but it works well. We need to be able to create
  # instance objects in the constructor, and provide one resulting object
  # to any class that asks for it, without an instance avaliable. @me is set
  # in the constructor, and an error is thrown if it is not already null.
  #
  # @property [AWGLRenderer] instance reference, enforced const in constructor
  @me: null

  # Signifies the current material; when this doesn't match, a material change
  # is made (different shader program)
  @_currentMaterial: "none"

  # Sets up the renderer, using either an existing canvas or creating a new one
  # If a canvasId is provided but the element is not a canvas, it is treated
  # as a parent. If it is a canvas, it is adopted as our canvas.
  #
  # Bails early if the GL context could not be created
  #
  # @param [String] id canvas id or parent selector
  # @param [Number] width canvas width
  # @param [Number] height canvas height
  # @return [Boolean] success
  constructor: (canvasId, @_width, @_height) ->
    canvasId = param.optional canvasId, ""

    @_defaultShader = null  # Default shader used for drawing actors
    @_canvas = null         # HTML <canvas> element
    @_ctx = null            # Drawing context

    @_pickRenderRequested = false   # When true, triggers a pick render

    # Pick render parameters
    @_pickRenderBuff = null
    @_pickRenderCB = null

    # defined if there was an error during initialization
    @initError = undefined

    # Treat empty canvasId as undefined
    if canvasId.length == 0 then canvasId = undefined

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

    gl = null

    @_width = param.optional @_width, 800
    @_height = param.optional @_height, 600

    if @_width <= 1 or @_height <= 1
      throw new Error "Canvas must be at least 2x2 in size"

    # Helper method
    _createCanvas = (parent, id, w, h) ->
      _c = AWGLRenderer.me._canvas = document.createElement "canvas"
      _c.width = w
      _c.height = h
      _c.id = "awgl_canvas"

      # TODO: Refactor this, it's terrible
      if parent == "body"
        document.getElementsByTagName(parent)[0].appendChild _c
      else
        document.getElementById(parent).appendChild _c

    # Create a new canvas if no id is supplied
    if canvasId == undefined or canvasId == null

      _createCanvas "body", "awgl_canvas", @_width, @_height
      AWGLLog.info "Creating canvas #awgl_canvas [#{@_width}x#{@_height}]"

    else
      @_canvas = document.getElementById canvasId

      # Create canvas on the body with id canvasId
      if @_canvas == null
        _createCanvas "body", canvasId, @_width, @_height
        AWGLLog.info "Creating canvas ##{canvasId} [#{@_width}x#{@_height}]"
      else

        # Element exists, see if it is a canvas
        if @_canvas.nodeName.toLowerCase() == "canvas"
          AWGLLog.warn "Canvas exists, ignoring supplied dimensions"
          @_width = @_canvas.width
          @_height = @_canvas.height
          AWGLLog.info "Using canvas ##{canvasId} [#{@_width}x#{@_height}]"
        else

          # Create canvas using element as a parent
          _createCanvas canvasId, "awgl_canvas", @_width, @_height
          AWGLLog.info "Creating canvas #awgl_canvas [#{@_width}x#{@_height}]"

    # Initialize GL context
    gl = @_canvas.getContext("webgl")

    # If null, use experimental-webgl
    if gl is null
      AWGLLog.warn "Continuing with experimental webgl support"
      gl = @_canvas.getContext("experimental-webgl")

    # If still null, FOL
    if gl is null
      alert "Your browser does not support WebGL!"
      @initError = "Your browser does not support WebGL!"
      return

    AWGLRenderer._gl = gl
    @_ctx = @_canvas.getContext "2d"

    AWGLLog.info "Created WebGL context"

    # Perform rendering setup
    gl.enable gl.DEPTH_TEST
    gl.enable gl.BLEND

    gl.depthFunc gl.LEQUAL
    gl.blendFunc gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA

    AWGLLog.info "Renderer initialized"

    ## Shaders for shapes with solid colors
    vertSrc_Solid = """
      attribute vec2 Position;

      uniform mat4 Projection;
      uniform mat4 ModelView;

      void main() {
        mat4 mvp = Projection * ModelView;
        gl_Position = mvp * vec4(Position, 1, 1);
      }

    """

    fragSrc_Solid = """
      precision mediump float;
      uniform vec4 Color;

      void main() {
        gl_FragColor = Color;
      }

    """

    ## Shaders for textured objects
    vertSrc_Tex = """
      attribute vec2 Position;
      attribute vec2 aTexCoord;

      uniform mat4 Projection;
      uniform mat4 ModelView;

      varying highp vec2 vTexCoord;

      void main() {
        gl_Position = Projection * ModelView * vec4(Position, 1, 1);
        vTexCoord = aTexCoord;
      }

    """

    fragSrc_Tex = """
      precision highp float;

      varying highp vec2 vTexCoord;
      uniform sampler2D uSampler;

      void main() {
        gl_FragColor = texture2D(uSampler, vTexCoord);
      }

    """

    @_defaultShader = new AWGLShader vertSrc_Solid, fragSrc_Solid, gl, true
    @_defaultShader.generateHandles()

    @_texShader = new AWGLShader vertSrc_Tex, fragSrc_Tex, gl, true
    @_texShader.generateHandles()

    AWGLLog.info "Initialized shaders"

    @switchMaterial "flat"

    @setClearColor 0, 0, 0

  # Returns instance (only one may exist, enforced in constructor)
  #
  # @return [AWGLRenderer] me
  @getMe: -> AWGLRenderer.me

  # Returns the internal default shader
  #
  # @return [AWGLShader] shader default shader
  getDefaultShader: -> @_defaultShader

  # Returns the shader used for textured objects
  #
  # @return [AWGLShader] shader texture shader
  getTextureShader: -> @_texShader

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

    if @_clearColor == undefined then @_clearColor = new AWGLColor3

    if colOrR instanceof AWGLColor3
      @_clearColor = colOrR
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
    if AWGLRenderer._gl != null and AWGLRenderer._gl != undefined
      AWGLRenderer._gl.clearColor colOrR, g, b, 1.0
    else
      AWGLLog.error "Can't set clear color, AWGLRenderer._gl not valid!"

  # Request a frame to be rendered for scene picking.
  #
  # @param [FrameBuffer] buffer
  # @param [Method] cb cb to call post-render
  requestPickingRender: (buffer, cb) ->
    param.required buffer
    param.required cb

    if @_pickRenderRequested
      AWGLLog.warn "Pick render already requested! No request queue"
      return

    @_pickRenderBuff = buffer
    @_pickRenderCB = cb
    @_pickRenderRequested = true

  # Draws a frame
  render: ->

    gl = AWGLRenderer._gl # Code asthetics

    # Probably unecessary, but better to be safe
    if gl == undefined or gl == null then return

    # Render to an off-screen buffer for screen picking if requested to do so.
    # The resulting render is used to pick visible objects. We render in a
    # special manner, by overriding object colors. Every object is rendered
    # with a special blue component value, followed by red and green values
    # denoting its position in our actor array. Not that this is NOT its' id!
    #
    # Since picking relies upon predictable colors, we render without textures
    if @_pickRenderRequested
      gl.bindFramebuffer gl.FRAMEBUFFER, @_pickRenderBuff

    # Clear the screen
    gl.clear gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT

    # Draw everything!
    for a in AWGLRenderer.actors

      if @_pickRenderRequested

        # If rendering for picking, we need to temporarily change the color
        # of the actor. Blue key is 248
        _savedColor = a.getColor()

        _id = a.getId() - (Math.floor(a.getId() / 255) * 255)
        _idSector = Math.floor(a.getId() / 255)

        @switchMaterial "flat"

        # Recover id with (_idSector * 255) + _id
        a.setColor _id, _idSector, 248
        a.draw gl
        a.setColor _savedColor

      else

        # Check if we have a visible attached texture.
        # If so, set properties and draw
        if a.hasAttachment() and a.getAttachment().visible

          # Get physics updates
          a.updatePosition()

          # Setup anchor point
          pos = a.getPosition()
          rot = a.getRotation()

          pos.x += a.attachedTextureAnchor.x
          pos.y += a.attachedTextureAnchor.y
          rot += a.attachedTextureAnchor.angle

          # Switch to attached texture
          a = a.getAttachment()

          # Apply state update
          a.setPosition pos
          a.setRotation rot

        if a.getMaterial() != AWGLRenderer._currentMaterial
          @switchMaterial a.getMaterial()

        a.draw gl

    # Switch back to a normal rendering mode, and immediately re-render to the
    # actual screen
    if @_pickRenderRequested

      # Call cb
      @_pickRenderCB()

      # Unset vars
      @_pickRenderRequested = false
      @_pickRenderBuff = null
      @_pickRenderCB = null

      # Switch back to normal framebuffer, re-render
      gl.bindFramebuffer gl.FRAMEBUFFER, null
      @render()

  # Returns a unique id, used by actors
  # @return [Number] id unique id
  @getNextId: -> AWGLRenderer._nextID++

  # Add an actor to our render list. A layer can be optionally specified, at
  # which point it will also be applied to the actor.
  #
  # If no layer is specified, we use the current actor layer (default 0)
  #
  # @param [AWGLActor] actor
  # @param [Number] layer
  # @return [AWGLActor] actor added actor
  @addActor: (actor, layer) ->
    param.required actor
    layer = param.optional layer, actor.layer

    if actor.layer != layer then actor.layer = layer

    # Find index to insert at to maintain layer order
    layerIndex = _.sortedIndex AWGLRenderer.actors, actor, "layer"

    # Insert!
    AWGLRenderer.actors.splice layerIndex, 0, actor

    actor

  # Remove an actor from our render list by either actor, or id
  #
  # @param [AWGLActor,Number] actor actor, or id of actor to remove
  # @return [Boolean] success
  @removeActor: (actor) ->
    param.required actor

    # Extract id
    if actor instanceof AWGLActor then actor = actor.getId()

    # Attempt to find and remove actor
    for a, i in AWGLRenderer.actors
      if a.getId() == actor
        AWGLRenderer.actors.splice i, 1
        return true

    false

  # Switch material (shader program)
  #
  # @param [String] material
  switchMaterial: (material) ->
    param.required material

    ortho = makeOrtho(0, @_width, 0, @_height, -10, 10).flatten()
    gl = AWGLRenderer._gl

    if material == AWGLRenderer._currentMaterial then return
    else if material == "flat"
      gl.useProgram @_defaultShader.getProgram()

      handles = @_defaultShader.getHandles()
      gl.uniformMatrix4fv handles["Projection"], false, ortho

      gl.enableVertexAttribArray handles["Position"]
      gl.enableVertexAttribArray handles["Color"]

      AWGLRenderer._currentMaterial = "flat"

    else if material == "texture"
      gl.useProgram @_texShader.getProgram()

      handles = @_texShader.getHandles()
      gl.uniformMatrix4fv handles["Projection"], false, ortho

      gl.enableVertexAttribArray handles["Position"]
      gl.enableVertexAttribArray handles["aTexCoord"]

      AWGLRenderer._currentMaterial = "texture"

    else throw new Error "Unknown material #{material}"

  # Checks if we have a texture loaded
  #
  # @param [String] name texture name to check for
  @hasTexture: (name) ->
    for t in AWGLRenderer.textures
      if t.name == name then return true
    return false

  # Fetches a texture by name
  #
  # @param [String] name name of texture to fetch
  @getTexture: (name) ->
    for t in AWGLRenderer.textures
      if t.name == name then return t.texture
    return null

  # Adds a texture to our internal collection
  #
  # @param [Object] texture texture object with name and gl texture
  @addTexture: (tex) ->
    param.required tex.name
    param.required tex.texture

    AWGLRenderer.textures.push tex