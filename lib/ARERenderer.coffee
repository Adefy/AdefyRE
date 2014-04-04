##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# ARERenderer
#
# @depend objects/AREColor3.coffee
# @depend objects/AREShader.coffee
# @depend shaders.coffee
#
# Keeps track of and renders objects, manages textures, and replicates all the
# necessary functionality from the AdefyLib renderer
class ARERenderer

  ###
  # @type [Number]
  ###
  @_nextID: 0

  ###
  # GL Context
  # @type [Context]
  ###
  @_gl: null

  ###
  # Physics pixel-per-meter ratio
  # @type [Number]
  ###
  @_PPM: 128

  ###
  # Returns PPM ratio
  # @return [Number] ppm pixels-per-meter
  ###
  @getPPM: -> ARERenderer._PPM

  ###
  # Returns MPP ratio
  # @return [Number] mpp meters-per-pixel
  ###
  @getMPP: -> 1.0 / ARERenderer._PPM

  ###
  # Converts screen coords to world coords
  #
  # @param [B2Vec2] v vector in x, y form
  # @return [B2Vec2] ret v in world coords
  ###
  @screenToWorld: (v) ->
    ret = new cp.v
    ret.x = v.x / ARERenderer._PPM
    ret.y = v.y / ARERenderer._PPM
    ret

  ###
  # Converts world coords to screen coords
  #
  # @param [B2Vec2] v vector in x, y form
  # @return [B2Vec2] ret v in screen coords
  ###
  @worldToScreen: (v) ->
    ret = new cp.v
    ret.x = v.x * ARERenderer._PPM
    ret.y = v.y * ARERenderer._PPM
    ret

  ###
  # @property [Array<Object>] actors for rendering
  ###
  @actors: []

  ###
  # @property [Array<Object>] texture objects, with names and gl textures
  ###
  @textures: []

  ###
  # This is a tad ugly, but it works well. We need to be able to create
  # instance objects in the constructor, and provide one resulting object
  # to any class that asks for it, without an instance avaliable. @me is set
  # in the constructor, and an error is thrown if it is not already null.
  #
  # @property [ARERenderer] instance reference, enforced const in constructor
  ###
  @me: null

  ###
  # Signifies the current material; when this doesn't match, a material change
  # is made (different shader program)
  ###
  @_currentMaterial: "none"

  ###
  # @property [Object] camPos Camera position, with x and y keys
  ###
  @camPos:
    x: 0
    y: 0

  ###
  # Renderer Modes
  # 0: null
  #    The null renderer is the same as the canvas renderer, however
  #    it will only clear the screen each tick.
  # 1: canvas
  #    All rendering will be done using the 2d Context
  # 2: wgl
  #    All rendering will be done using WebGL
  ###
  @RENDERER_MODE_NULL: 0
  @RENDERER_MODE_CANVAS: 1
  @RENDERER_MODE_WGL: 2

  @rendererModes: [0, 1, 2]

  ###
  # Render Modes
  ###
  @RENDER_MODE_FILL: 1
  @RENDER_MODE_STROKE: 2
  @RENDER_MODE_FILL_AND_STROKE: 3

  ###
  # @type [Array<Number>]
  ###
  @renderModes: [1, 2, 3]

  ###
  # This denote the rendererMode that is wanted by the user
  # @type [Number]
  ###
  @rendererMode: @RENDERER_MODE_WGL

  ###
  # denotes the currently chosen internal Renderer, this value may be different
  # from the rendererMode, especially if webgl failed to load.
  # @type [Number]
  ###
  @activeRendererMode: null

  ###
  # Should the screen be cleared every frame, or should the engine handle
  # screen clearing. This option is only valid with the WGL renderer mode.
  # @type [Boolean]
  ###
  @alwaysClearScreen: true

  ###
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
  ###
  constructor: (canvasId, @_width, @_height) ->
    canvasId = param.optional canvasId, ""

    @_defaultShader = null  # Default shader used for drawing actors
    @_canvas = null         # HTML <canvas> element
    @_ctx = null            # Drawing context

    @_pickRenderRequested = false   # When true, triggers a pick render

    # Pick render parameters
    @_pickRenderBuff = null          # used for WGL renderer
    @_pickRenderSelectionRect = null # used for canvas renderer
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
    if ARERenderer.me != null
      throw new Error "Only one instance of ARERenderer can be created!"
    else
      ARERenderer.me = @

    @_width = param.optional @_width, 800
    @_height = param.optional @_height, 600

    if @_width <= 1 or @_height <= 1
      throw new Error "Canvas must be at least 2x2 in size"

    # Helper method
    _createCanvas = (parent, id, w, h) ->
      _c = ARERenderer.me._canvas = document.createElement "canvas"
      _c.width = w
      _c.height = h
      _c.id = "are_canvas"

      # TODO: Refactor this, it's terrible
      if parent == "body"
        document.getElementsByTagName(parent)[0].appendChild _c
      else
        document.getElementById(parent).appendChild _c

    # Create a new canvas if no id is supplied
    if canvasId == undefined or canvasId == null

      _createCanvas "body", "are_canvas", @_width, @_height
      ARELog.info "Creating canvas #are_canvas [#{@_width}x#{@_height}]"
      @_canvas = document.getElementById "are_canvas"

    else

      @_canvas = document.getElementById canvasId

      # Create canvas on the body with id canvasId
      if @_canvas == null

        _createCanvas "body", canvasId, @_width, @_height
        ARELog.info "Creating canvas ##{canvasId} [#{@_width}x#{@_height}]"
        @_canvas = document.getElementById canvasId

      else

        # Element exists, see if it is a canvas
        if @_canvas.nodeName.toLowerCase() == "canvas"
          ARELog.warn "Canvas exists, ignoring supplied dimensions"
          @_width = @_canvas.width
          @_height = @_canvas.height
          ARELog.info "Using canvas ##{canvasId} [#{@_width}x#{@_height}]"
        else

          # Create canvas using element as a parent
          _createCanvas canvasId, "are_canvas", @_width, @_height
          ARELog.info "Creating canvas #are_canvas [#{@_width}x#{@_height}]"

    if @_canvas is null
      return ARELog.error "Canvas does not exist!"

    # Initialize Null Context
    switch ARERenderer.rendererMode
      when ARERenderer.RENDERER_MODE_NULL
        @initializeNullContext()

    # Initialize Canvas context
      when ARERenderer.RENDERER_MODE_CANVAS
        @initializeCanvasContext()

    # Initialize GL context
      when ARERenderer.RENDERER_MODE_WGL
        unless @initializeWGLContext(@_canvas)
          ARELog.info "Falling back on regular canvas renderer"
          @initializeCanvasContext()

      else

        ARELog.error "Invalid Renderer #{ARERenderer.rendererMode}"

    ARELog.info "Using the #{ARERenderer.activeRendererMode} renderer mode"

    @switchMaterial "flat"
    @setClearColor 0, 0, 0

  ###
  # Initializes a WebGL renderer context
  # @return [Boolean]
  ###
  initializeWGLContext: (canvas) ->

    ##
    # Grab the webgl context
    options =
      # preserveDrawingBuffer set to false will cause WebGL to clear the
      # screen automatically.
      preserveDrawingBuffer: ARERenderer.alwaysClearScreen
      antialias: true
      alpha: true
      premultipliedAlpha: true
      depth: true
      stencil: false

    gl = canvas.getContext "webgl", options

    # If null, use experimental-webgl
    if gl is null
      ARELog.warn "Continuing with experimental webgl support"
      gl = canvas.getContext "experimental-webgl"

    # If still null, switch to canvas rendering
    if gl is null then return

    ARERenderer._gl = gl

    ARELog.info "Created WebGL context"

    # Perform rendering setup
    gl.enable gl.DEPTH_TEST
    gl.enable gl.BLEND

    gl.depthFunc gl.LEQUAL
    gl.blendFunc gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA

    ARELog.info "Renderer initialized"

    shaders = AREShader.shaders
    wireShader = shaders.wire
    solidShader = shaders.solid
    textureShader = shaders.texture

    @_defaultShader = new AREShader(
      solidShader.vertex,
      solidShader.fragment,
      gl,
      true
    )
    @_defaultShader.generateHandles()

    @_wireShader = new AREShader(
      wireShader.vertex,
      wireShader.fragment,
      gl,
      true
    )
    @_wireShader.generateHandles()

    @_texShader = new AREShader(
      textureShader.vertex,
      textureShader.fragment,
      gl,
      true
    )
    @_texShader.generateHandles()

    ARELog.info "Initialized shaders"

    ARELog.info "ARE WGL initialized"

    ARERenderer.activeRendererMode = ARERenderer.RENDERER_MODE_WGL

    true

  ###
  # Initializes a canvas renderer context
  # @return [Boolean]
  ###
  initializeCanvasContext: ->

    @_ctx = @_canvas.getContext "2d"

    ARELog.info "ARE CTX initialized"

    ARERenderer.activeRendererMode = ARERenderer.RENDERER_MODE_CANVAS

    true

  ###
  # Initializes a null renderer context
  # @return [Boolean]
  ###
  initializeNullContext: ->

    @_ctx = @_canvas.getContext "2d"

    ARELog.info "ARE Null initialized"

    ARERenderer.activeRendererMode = ARERenderer.RENDERER_MODE_NULL

    true

  ###
  # Returns instance (only one may exist, enforced in constructor)
  #
  # @return [ARERenderer] me
  ###
  @getMe: -> ARERenderer.me

  ###
  # Returns the internal default shader
  #
  # @return [AREShader] shader default shader
  ###
  getDefaultShader: -> @_defaultShader

  ###
  # Returns the shader used for wireframe objects
  #
  # @return [AREShader] shader wire shader
  ###
  getWireShader: -> @_wireShader

  ###
  # Returns the shader used for textured objects
  #
  # @return [AREShader] shader texture shader
  ###
  getTextureShader: -> @_texShader

  ###
  # Returns canvas element
  #
  # @return [Object] canvas
  ###
  getCanvas: -> @_canvas

  ###
  # Returns canvas rendering context
  #
  # @return [Object] ctx
  ###
  getContext: -> @_ctx

  ###
  # Returns static gl object
  #
  # @return [Object] gl
  ###
  @getGL: -> ARERenderer._gl

  ###
  # Returns canvas width
  #
  # @return [Number] width
  ###
  getWidth: -> @_width

  ###
  # Returns canvas height
  #
  # @return [Number] height
  ###
  getHeight: -> @_height

  ###
  # Returns the clear color
  #
  # @return [AREColor3] clearCol
  ###
  getClearColor: -> @_clearColor

  ###
  # Sets the clear color
  #
  # @overload setClearCol(col)
  #   Set using an AREColor3 object
  #   @param [AREColor3] col
  #
  # @overload setClearCol(r, g, b)
  #   Set using component values (0.0-1.0 or 0-255)
  #   @param [Number] r red component
  #   @param [Number] g green component
  #   @param [Number] b blue component
  ###
  setClearColor: (colOrR, g, b) ->

    if @_clearColor == undefined then @_clearColor = new AREColor3

    if colOrR instanceof AREColor3
      @_clearColor = colOrR
    else
      @_clearColor.setR colOrR || 0
      @_clearColor.setG g || 0
      @_clearColor.setB b || 0

    if ARERenderer.activeRendererMode == ARERenderer.RENDERER_MODE_WGL
      colOrR = @_clearColor.getR true
      g = @_clearColor.getG true
      b = @_clearColor.getB true
      # Actually set the color if possible
      if ARERenderer._gl != null and ARERenderer._gl != undefined
        ARERenderer._gl.clearColor colOrR, g, b, 1.0
      else
        ARELog.error "Can't set clear color, ARERenderer._gl not valid!"

  ###
  # Request a frame to be rendered for scene picking.
  #
  # @param [FrameBuffer] buffer
  # @param [Method] cb cb to call post-render
  ###
  requestPickingRenderWGL: (buffer, cb) ->
    param.required buffer
    param.required cb

    if @_pickRenderRequested
      ARELog.warn "Pick render already requested! No request queue"
      return

    @_pickRenderBuff = buffer
    @_pickRenderSelectionRect = null
    @_pickRenderCB = cb
    @_pickRenderRequested = true

  ###
  # Request a frame to be rendered for scene picking.
  #
  # @param [Object] selectionRect
  #   @property [Number] x
  #   @property [Number] y
  #   @property [Number] width
  #   @property [Number] height
  # @param [Method] cb cb to call post-render
  ###
  requestPickingRenderCanvas: (selectionRect, cb) ->
    param.required selectionRect
    param.required cb

    if @_pickRenderRequested
      ARELog.warn "Pick render already requested! No request queue"
      return

    @_pickRenderBuff = null
    @_pickRenderSelectionRect = selectionRect
    @_pickRenderCB = cb
    @_pickRenderRequested = true

  ###
  # Draws a using WebGL frame
  # @return [Void]
  ###
  wglRender: ->

    gl = ARERenderer._gl # Code asthetics

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
    # Did you know? WebGL actually clears the screen by itself:
    # if preserveDrawingBuffer is false
    # However a bit of dragging occurs when rendering, probaly some fake
    # motion blur?
    if ARERenderer.alwaysClearScreen
      gl.clear gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT

    # Draw everything!
    for a in ARERenderer.actors

      if @_pickRenderRequested

        # If rendering for picking, we need to temporarily change the color
        # of the actor. Blue key is 248
        _savedColor = a.getColor()

        _id = a.getId() - (Math.floor(a.getId() / 255) * 255)
        _idSector = Math.floor(a.getId() / 255)

        @switchMaterial "flat"

        # Recover id with (_idSector * 255) + _id
        a.setColor _id, _idSector, 248
        a.wglDraw gl
        a.setColor _savedColor

      else

        a = a.updateAttachment()

        if a.getMaterial() != ARERenderer._currentMaterial
          @switchMaterial a.getMaterial()

        a.wglDraw gl

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

  ###
  # Canavs render
  # @return [Void]
  ###
  cvRender: ->
    ctx = @_ctx
    if ctx == undefined or ctx == null then return

    if @_clearColor
      ctx.fillStyle = "rgb#{@_clearColor}"
      ctx.fillRect 0, 0, @_width, @_height
    else
      ctx.clearRect 0, 0, @_width, @_height

    # Draw everything!
    ctx.save()
    # cursed inverted scene!
    ctx.translate 0, @_height
    ctx.scale 1, -1

    for a in ARERenderer.actors
      ctx.save()

      if @_pickRenderRequested
        # If rendering for picking, we need to temporarily change the color
        # of the actor. Blue key is 248
        _savedColor = a.getColor()

        _id = a.getId() - (Math.floor(a.getId() / 255) * 255)
        _idSector = Math.floor(a.getId() / 255)

        @switchMaterial "flat"

        # Recover id with (_idSector * 255) + _id
        a.setColor _id, _idSector, 248
        a.cvDraw ctx
        a.setColor _savedColor

      else
        a = a.updateAttachment()

        if (material = a.getMaterial()) != ARERenderer._currentMaterial
          @switchMaterial material

        a.cvDraw ctx

      ctx.restore()

    ctx.restore()

    # Switch back to a normal rendering mode, and immediately re-render to the
    # actual screen
    if @_pickRenderRequested

      # Call cb
      r = @_pickRenderSelectionRect
      @_pickRenderCB ctx.getImageData(r.x, r.y, r.width, r.height)

      # Unset vars
      @_pickRenderRequested = false
      @_pickRenderBuff = null
      @_pickRenderSelectionRect = null
      @_pickRenderCB = null

      @render()

  ###
  # "No render" function
  # @return [Void]
  ###
  nullRender: ->

    ctx = @_ctx

    if ctx == undefined or ctx == null then return

    if @_clearColor
      ctx.fillStyle = "rgb#{@_clearColor}"
      ctx.fillRect 0, 0, @_canvas.width, @_canvas.height
    else
      ctx.clearRect 0, 0, @_canvas.width, @_canvas.height

    # Draw everything!
    for a in ARERenderer.actors

      a = a.updateAttachment()

      a.nullDraw ctx

  ###
  # main render function
  # @return [Void]
  ###
  render: ->

    switch ARERenderer.activeRendererMode
      when ARERenderer.RENDERER_MODE_NULL
        @nullRender()
      when ARERenderer.RENDERER_MODE_CANVAS
        @cvRender()
      when ARERenderer.RENDERER_MODE_WGL
        @wglRender()

  ###
  # Returns the currently active renderer mode
  # @return [Number] rendererMode
  ###
  getActiveRendererMode: ->
    ARERenderer.activeRendererMode

  ###
  # Is the WebGL renderer active?
  # @return [Boolean] is_active
  ###
  isWGLRendererActive: ->
    @getActiveRendererMode == ARERenderer.RENDERER_MODE_WGL

  ###
  # Is the canvas renderer active?
  # @return [Boolean] is_active
  ###
  isCanvasRendererActive: ->
    @getActiveRendererMode == ARERenderer.RENDERER_MODE_CANVAS

  ###
  # Is the null renderer active?
  # @return [Boolean] is_active
  ###
  isNullRendererActive: ->
    @getActiveRendererMode == ARERenderer.RENDERER_MODE_NULL

  ###
  # Returns a unique id, used by actors
  # @return [Number] id unique id
  ###
  @getNextId: -> ARERenderer._nextID++

  ###
  # Add an actor to our render list. A layer can be optionally specified, at
  # which point it will also be applied to the actor.
  #
  # If no layer is specified, we use the current actor layer (default 0)
  #
  # @param [ARERawActor] actor
  # @param [Number] layer
  # @return [ARERawActor] actor added actor
  ###
  @addActor: (actor, layer) ->
    param.required actor
    layer = param.optional layer, actor.layer

    if actor.layer != layer then actor.layer = layer

    # Find index to insert at to maintain layer order
    layerIndex = _.sortedIndex ARERenderer.actors, actor, "layer"

    # Insert!
    ARERenderer.actors.splice layerIndex, 0, actor

    actor

  ###
  # Remove an actor from our render list by either actor, or id
  #
  # @param [ARERawActor,Number] actor actor, or id of actor to remove
  # @param [Boolean] nodestroy optional, defaults to false
  # @return [Boolean] success
  ###
  @removeActor: (oactor, nodestroy) ->
    param.required oactor
    nodestroy = param.optional nodestroy, false

    # Extract id
    actor = oactor
    if actor instanceof ARERawActor then actor = actor.getId()

    # Attempt to find and remove actor
    for a, i in ARERenderer.actors
      if a.getId() == actor
        ARERenderer.actors.splice i, 1
        if not nodestroy then oactor.destroy()
        return true

    false

  ###
  # Switch material (shader program)
  #
  # @param [String] material
  ###
  switchMaterial: (material) ->
    param.required material

    ##
    # Materials aren't exactly supported in the canvas renderer mode.
    return if ARERenderer.activeRendererMode != ARERenderer.RENDERER_MODE_WGL

    ortho = Matrix4.makeOrtho(0, @_width, 0, @_height, -10, 10).flatten()
    ##
    # Its a "Gotcha" from using EWGL
    ortho[15] = 1.0

    gl = ARERenderer._gl

    return if material == ARERenderer._currentMaterial

    switch material
      when "flat"
        gl.useProgram @_defaultShader.getProgram()

        handles = @_defaultShader.getHandles()
        gl.uniformMatrix4fv handles["uProjection"], false, ortho

        gl.enableVertexAttribArray handles["aPosition"]
        gl.enableVertexAttribArray handles["uColor"]

        ARERenderer._currentMaterial = "flat"

      when "texture"
        gl.useProgram @_texShader.getProgram()

        handles = @_texShader.getHandles()
        gl.uniformMatrix4fv handles["uProjection"], false, ortho
        gl.enableVertexAttribArray handles["aPosition"]
        gl.enableVertexAttribArray handles["aTexCoord"]

        ARERenderer._currentMaterial = "texture"

      else throw new Error "Unknown material #{material}"

  ###
  # Checks if we have a texture loaded
  #
  # @param [String] name texture name to check for
  ###
  @hasTexture: (name) ->
    for t in ARERenderer.textures
      return true if t.name == name

    return false

  ###
  # Fetches a texture by name
  #
  # @param [String] name name of texture to fetch
  # @param [Object] texture
  ###
  @getTexture: (name) ->
    param.required name

    for t in ARERenderer.textures
      return t if t.name == name

    return null

  ###
  # Fetches texture size
  #
  # @param [String] name name of texture
  # @param [Object] size
  ###
  @getTextureSize: (name) ->
    param.required name

    if t = @getTexture(name)
      return { w: t.width, h: t.height }

    return null

  ###
  # Adds a texture to our internal collection
  #
  # @param [Object] texture texture object with name and gl texture
  ###
  @addTexture: (tex) ->
    param.required tex.name
    param.required tex.texture

    ARERenderer.textures.push tex
