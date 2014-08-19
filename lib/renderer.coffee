# ARERenderer
#
# @depend objects/color3.coffee
# @depend objects/shader.coffee
# @depend objects/vector2.coffee
# @depend shaders.coffee
#
# Keeps track of and renders objects, manages textures, and replicates all the
# necessary functionality from the AdefyLib renderer
class ARERenderer

  ###
  # Renderer Modes
  # 0: null
  #    The null renderer is the same as the canvas renderer, however
  #    it will only clear the screen each tick.
  # 1: canvas
  #    All rendering will be done using the 2d Context
  # 2: wgl
  #    All rendering will be done using WebGL
  # @enum
  ###
  @RENDER_MODE_NULL: 0
  @RENDER_MODE_CANVAS: 1
  @RENDER_MODE_WGL: 2

  ###
  # Render Modes
  # This affects the method GL will use to render a WGL element
  # @enum
  ###
  @GL_MODE_LINE_LOOP: 0
  @GL_MODE_TRIANGLE_FAN: 1
  @GL_MODE_TRIANGLE_STRIP: 2

  ###
  # A render style determines how a canvas element is drawn, this can
  # also be used for WebGL elements as well, as they fine tune the drawing
  # process.

  # STROKE will work with all RENDER_MODE*.
  # FILL will work with GL_MODE_TRIANGLE_FAN and
  # GL_MODE_TRIANGLE_STRIP only.
  # FILL_AND_STROKE will work with all current render modes, however
  # GL_MODE_LINE_LOOP will only use STROKE
  # @enum
  ###
  @RENDER_STYLE_STROKE: 1
  @RENDER_STYLE_FILL: 2
  @RENDER_STYLE_FILL_AND_STROKE: 3

  ###
  # Render Modes
  # This affects the method GL will use to render a WGL element
  # @enum
  ###
  @MATERIAL_NONE: "none"
  @MATERIAL_FLAT: "flat"
  @MATERIAL_TEXTURE: "texture"

  ###
  # Sets up the renderer, using either an existing canvas or creating a new one
  # If a canvasId is provided but the element is not a canvas, it is treated
  # as a parent. If it is a canvas, it is adopted as our canvas.
  #
  # Bails early if the GL context could not be created
  #
  # @param [Object] options renderer initialization options
  # @option options [String] canvasId canvas id or parent selector
  # @option options [Number] width canvas width
  # @option options [Number] height canvas height
  # @option options [Number] renderMode optional render mode, defaults to WebGL
  # @option options [Boolean] antialias default true
  # @option options [Boolean] alpha default true
  # @option options [Boolean] premultipliedAlpha default true
  # @option options [Boolean] depth default true
  # @option options [Boolean] stencil default false
  # @option options [Boolean] preserveDrawingBuffer manual clears, default false
  #
  # @return [Boolean] success
  ###
  constructor: (opts) ->
    @_width = param.required opts.width
    @_height = param.required opts.height
    canvasId = opts.canvasId or ""
    renderMode = opts.renderMode or ARERenderer.RENDER_MODE_WGL

    opts.premultipliedAlpha ||= true
    opts.antialias ||= true
    opts.alpha ||= true
    opts.depth ||= true
    opts.stencil ||= false
    @_alwaysClearScreen = !!opts.preserveDrawingBuffer

    @_nextID = 0            # Counter we use for unique actor Ids
    @_defaultShader = null  # Default shader used for drawing actors
    @_canvas = null         # HTML <canvas> element
    @_ctx = null            # Canvas drawing context
    @_gl = null             # WebGL drawing context
    @_actors = []           # Internal actors collection
    @_actor_hash = {}       # Actors keyed by id for faster access
    @_textures = []         # Texture objects, with names and gl textures
    @_culling = false       # Whether we cull off-screen actors

    @_currentMaterial = "none" # When this changes, the shader program changes
    @_activeRendererMode = null
    @_cameraPosition = x: 0, y: 0
    @_zoomFactor = 1

    # Pick render parameters
    @_pickRenderRequested = false    # When true, triggers a pick render
    @_pickRenderBuff = null          # Used for WGL renderer
    @_pickRenderSelectionRect = null # Used for canvas renderer
    @_pickRenderCB = null            # Callback for successful pick render

    @_clearColor = new AREColor3 255, 255, 255

    # Helper method
    _createCanvas = (parent, id) =>
      @_canvas = document.createElement "canvas"
      @_canvas.width = @_width
      @_canvas.height = @_height
      @_canvas.id = id

      # Try both selector and id
      parentElm = document.querySelector parent
      parentElm ||= document.getElementById parent

      parentElm.appendChild @_canvas
      ARELog.info "Creating canvas ##{id} [#{@_width}x#{@_height}] <#{parent}>"

    # Create a new canvas if no id is supplied
    if !canvasId
      _createCanvas "body", "are_anvas"

    # Attempt to use existing canvas
    else
      @_canvas = document.getElementById canvasId

      # Canvas not found
      if !@_canvas
        _createCanvas "body", canvasId

      # Canvas found, validate
      else

        if @_canvas.nodeName.toLowerCase() == "canvas"
          @_canvas.width = @_width
          @_canvas.height = @_height

        # Create canvas using element as a parent
        else
          _createCanvas canvasId, "are_canvas"

    throw new Error "Failed to create or find suitable canvas!" if !@_canvas

    switch renderMode
      when ARERenderer.RENDER_MODE_NULL
        @_initializeNullRendering()

      when ARERenderer.RENDER_MODE_CANVAS
        @_initializeCanvasRendering()

      when ARERenderer.RENDER_MODE_WGL
        unless @_initializeWebGLRendering opts
          ARELog.info "Falling back on regular canvas renderer"
          @_initializeCanvasRendering()

      else throw new Error "Invalid Renderer #{rendererMode}"

    ARELog.info "Using the #{@_activeRendererMode} renderer mode"

    @setClearColor 255, 255, 255
    @switchMaterial ARERenderer.MATERIAL_FLAT

  ###
  # Initializes a WebGL renderer context
  #
  # @return [Boolean] success
  ###
  _initializeWebGLRendering: (options) ->

    @_gl = @_canvas.getContext "webgl", options

    if !@_gl
      ARELog.warn "Continuing with experimental webgl support"
      @_gl = @_canvas.getContext "experimental-webgl", options

    if !@_gl
      ARELog.warn "Failed to obtain WebGL context"
      return false

    ARELog.info "Obtained WebGL context"

    # Perform rendering setup
    @_gl.enable @_gl.DEPTH_TEST
    @_gl.enable @_gl.BLEND

    @_gl.depthFunc @_gl.LEQUAL
    @_gl.blendFunc @_gl.SRC_ALPHA, @_gl.ONE_MINUS_SRC_ALPHA

    r = @_clearColor.getR true
    g = @_clearColor.getG true
    b = @_clearColor.getB true
    @_gl.clearColor r, g, b, 1.0

    shaders = AREShader.shaders
    wireShader = shaders.wire
    solidShader = shaders.solid
    textureShader = shaders.texture

    @_defaultShader = new AREShader(
      solidShader.vertex,
      solidShader.fragment,
      @_gl,
      true
    )
    @_defaultShader.generateHandles()

    @_wireShader = new AREShader(
      wireShader.vertex,
      wireShader.fragment,
      @_gl,
      true
    )
    @_wireShader.generateHandles()

    @_texShader = new AREShader(
      textureShader.vertex,
      textureShader.fragment,
      @_gl,
      true
    )
    @_texShader.generateHandles()

    ARELog.info "Initialized shaders"

    @_activeRendererMode = ARERenderer.RENDER_MODE_WGL
    @render = @_wglRender

    # VBO. We merge all actor vertex data into a single VBO for faster rendering
    @_pendingVBORefresh = false
    @_vertexDataBuffer = @_gl.createBuffer()
    @requestVBORefresh()

    ARELog.info "WebgL renderer initialized"
    true

  ###
  # Initializes a canvas renderer context
  #
  # @return [Boolean]
  ###
  _initializeCanvasRendering: ->
    @_ctx = @_canvas.getContext "2d"

    @_activeRendererMode = ARERenderer.RENDER_MODE_CANVAS
    @render = @_cvRender

    ARELog.info "Canvas renderer initialized"
    true

  ###
  # Initializes a null renderer context
  # @return [Boolean]
  ###
  _initializeNullRendering: ->
    @_ctx = @_canvas.getContext "2d"

    @_activeRendererMode = ARERenderer.RENDER_MODE_NULL
    @render = @_nullRender

    ARELog.info "Null renderer initialized"
    true

  ###
  # Render method set by our mode, so we don't have to iterate over a
  # switch-case on each render call.
  #
  # Renders a frame, needs to be set in our constructor, by one of the init
  # methods.
  ###
  render: ->

  enableCulling: ->
    @_culling = true
    @

  disableCulling: ->
    @_culling = false
    @

  ###
  # Called once per frame, we perform various internal updates if needed
  ###
  update: ->

    # Delete pending actors
    deletedActors = _.remove @_actors, (a) -> a.flaggedForDeletion()
    a.rendererActorDelete() for a in deletedActors

    # Regenerate VBO
    if @_pendingVBORefresh and @isWGLRendererActive()

      currentOffset = 0
      indices = []
      compiledVertices = []
      totalVertCount = 0
      for actor in @_actors
        if actor.hasOwnIndiceBuffer()
          totalVertCount += actor.getRawVertexData().length

      VBOData = new Float32Array totalVertCount

      # Go through and build up an array of vertex data, passing correct indices
      for actor in @_actors
        if actor.hasOwnIndiceBuffer()
          vData = actor.getRawVertexData()

          # Generate indices
          indices = []
          for i in [0...vData.length / 4]

            baseIndex = currentOffset + i
            indices.push baseIndex

            # Faster references into arrays
            absBaseIndex = baseIndex * 4
            absI = i * 4

            VBOData[absBaseIndex] = vData[absI]
            VBOData[absBaseIndex + 1] = vData[absI + 1]
            VBOData[absBaseIndex + 2] = vData[absI + 2]
            VBOData[absBaseIndex + 3] = vData[absI + 3]

          currentOffset += vData.length / 4
          actor.updateIndices indices

      # Upload new VBO
      # NOTE! We leave the buffer bound for rendering, no other array buffer is
      # ever bound!
      @_gl.bindBuffer @_gl.ARRAY_BUFFER, @_vertexDataBuffer
      @_gl.bufferData @_gl.ARRAY_BUFFER, VBOData, @_gl.STATIC_DRAW

      @_pendingVBORefresh = false

  ###
  # Request VBO regeneration to be performed on next update
  ###
  requestVBORefresh: ->
    @_pendingVBORefresh = true

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
  # @param [Object] position hash with x, y values
  ###
  setCameraPosition: (@_cameraPosition) ->

  ###
  # @return [Object] position hash with x, y values
  ###
  getCameraPosition: ->
    {
      x: @_cameraPosition.x
      y: @_cameraPosition.y
    }

  ###
  # Sets a new zoom factor, and triggers a viewport refresh!
  #
  # @param [Number] zoom
  ###
  setCameraZoom: (@_zoomFactor) ->
    return unless shader = @getShaderForMaterial @_currentMaterial
    @refreshViewport shader

  ###
  # @return [Number] zoom
  ###
  getCameraZoom: -> @_zoomFactor

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
    @_clearColor = new AREColor3 if !@_clearColor

    if colOrR instanceof AREColor3
      @_clearColor = colOrR
    else
      @_clearColor.setR colOrR || 0
      @_clearColor.setG g || 0
      @_clearColor.setB b || 0

    if @_activeRendererMode == ARERenderer.RENDER_MODE_WGL
      r = @_clearColor.getR true
      g = @_clearColor.getG true
      b = @_clearColor.getB true

      # Actually set the color if possible
      @_gl.clearColor r, g, b, 1.0 if !!@_gl

    @

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
      return ARELog.warn "Pick render already requested! No request queue"

    @_pickRenderBuff = buffer
    @_pickRenderSelectionRect = null
    @_pickRenderCB = cb
    @_pickRenderRequested = true

    @

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
      return ARELog.warn "Pick render already requested! No request queue"

    @_pickRenderBuff = null
    @_pickRenderSelectionRect = selectionRect
    @_pickRenderCB = cb
    @_pickRenderRequested = true

    @

  ###
  # Draws a using WebGL frame
  # @return [Void]
  # @private
  ###
  _wglRender: ->
    gl = @_gl # Local var is faster

    # Render to an off-screen buffer for screen picking if requested to do so.
    # The resulting render is used to pick visible objects. We render in a
    # special manner, by overriding object colors. Every object is rendered
    # with a special blue component value, followed by red and green values
    # denoting its position in our actor array. Not that this is NOT its' id!
    #
    # Since picking relies upon predictable colors, we render without textures
    if @_pickRenderRequested
      gl.bindFramebuffer gl.FRAMEBUFFER, @_pickRenderBuff

    # Did you know? If preserveDrawingBuffer is false WebGL clears the screen
    # by itself.
    # 
    # However a bit of dragging occurs when rendering, probaly some fake motion
    # blur?
    #
    # Get rid of this and manually request clears from the editor when hiding
    # actors.
    if @_alwaysClearScreen
      gl.clear gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT

    # Draw everything!
    actorCount = @_actors.length
    actorIterator = @_actors.length

    ##
    ## We use the fancy while loops to decrement on each count, as apparently
    ## it's faster than a full blown for-loop. Since we can't iterate backwards,
    ## we do some subtraction magic to get an ascending indice
    ##

    if @_pickRenderRequested
      while actorIterator--
        a = @_actors[actorCount - actorIterator - 1]

        if a._visible
          a_id = a._id

          # Change the color for picking. Blue key is 248
          _savedColor = r: a._color._r, g: a._color._g, b: a._color._b
          _savedOpacity = a._opacity

          _id = a_id - (Math.floor(a_id / 255) * 255)
          _idSector = Math.floor a_id / 255

          @switchMaterial ARERenderer.MATERIAL_FLAT

          # Recover id with (_idSector * 255) + _id
          a.setColor _id, _idSector, 248
          a.setOpacity 1.0
          a.wglDraw gl, @_defaultShader
          a.setColor _savedColor.r, _savedColor.g, _savedColor.b
          a.setOpacity _savedOpacity

      @_pickRenderCB()
      @_pickRenderRequested = false
      @_pickRenderBuff = null
      @_pickRenderCB = null

      # Switch back to normal framebuffer, re-render true frame
      gl.bindFramebuffer gl.FRAMEBUFFER, null
      @render()

    else

      windowWidth_h = window.innerWidth * @_zoomFactor * 0.5
      windowHeight_h = window.innerHeight * @_zoomFactor * 0.5
      leftEdge = rightEdge = topEdge = bottomEdge = true
      camPos = @_cameraPosition

      while actorIterator--
        a = @_actors[actorCount - actorIterator - 1]

        if a._visible

          # Only draw if the actor is visible onscreen
          leftEdge = (a._position.x - camPos.x) + (a._bounds.w / 2) < -windowWidth_h
          rightEdge = (a._position.x - camPos.x) - (a._bounds.w / 2) > windowWidth_h
          topEdge = (a._position.y - camPos.y) + (a._bounds.h / 2) < -windowHeight_h
          bottomEdge = (a._position.y - camPos.y) - (a._bounds.h / 2) > windowHeight_h

          if !@_culling or !(bottomEdge or topEdge or leftEdge or rightEdge)

            a = a.updateAttachment() if a._attachedTexture

            ##
            ## NOTE: Keep in mind that failing to switch to the proper material
            ##       will cause the draw to fail! Pass in a custom shader if
            ##       switching to a different material.
            ##
            if a._material != @_currentMaterial
              @switchMaterial a._material

            a.wglDraw gl

    @

  ###
  # Canavs render
  # @return [self]
  # @private
  ###
  _cvRender: ->
    return if !@_ctx
    ctx = @_ctx # Local var is faster

    if @_clearColor
      ctx.fillStyle = "rgb#{@_clearColor}"
      ctx.fillRect 0, 0, @_width, @_height
    else
      ctx.clearRect 0, 0, @_width, @_height

    # Draw everything!
    ctx.save()
    ctx.translate 0, @_height
    ctx.scale 1, -1

    for a in @_actors
      ctx.save()

      if @_pickRenderRequested

        # Change the color for picking. Blue key is 248
        _savedColor = a._color
        _savedColor =
          r: _savedColor._r
          g: _savedColor._g
          b: _savedColor._b
        _savedOpacity = a._opacity

        _id = a.getId() - (Math.floor(a.getId() / 255) * 255)
        _idSector = Math.floor(a.getId() / 255)

        @switchMaterial ARERenderer.MATERIAL_FLAT

        # Recover id with (_idSector * 255) + _id
        a.setColor _id, _idSector, 248
        a.setOpacity 1.0
        a.cvDraw ctx
        a.setColor _savedColor.r, _savedColor.g, _savedColor.b
        a.setOpacity _savedOpacity

      else
        a = a.updateAttachment()

        if (material = a.getMaterial()) != @_currentMaterial
          @switchMaterial material

        a.cvDraw ctx

      ctx.restore()

    ctx.restore()

    # Switch back to a normal rendering mode, and render to the actual screen
    if @_pickRenderRequested

      # Call cb
      r = @_pickRenderSelectionRect
      @_pickRenderCB ctx.getImageData(r.x, r.y, r.width, r.height)

      @_pickRenderRequested = false
      @_pickRenderBuff = null
      @_pickRenderSelectionRect = null
      @_pickRenderCB = null

      @render()

    @

  ###
  # "No render" function
  # @return [Void]
  # @private
  ###
  _nullRender: ->
    return if !@_ctx
    ctx = @_ctx # Local var is faster

    if @_clearColor
      ctx.fillStyle = "rgb#{@_clearColor}"
      ctx.fillRect 0, 0, @_canvas.width, @_canvas.height
    else
      ctx.clearRect 0, 0, @_canvas.width, @_canvas.height

    for a in @_actors
      a = a.updateAttachment()
      a.nullDraw ctx

    @

  ###
  # Manually clear the screen
  #
  # @return [Void]
  ###
  clearScreen: ->
    switch @_activeRendererMode
      when ARERenderer.RENDER_MODE_CANVAS

        if @_clearColor
          @_ctx.fillStyle = "rgb#{@_clearColor}"
          @_ctx.fillRect 0, 0, @_width, @_height
        else
          @_ctx.clearRect 0, 0, @_width, @_height

      when ARERenderer.RENDER_MODE_WGL
        @_gl.clear @_gl.COLOR_BUFFER_BIT | @_gl.DEPTH_BUFFER_BIT

    @

  ###
  # Returns the currently active renderer mode
  # @return [Number] rendererMode
  ###
  getActiveRendererMode: -> @_activeRendererMode

  ###
  # Is the null renderer active?
  # @return [Boolean] is_active
  ###
  isNullRendererActive: ->
    @_activeRendererMode == ARERenderer.RENDER_MODE_NULL

  ###
  # Is the canvas renderer active?
  # @return [Boolean] is_active
  ###
  isCanvasRendererActive: ->
    @_activeRendererMode == ARERenderer.RENDER_MODE_CANVAS

  ###
  # Is the WebGL renderer active?
  # @return [Boolean] is_active
  ###
  isWGLRendererActive: ->
    @_activeRendererMode == ARERenderer.RENDER_MODE_WGL

  ###
  # Returns a unique id, used by actors
  # @return [Number] id unique id
  ###
  getNextId: -> @_nextID++

  ###
  # Get GL context
  #
  # @return [Context] gl
  ###
  getGL: -> @_gl

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
  addActor: (actor, layer) ->
    param.required actor
    actor.layer = layer or actor.layer

    # Find index to insert at to maintain layer order
    layerIndex = _.sortedIndex @_actors, actor, "layer"

    # Insert!
    @_actors.splice layerIndex, 0, actor
    @_actor_hash[actor.getId()] = actor

    actor

  ###
  # Remove an actor from our render list by either actor, or id
  #
  # @param [ARERawActor, Number] actorId actor id, or actor
  # @return [Boolean] success
  ###
  removeActor: (actorId) ->
    param.required actorId

    # Extract id if given actor
    actorId = actorId.getId() if actorId instanceof ARERawActor
    removedActor = _.remove(@_actors, ((a) -> a.getId() == actorId))[0]

    !!removedActor

  makeOrthoMatrix: (left, right, bottom, top, znear, zfar) ->
    new Float32Array [
      2 / (right - left)
      0
      0
      0
      0
      2 / (top - bottom)
      0
      0
      0
      0
      -2 / (zfar - znear)
      0
      -(right + left) / (right - left)
      -(top + bottom) / (top - bottom)
      -(zfar + znear) / (zfar - znear)
      1
    ]

  ###
  # Reconstructs our viewport based on the camera scale, and uploads a fresh
  # projection matrix for the provided material (should be our current shader)
  ###
  refreshViewport: (material) ->
    width = @_width * @_zoomFactor
    height = @_height * @_zoomFactor

    ortho = @makeOrthoMatrix -width/2, width/2, height/2, -height/2, -10, 10

    handles = material.getHandles()
    @_gl.uniformMatrix4fv handles.uProjection, false, ortho

  ###
  # Get the shader we are using for the specified material. Returns null if we
  # don't recognize it.
  #
  # @param [String] material
  # @return [AREShader] shader
  ###
  getShaderForMaterial: (material) ->
    switch material
      when ARERenderer.MATERIAL_FLAT then return @_defaultShader
      when ARERenderer.MATERIAL_TEXTURE then return @_texShader
      else
        return null

  ###
  # Switch material (shader program)
  #
  # @param [String] material
  ###
  switchMaterial: (material) ->
    param.required material
    return false if material == @_currentMaterial

    if @isWGLRendererActive()
      unless shader = @getShaderForMaterial material
        throw new Error "Unknown material #{material}"

      @_gl.useProgram shader.getProgram()
      @refreshViewport shader

    @_currentMaterial = material
    @

  ###
  # Checks if we have a texture loaded
  #
  # @param [String] name texture name to check for
  ###
  hasTexture: (name) ->
    !!_.find @_textures, (t) -> t.name == name

  ###
  # Fetches a texture by name
  #
  # @param [String] name name of texture to fetch
  # @param [Object] texture
  ###
  getTexture: (name) ->
    param.required name
    _.find @_textures, (t) -> t.name == name

  ###
  # Fetches texture size
  #
  # @param [String] name name of texture
  # @param [Object] size
  ###
  getTextureSize: (name) ->
    param.required name

    if t = @getTexture name
      w: t.width * t.scaleX, h: t.height * t.scaleY
    else
      null

  ###
  # Adds a texture to our internal collection
  #
  # @param [Object] texture texture object with name and gl texture
  ###
  addTexture: (tex) ->
    param.required tex
    param.required tex.name
    param.required tex.texture

    @_textures.push tex
    @
