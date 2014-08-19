# Raw actor class, handles rendering and physics simulation. Offers a base
# for the specialized actor classes.
#
# Constructs itself from the supplied vertex and UV sets
class ARERawActor

  @defaultFriction: 0.3
  @defaultMass: 10
  @defaultElasticity: 0.2

  ###
  # Adds the actor to the renderer actor list, gets a unique id from the
  # renderer, and builds our vert buffer.
  #
  # If no texture verts are provided, a default array is provided for square
  # actors.
  #
  # @param [ARERenderer] renderer
  # @param [Array<Number>] vertices flat array of vertices (x1, y1, x2, ...)
  # @param [Array<Number>] texverts flat array of texture coords, optional
  ###
  constructor: (@_renderer, verts, texverts) ->
    @_initializeValues()

    @_id = @_renderer.getNextId()
    @_renderer.addActor @

    @_indiceBuffer = @_renderer.getGL().createBuffer() if @_renderer.getGL()
    @_ownIndiceBuffer = @_indiceBuffer   # Save for later restoration
    @_hasOwnIndiceBuffer = true
    @_hostActorId = null

    @_vertexData = null
    @_vertStride = 4 * Float32Array.BYTES_PER_ELEMENT
    @_uvOffset = 2 * Float32Array.BYTES_PER_ELEMENT

    @updateVertices verts, texverts
    @setColor new AREColor3 255, 255, 255

    # Default to flat rendering
    @clearTexture()

  ###
  # Sets up default values and initializes our data structures.
  # @private
  ###
  _initializeValues: ->

    if @_renderer.isWGLRendererActive() and !(@_gl = @_renderer.getGL())
      throw new Error "GL context is required for actor initialization!"

    # Color used for drawing, colArray is pre-computed for the render routine
    @_color = null
    @_strokeColor = null
    @_strokeWidth = 1
    @_colArray = null

    @_opacity = 1.0

    @_needsDelete = false
    @_visible = true
    @layer = 0
    @_physicsLayer = ~0

    @_id = -1
    @_position = x: 0, y: 0
    @_rotation = 0
    @_bounds = w: 0, h: 0

    @_initializeModelMatrix()
    @_updateModelMatrix()

    ###
    # Physics values
    ###
    @_physics = false # is physics current enabled on this actor?
    @_friction = null
    @_mass = null
    @_elasticity = null

    ###
    # Our actual vertex lists. Note that we will optionally use a different
    # set of vertices for the physical body!
    ###
    @_vertices = []
    @_psyxVertices = []
    @_texVerts = []

    ###
    # If we modify our UVs (scaling, translation), we always do so relative
    # to the original UVs in this array (updated on true UV update)
    ###
    @_origTexVerts = []

    ###
    # Vertice containers
    ###
    @_vertBuffer = null
    @_vertBufferFloats = null # Float32Array

    ###
    # Shader handles, for now there are only three
    ###
    @_sh_handles = {}

    ###
    # Render modes decide how the vertices are treated.
    # @see AREREnderer.GL_MODE_*
    ###
    @_renderMode = ARERenderer.GL_MODE_TRIANGLE_FAN

    ###
    # Render styles decide how the object is filled/stroked
    # @see AREREnderer.RENDER_STYLE_*
    ###
    @_renderStyle = ARERenderer.RENDER_STYLE_FILL

    @_texture = null

    @_clipRect = [0.0, 0.0, 1.0, 1.0]

    # No attached texture; when one exists, we render that texture (actor)
    # instead of ourselves!
    @_attachedTexture = null
    @attachedTextureAnchor =
      clipRect: [0.0, 0.0, 1.0, 1.0]
      x: 0
      y: 0
      width: 0
      height: 0
      angle: 0

  ###
  # Return the renderer that we belong to
  #
  # @return [ARERenderer] renderer
  ###
  getRenderer: ->
    @_renderer

  ###
  # Helper to signal to the renderer that we need to be deleted
  # This is done so actors can be deleted in one batch at the end of the render
  # loop
  ###
  flagForDelete: ->
    @_needsDelete = true

  ###
  # Check if we need to be deleted
  #
  # @return [Boolean] delete
  ###
  flaggedForDeletion: ->
    @_needsDelete

  ###
  # Removes the Actor
  ###
  destroy: ->
    @flagForDelete()

  ###
  # Delete the actor, should only be called by the renderer!
  ###
  rendererActorDelete: ->
    @destroyPhysicsBody()

    outsourcedActors = _.filter @_renderer._actors, (a) ->
      !a.hasOwnIndiceBuffer()

    # Go through and fix any dangling indice buffer pointers
    for a in outsourcedActors
      if a.getHostId() == @_id
        a.clearHostIndiceBuffer()

    @_renderer.getGL().deleteBuffer @_ownIndiceBuffer

  ###
  # Get the WebGL pointer to our indice buffer
  #
  # @return [Number]
  ###
  getIndiceBuffer: ->
    @_ownIndiceBuffer

  ###
  # Get the WebGL pointer to our used indice buffer (likely to be borrowed)
  #
  # @return [Number]
  ###
  getUsedIndiceBuffer: ->
    @_ownIndiceBuffer

  ###
  # Useful method allowing us to re-use another actor's indice buffer. This
  # helps keep renderer VBO size down.
  #
  # @param [Number] buffer
  # @param [Number] actorId
  ###
  setHostIndiceBuffer: (buffer, actorId) ->
    @_indiceBuffer = buffer
    @_hostActorId = actorId
    @_hasOwnIndiceBuffer = false
    @_renderer.requestVBORefresh()

  ###
  # Get the ID of our indice buffer host. Null if we have none
  #
  # @return [Number] id
  ###
  getHostId: ->
    @_hostActorId

  ###
  # Clears any indice buffer host we may have. NOTE: This requires a VBO
  # refresh!
  ###
  clearHostIndiceBuffer: ->
    @_indiceBuffer = @_ownIndiceBuffer
    @_hasOwnIndiceBuffer = true
    @_hostActorId = null
    @_renderer.requestVBORefresh()

  ###
  # Check if we have our own indice buffer
  #
  # @return [Boolean] hasOwn
  ###
  hasOwnIndiceBuffer: -> @_hasOwnIndiceBuffer

  ###
  # Get material name
  #
  # @return [String] material
  ###
  getMaterial: -> @_material

  ###
  # Get actor layer
  #
  # @return [Number] layer
  ###
  getLayer: -> @layer

  ###
  # Set our render layer. Higher layers render on top of lower ones
  #
  # @param [Number] layer
  ###
  setLayer: (@layer) ->
    @_renderer.removeActor @, true
    @_renderer.addActor @, layer

  ###
  # Check if we have a texture set
  #
  # @return [Boolean] hasTexture
  ###
  hasTexture: ->
    !!@_texture

  ###
  # We support a single texture per actor for the time being. UV coords are
  # generated automatically internally, for a flat map.
  #
  # @param [String] name name of texture to use from renderer
  # @return [this]
  ###
  setTexture: (name) ->
    unless @_renderer.hasTexture name
      throw new Error "No such texture loaded: #{name}"

    @_texture = @_renderer.getTexture name
    @setShader @_renderer.getTextureShader()
    @_material = ARERenderer.MATERIAL_TEXTURE
    @

  ###
  # Clear our internal texture, leaving us to render with a flat color
  # @return [this]
  ###
  clearTexture: ->
    @_texture = undefined

    @_texRepeatX = 1
    @_texRepeatY = 1

    @setShader @_renderer.getDefaultShader() if @_renderer.getDefaultShader()
    @_material = ARERenderer.MATERIAL_FLAT
    @

  ###
  # Get our texture, if we have one
  #
  # @return [WebGLTexture] texture
  ###
  getTexture: -> @_texture

  ###
  # Get the actor's texture repeat
  #
  # @return [Object]
  #   @option [Number] x
  #   @option [Number] y
  ###
  getTextureRepeat: ->
    {
      x: @_texRepeatX
      y: @_texRepeatY
    }

  ###
  # Set shader used to draw actor. For the time being, the routine mearly
  # pulls out handles for the ModelView, Color, and Position structures
  #
  # @param [AREShader] shader
  # @return [this]
  ###
  setShader: (shader) ->
    return unless @_renderer.isWGLRendererActive()

    # Ensure shader is built, and generate handles if not already done
    if !shader.getProgram()
      throw new Error "Shader has to be built before it can be used!"

    shader.generateHandles() if !shader.getHandles()
    @_sh_handles = shader.getHandles()

  ###
  # @return [Boolean]
  ###
  hasPhysics: -> @_physics

  ###
  # Creates the internal physics body, if one does not already exist
  #
  # @param [Number] mass 0.0 - unbound
  # @param [Number] friction 0.0 - unbound
  # @param [Number] elasticity 0.0 - unbound
  # @param [Boolean] refresh optionally delete any existing body/shape
  ###
  createPhysicsBody: (@_mass, @_friction, @_elasticity, refresh) ->
    return if @_physics
    return if isNaN @_mass

    refresh = !!refresh
    @_friction ||= ARERawActor.defaultFriction
    @_elasticity ||= ARERawActor.defaultElasticity

    @_mass = 0 if @_mass < 0
    @_friction = 0 if @_friction
    @_elasticity = 0 if @_elasticity < 0

    # Convert vertices
    verts = []
    vertIndex = 0

    # If we have alternate vertices, use those, otherwise go with the std ones
    origVerts = null

    if @_psyxVertices.length > 6
      origVerts = @_psyxVertices
    else
      origVerts = @_vertices

    for i in [0...origVerts.length - 1] by 2

      # Actual coord system conversion
      verts.push origVerts[i]
      verts.push origVerts[i + 1]

      # Rotate vert if mass is 0, since we can't set static body angle
      if @_mass == 0
        x = verts[verts.length - 2]
        y = verts[verts.length - 1]
        a = @_rotation

        verts[verts.length - 2] = x * Math.cos(a) - (y * Math.sin(a))
        verts[verts.length - 1] = x * Math.sin(a) + (y * Math.cos(a))

    bodyDef = null
    shapeDef =
      id: @_id
      type: "Polygon"
      vertices: verts
      static: false
      position: @_position
      friction: @_friction
      elasticity: @_elasticity
      layer: @_physicsLayer

    if @_mass == 0
      shapeDef.static = true
      shapeDef.position = @_position
    else
      bodyDef =
        id: @_id
        position: @_position
        angle: @_rotation
        mass: @_mass
        momentV: x: 0, y: 0
        vertices: verts

      shapeDef.position = x: 0, y: 0

    @_physics = true
    window.AREPhysicsManager.sendMessage {}, "physics.enable"

    if bodyDef
      if refresh
        command = "physics.body.refresh"
      else
        command = "physics.body.create"

      window.AREPhysicsManager.sendMessage
        def: bodyDef
        id: @_id
      , command

    if shapeDef
      if refresh
        command = "physics.shape.refresh"
      else
        command = "physics.shape.create"

      window.AREPhysicsManager.sendMessage
        def: shapeDef
        id: @_id
      , command

    @

  ###
  # Destroys the physics body if one exists
  ###
  destroyPhysicsBody: ->
    return unless @_physics

    window.AREPhysicsManager.sendMessage id: @_id, "physics.shape.remove"

    if @_mass != 0
      window.AREPhysicsManager.sendMessage id: @_id, "physics.body.remove"

    @_physics = false
    @

  enablePhysics: ->
    @createPhysicsBody() unless @hasPhysics()
    @

  disablePhysics: ->
    @destroyPhysicsBody if @hasPhysics()
    @

  refreshPhysics: ->
    return unless @hasPhysics()

    @createPhysicsBody @_mass, @_friction, @_elasticity, true

  ###
  # @return [Number] mass
  ###
  getMass: -> @_mass

  ###
  # @return [Number] elasticity
  ###
  getElasticity: -> @_elasticity

  ###
  # @return [Number] friction
  ###
  getFriction: -> @_friction

  ###
  # Set Actor mass property
  #
  # @param [Number] mass
  ###
  setMass: (@_mass) ->
    @refreshPhysics()
    @

  ###
  # Set Actor elasticity property
  #
  # @param [Number] elasticity
  ###
  setElasticity: (@_elasticity) ->
    @refreshPhysics()
    @

  ###
  # Set Actor friction property
  #
  # @param [Number] friction
  ###
  setFriction: (@_friction) ->
    @refreshPhysics()
    @

  ###
  # @return [Number] mass
  ###
  getMass: -> @_mass

  ###
  # @return [Number] elasticity
  ###
  getElasticity: -> @_elasticity

  ###
  # @return [Number] friction
  ###
  getFriction: -> @_friction

  ###
  # Set Actor mass property
  #
  # @param [Number] mass
  ###
  setMass: (@_mass) ->
    @refreshPhysics()
    @

  ###
  # Set Actor elasticity property
  #
  # @param [Number] elasticity
  ###
  setElasticity: (@_elasticity) ->
    @refreshPhysics()
    @

  ###
  # Set Actor friction property
  #
  # @param [Number] friction
  ###
  setFriction: (@_friction) ->
    @refreshPhysics()
    @

  ###
  # Get actor physics layer
  #
  # @return [Number] physicsLayer
  ###
  getPhysicsLayer: ->
    @_physicsLayer.toString(2).length - 1 # Extract 1 bit position, un-shift

  ###
  # Set physics layer. If we have a physics body, applies immediately. Value
  # persists between physics bodies!
  #
  # There are only 16 physics layers (17 with default layer 0)!
  #
  # @param [Number] layer
  ###
  setPhysicsLayer: (layer) ->
    @_physicsLayer = 1 << layer

    window.AREPhysicsManager.sendMessage
      id: @_id
      layer: @_physicsLayer
    , "physics.shape.set.layer"

  ###
  # Update our vertices, causing a rebuild of the physics body, if it doesn't
  # have its' own set of verts. Note that for large actors this is expensive.
  #
  # Texture coordinates are only required if the actor needs to be textured. If
  # provided, the array must be the same length as that containing the vertices.
  #
  # If either array is missing, no updates to that array are made.
  #
  # @param [Array<Number>] verts flat array of vertices
  # @param [Array<Number>] texverts flat array of texture coords
  ###
  updateVertices: (vertices, texverts) ->
    newVertices = vertices or @_vertices
    newTexVerts = texverts or @_texVerts

    if newVertices.length < 6
      throw new Error "At least 3 vertices make up an actor"

    # Validate UV count
    if newTexVerts != @_texVerts
      if newVertices != @_vertices
        if newVertices.length != newTexVerts.length
          throw new Error "Vert and UV count must match!"
      else
        if @_vertices.length != newTexVerts.length
          throw new Error "Vert and UV count must match!"

    @_vertices = newVertices
    @_texVerts = newTexVerts
    @_origTexVerts = newTexVerts

    # Build raw float buffer for uploading into VBO
    @_vertexData = []

    for i in [0...(@_vertices.length / 2)]
      @_vertexData.push @_vertices[i * 2]      # X
      @_vertexData.push @_vertices[i * 2 + 1]  # Y
      @_vertexData.push @_texVerts[i * 2]      # U
      @_vertexData.push @_texVerts[i * 2 + 1]  # V

    @_vertCount = @_vertexData.length / 4

    # Update size
    mnx = 0
    mny = 0
    mxx = 0
    mxy = 0

    for i in [1..(@_vertices.length / 2)]
      mnx = @_vertices[i * 2]     if mnx > @_vertices[i * 2]
      mxx = @_vertices[i * 2]     if mxx < @_vertices[i * 2]
      mny = @_vertices[i * 2 + 1] if mny > @_vertices[i * 2 + 1]
      mxy = @_vertices[i * 2 + 1] if mxy < @_vertices[i * 2 + 1]

    @_bounds = w: mxx - mnx, h: mxy - mny
    @_onSizeChange @_bounds if @_onSizeChange

    # Notify renderer our vertices have changed
    @_renderer.requestVBORefresh()

  ###
  # Called when the renderer has new vertex indices for us. We must regenerate
  # our indice buffer.
  #
  # @param [Array<Number>] indices
  ###
  updateIndices: (indices) ->
    rawIndices = new Uint16Array indices

    @_gl.bindBuffer @_gl.ELEMENT_ARRAY_BUFFER, @_indiceBuffer
    @_gl.bufferData @_gl.ELEMENT_ARRAY_BUFFER, rawIndices, @_gl.STATIC_DRAW

  ###
  # Get raw vertex data, used by the renderer for VBO generation. Array is in
  # the form of <X1, Y1, U1, V1>, <X2, Y2, U2, V2>, ..., <Xn, Yn, Un, Vn> for
  # n vertices.
  #
  # @return [Array<Number>] data
  ###
  getRawVertexData: -> @_vertexData

  ###
  # Set texture repeat per coordinate axis
  #
  # @param [Number] x horizontal repeat
  # @param [Number] y vertical repeat (default 1)
  ###
  setTextureRepeat: (x, y) ->
    x ||= 1
    y ||= 1

    uvs = []

    for i in [0...@_origTexVerts.length] by 2
      uvs.push (@_origTexVerts[i] / @_texRepeatX) * x
      uvs.push (@_origTexVerts[i + 1] / @_texRepeatY) * y

    @_texRepeatX = x
    @_texRepeatY = y

    @updateVertices @_vertices, uvs
    @

  ###
  # Set an alternate vertex array for our physics object. Note that this also
  # triggers a rebuild! If less than 6 vertices are provided, the normal
  # set of vertices is used
  #
  # @param [Array<Number>] verts flat array of vertices
  ###
  setPhysicsVertices: (verts) ->
    @_psyxVertices = verts
    @refreshPhysics()

  ###
  # Attach texture to render instead of ourselves. This is very useful when
  # texturing strange physics shapes. We create a square actor of the desired
  # dimensions, set the texture, and render it instead of ourselves when it is
  # visible.
  #
  # If we are not visible, the attached texture does not render! If it is
  # invisible, we render ourselves instead.
  #
  # We perform a check for the existence of the texture, and throw an error if
  # it isn't found.
  #
  # @param [String] texture texture name
  # @param [Number] width attached actor width
  # @param [Number] height attached actor height
  # @param [Number] offx anchor point offset
  # @param [Number] offy anchor point offset
  # @param [Angle] angle anchor point rotation
  # @return [ARERawActor] actor attached actor
  ###
  attachTexture: (texture, width, height, offx, offy, angle) ->
    @attachedTextureAnchor.width = width
    @attachedTextureAnchor.height = height
    @attachedTextureAnchor.x = offx or 0
    @attachedTextureAnchor.y = offy or 0
    @attachedTextureAnchor.angle = angle or 0

    # Sanity check
    unless @_renderer.hasTexture texture
      throw new Error "No such texture loaded: #{texture}"

    @removeAttachment() if @_attachedTexture

    # this will force the actor to render with attachment parameters
    @_attachedTexture = new ARERectangleActor width, height
    @_attachedTexture.setTexture texture
    @_attachedTexture


  ###
  # Remove attached texture, if we have one
  #
  # @return [Boolean] success fails if we have no attached texture
  ###
  removeAttachment: ->
    return false unless @_attachedTexture

    @_attachedTexture.destroy()
    true

  ###
  # Set attachment visiblity. Fails if we don't have an attached texture
  #
  # @param [Boolean] visible
  # @return [Boolean] success
  ###
  setAttachmentVisibility: (visible) ->
    return false unless @_attachedTexture

    @_attachedTexture._visible = visible
    true

  ###
  # Checks to see if we have an attached texture
  #
  # @return [Boolean] hasAttachment
  ###
  hasAttachment: -> @_attachedTexture != null

  ###
  # Returns attached texture if we have one, null otherwise
  #
  # @return [ARERawActor] attachment
  ###
  getAttachment: -> @_attachedTexture

  ###
  # Updates any attachments on the actor, if there are any, the value
  # returned is the attachment, if not, then the actor is returned instead.
  # @return [ARERawActor]
  ###
  updateAttachment: ->

    # Check if we have a visible attached texture.
    # If so, set properties and draw
    if @hasAttachment() and @getAttachment()._visible

      # Setup anchor point
      pos = @getPosition()
      rot = @getRotation()

      pos.x += @attachedTextureAnchor.x
      pos.y += @attachedTextureAnchor.y
      rot += @attachedTextureAnchor.angle

      # Switch to attached texture
      a = @getAttachment()

      # Apply state update
      a.setPosition pos
      a.setRotation rot

      a
    else
      @

  ###
  # Binds the actor's WebGL Texture with all needed attributes
  # @param [Object] gl WebGL Context
  ###
  wglBindTexture: (gl) ->
    @_renderer._currentTexture = @_texture.texture

    gl.activeTexture gl.TEXTURE0
    gl.bindTexture gl.TEXTURE_2D, @_texture.texture
    gl.uniform1i @_sh_handles.uSampler, 0

    @

  ###
  # Updates our @_modelM based on our current position and rotation. This used
  # to be in our @wglDraw method, and it used to use methods from EWGL_math.js
  #
  # Since our rotation vector is ALWAYS (0, 0, 1) and our translation Z coord
  # always 1.0, we can reduce the majority of the previous operations, and
  # directly set matrix values ourselves.
  #
  # Since most matrix values never actually change (always either 0, or 1), we
  # set those up in @_initializeModelMatrix() and never touch them again :D
  #
  # This is FUGLY, but as long as we are 2D-only, it's as fast as it gets.
  #
  # THIS. IS. SPARTAAAAA!.
  ###
  _updateModelMatrix: ->

    # Make some variables local to speed up access
    pos = @_position
    camPos = @_renderer.getCameraPosition()

    s = Math.sin(@_rotation)
    c = Math.cos(@_rotation)

    @_modelM[0] = c
    @_modelM[1] = s
    @_modelM[4] = -s
    @_modelM[5] = c

    @_modelM[12] = pos.x - camPos.x
    @_modelM[13] = pos.y - camPos.y

  ###
  # Sets the constant values in our model matrix so that calls to
  # @_updateModelMatrix are sufficient to update our rendered state.
  ###
  _initializeModelMatrix: ->
    @_modelM = [16]

    @_modelM[2] = 0
    @_modelM[3] = 0
    @_modelM[6] = 0
    @_modelM[7] = 0
    @_modelM[8] = 0
    @_modelM[9] = 0
    @_modelM[10] = 1
    @_modelM[11] = 0
    @_modelM[14] = 1
    @_modelM[15] = 1

  ###
  # Renders the Actor using the WebGL interface, this function should only
  # be called by a ARERenderer in WGL mode
  #
  # @param [Object] gl WebGL context
  # @param [Shader] shader optional shader to override our own
  ###
  wglDraw: (gl, shader) ->

    # We only respect our own visibility flag! Any invisible attached textures
    # cause us to render!
    return unless @_visible

    @_updateModelMatrix()

    # Temporarily change handles if a shader was passed in
    if shader
      _sh_handles_backup = @_sh_handles
      @_sh_handles = shader.getHandles()

    # Uniforms
    gl.uniformMatrix4fv @_sh_handles.uModelView, false, @_modelM
    gl.uniform4f @_sh_handles.uColor, @_colArray[0], @_colArray[1], @_colArray[2], 1.0
    gl.uniform4fv @_sh_handles.uClipRect, @_clipRect if @_sh_handles.uClipRect
    gl.uniform1f @_sh_handles.uOpacity, @_opacity

    # Bind array pointers
    gl.enableVertexAttribArray @_sh_handles.aPosition
    gl.vertexAttribPointer @_sh_handles.aPosition, 2, gl.FLOAT, false, @_vertStride, 0

    if @_sh_handles.aTexCoord != undefined
      gl.enableVertexAttribArray @_sh_handles.aTexCoord
      gl.vertexAttribPointer @_sh_handles.aTexCoord, 2, gl.FLOAT, false, @_vertStride, @_uvOffset

    # Texture rendering, if needed
    if @_renderer._currentMaterial == ARERenderer.MATERIAL_TEXTURE
      if @_renderer._currentTexture != @_texture.texture
        @wglBindTexture gl

    # Bind our indices
    @_gl.bindBuffer @_gl.ELEMENT_ARRAY_BUFFER, @_indiceBuffer

    ###
    # @TODO, actually apply the RENDER_STYLE_*
    ###
    switch @_renderMode
      when ARERenderer.GL_MODE_LINE_LOOP
        gl.drawElements gl.LINE_LOOP, @_vertCount, gl.UNSIGNED_SHORT, 0

      when ARERenderer.GL_MODE_TRIANGLE_FAN
        gl.drawElements gl.TRIANGLE_FAN, @_vertCount, gl.UNSIGNED_SHORT, 0

      when ARERenderer.GL_MODE_TRIANGLE_STRIP
        gl.drawElements gl.TRIANGLE_STRIP, @_vertCount, gl.UNSIGNED_SHORT, 0

      else throw new Error "Invalid render mode! #{@_renderMode}"

    # Revert temporary shader change
    if shader
      @_sh_handles = _sh_handles_backup

    @

  ###
  # Updates the context settings with the Actor's strokeStyle and fillStyle
  # @param [Object] 2d context
  ###
  cvSetupStyle: (context) ->

    if @_strokeWidth != null
      context.lineWidth = @_strokeWidth
    else
      context.lineWidth = 1

    if @_strokeColor
      # because.
      r = Number(@_strokeColor._r).toFixed(0)
      g = Number(@_strokeColor._g).toFixed(0)
      b = Number(@_strokeColor._b).toFixed(0)
      a = Number(@_opacity).toFixed(4)
      context.strokeStyle = "rgba(#{r},#{g},#{b},#{a})"
    else
      context.strokeStyle = "#FFF"

    if @_renderer._currentMaterial == ARERenderer.MATERIAL_TEXTURE
      #
    else

      if @_color
        r = Number(@_color._r).toFixed(0)
        g = Number(@_color._g).toFixed(0)
        b = Number(@_color._b).toFixed(0)
        a = Number(@_opacity).toFixed(4)
        context.fillStyle = "rgba(#{r},#{g},#{b},#{a})"
      else
        context.fillStyle = "#FFF"

    @

  ###
  # Renders the current actor using the 2d context, this function should only
  # be called by a ARERenderer in CANVAS mode
  #
  # @param [Object] 2d context
  # @return [self]
  ###
  cvDraw: (context) ->
    return unless @_visible

    @_updateModelMatrix()

    context.translate @_modelM[12], context.canvas.clientHeight - @_modelM[13]
    context.beginPath()
    context.rotate @_rotation
    context.moveTo @_vertices[0], @_vertices[1]

    for i in [1..(@_vertices.length / 2)]
      context.lineTo(@_vertices[i * 2], @_vertices[i * 2 + 1])

    context.closePath()

    @cvSetupStyle context

    context.scale 1, -1 # Flip things rightside-up

    switch @_renderMode
      when ARERenderer.GL_MODE_LINE_LOOP # stroke
        # regardless of your current renderStyle, this will forever outline.
        context.stroke()

      # canvas doesn't really know what a strip or a fan is...
      when ARERenderer.GL_MODE_TRIANGLE_STRIP, \
           ARERenderer.GL_MODE_TRIANGLE_FAN # fill

        if (@_renderStyle & ARERenderer.RENDER_STYLE_STROKE) > 0
          context.stroke()

        if (@_renderStyle & ARERenderer.RENDER_STYLE_FILL) > 0
          if @_renderer._currentMaterial == ARERenderer.MATERIAL_TEXTURE
            context.clip()
            context.drawImage @_texture.texture,
                              -@_bounds.w / 2, -@_bounds.h / 2,
                              @_bounds.w, @_bounds.h

          else
            context.fill()

      else
        throw new Error "Invalid render mode! #{@_renderMode}"

    @

  ###
  # Renders the current actor using the 2d context, however, nothing is
  # drawn, only the internal position is updated
  # this function should only be called by a ARERenderer in NULL mode
  # @param [Object] 2d context
  ###
  nullDraw: (context) ->
    return unless @_visible

    @

  ###
  # Set actor render mode, decides how the vertices are perceived
  # @see ARERenderer.GL_MODE_*
  #
  # @paran [Number] mode
  # @return [self]
  ###
  setRenderMode: (@_renderMode) ->
    @

  ###
  # Set actor render style, decides how the object is filled/stroked
  # @see ARERenderer.RENDER_STYLE_*
  #
  # @paran [Number] mode
  # @return [self]
  ###
  setRenderStyle: (@_renderStyle) ->
    @

  ###
  # Set actor opacity
  #
  # @param [Number] opacity
  # @return [self]
  ###
  setOpacity: (@_opacity) ->
    @

  ###
  # Register an orientation change listener
  #
  # @param [Method] cb
  ###
  setOnOrientationChange: (cb) ->
    @_onOrientationChange = cb

  ###
  # Register a size change listener
  #
  # @param [Method] cb
  ###
  setOnSizeChange: (cb) ->
    @_onSizeChange = cb

  ###
  # Set actor position, affects either the actor or the body directly if one
  # exists
  #
  # @param [Object] position x, y
  # @return [self]
  ###
  setPosition: (@_position) ->

    if @hasPhysics()
      window.AREPhysicsManager.sendMessage
        id: @_id
        position: @_position
      ,"physics.body.set.position"

    @_onOrientationChange position: @_position if @_onOrientationChange
    @

  ###
  # Set actor rotation, affects either the actor or the body directly if one
  # exists
  #
  # @param [Number] rotation angle
  # @param [Boolean] radians true if angle is in radians
  # @return [self]
  ###
  setRotation: (rotation, radians) ->
    radians = !!radians

    rotation = Number(rotation) * 0.0174532925 unless radians
    return unless @_rotation != rotation

    @_rotation = rotation

    if @hasPhysics()
      if @_mass > 0
        window.AREPhysicsManager.sendMessage
          id: @_id
          rotation: @_rotation
        ,"physics.body.set.rotation"
      else
        @refreshPhysics()

    @_onOrientationChange rotation: @_rotation if @_onOrientationChange
    @

  ###
  # Sets the character outline/stroke width
  #
  # @param [Number] width
  # @return [self]
  ###
  setStrokeWidth: (width) ->
    @_strokeWidth = Number(width)
    @

  ###
  # Set color
  # @private
  # @param [Integer] target color to extract information to
  # @overload setColor_ext(target,col)
  #   Sets the color using an AREColor3 instance
  #   @param [AREColor3] color
  #
  # @overload setColor_ext(target, r, g, b)
  #   Sets the color using component values
  #   @param [Integer] r red component
  #   @param [Integer] g green component
  #   @param [Integer] b blue component
  # @return [self]
  ###
  setColor_ext: (target, colOrR, g, b) ->

    if colOrR instanceof AREColor3
      target.setR colOrR.getR()
      target.setG colOrR.getG()
      target.setB colOrR.getB()
    else
      unless isNaN(colOrR.g) or isNaN colOrR.b
        g = colOrR.g
        b = colOrR.b
        colOrR = colOrR.r

      target.setR Number colOrR
      target.setG Number g
      target.setB Number b

    @

  ###
  # Set color
  #
  # @overload setColor(col)
  #   Sets the color using an AREColor3 instance
  #   @param [AREColor3] color
  #
  # @overload setColor(r, g, b)
  #   Sets the color using component values
  #   @param [Integer] r red component
  #   @param [Integer] g green component
  #   @param [Integer] b blue component
  # @return [self]
  ###
  setColor: (colOrR, g, b) ->
    @_color ||= new AREColor3

    @setColor_ext @_color, colOrR, g, b

    @_colArray = [
      @_color.getR true
      @_color.getG true
      @_color.getB true
    ]

    @

  ###
  # Set stroke color
  #
  # @overload setStrokeColor(col)
  #   Sets the color using an AREColor3 instance
  #   @param [AREColor3] color
  #
  # @overload setStrokeColor(r, g, b)
  #   Sets the color using component values
  #   @param [Integer] r red component
  #   @param [Integer] g green component
  #   @param [Integer] b blue component
  # @return [self]
  ###
  setStrokeColor: (colOrR, g, b) ->
    @_strokeColor ||= new AREColor3

    @setColor_ext @_strokeColor, colOrR, g, b

    @_strokeColorArray = [
      @_strokeColor.getR true
      @_strokeColor.getG true
      @_strokeColor.getB true
    ]

    @

  ###
  # Set the visible state of the actor
  # @param [Boolean] visible
  # @return [self]
  ###
  setVisible: (_visible) ->
    @_visible = _visible
    @

  ###
  # Get actor opacity
  #
  # @return [Number] opacity
  ###
  getOpacity: -> @_opacity

  ###
  # Returns the actor position as an object with x and y properties
  #
  # @return [Object] position x, y
  ###
  getPosition: -> @_position

  getBounds: -> @_bounds

  ###
  # Returns actor rotation as an angle in degrees
  #
  # @param [Boolean] radians true to return in radians
  # @return [Number] angle rotation in degrees on z axis
  ###
  getRotation: (radians) ->
    if !!radians
      @_rotation
    else
      @_rotation * 57.2957795

  ###
  # Get array of vertices
  #
  # @return [Array<Number>] vertices
  ###
  getVertices: -> @_vertices

  ###
  # Get body id
  #
  # @return [Number] id
  ###
  getId: -> @_id

  ###
  # Get color
  #
  # @return [AREColor3] color
  ###
  getColor: -> new AREColor3 @_color

  ###
  # @return [Boolean] visible
  ###
  getVisible: -> @_visible

  @updateCount: 0
  @lastTime: Date.now()

  receiveMessage: (message, namespace) ->
    return unless namespace.indexOf("actor.") != -1
    return unless message.id and message.id == @_id
    command = namespace.split(".")

    switch command[1]
      when "update"

        @_position = message.position
        @_rotation = message.rotation

        if @_onOrientationChange
          @_onOrientationChange
            position: @_position
            rotation: @_rotation

# @depend raw_actor.coffee

# Simple rectangle actor; allows for creation using a width and height, and
# manipulation of that width/height
class ARERectangleActor extends ARERawActor

  ###
  # Sets us up with the supplied width and height, generating both our vertex
  # and UV sets.
  #
  # @param [ARERenderer] renderer
  # @param [Number] width
  # @param [Number] height
  ###
  constructor: (renderer, @width, @height) ->
    throw new Error "Invalid width: #{width}" if width <= 0
    throw new Error "Invalid height: #{height}" if height <= 0

    verts = @generateVertices()
    uvs = @generateUVs()

    super renderer, verts, uvs

  ###
  # Generate array of vertices using our dimensions
  #
  # @return [Array<Number>] vertices
  ###
  generateVertices: ->
    hW = @width  / 2
    hH = @height / 2

    [
      -hW, -hH
      -hW,  hH
       hW,  hH
       hW, -hH
      -hW, -hH
    ]

  ###
  # Generate array of UV coordinates
  #
  # @return [Array<Number>] uvs
  ###
  generateUVs: ->
    [
      0, 1,
      0, 0,
      1, 0,
      1, 1,
      0, 1
    ]

  ###
  # Get stored width
  #
  # @return [Number] width
  ###
  getWidth: -> @width

  ###
  # Get stored height
  #
  # @return [Number] height
  ###
  getHeight: -> @height

  ###
  # Set width, causes a vert refresh
  #
  # @param [Number] width
  ###
  setWidth: (@width) -> @updateVertices @generateVertices()

  ###
  # Set height, causes a vert refresh
  #
  # @param [Number] height
  ###
  setHeight: (@height) -> @updateVertices @generateVertices()

# @depend raw_actor.coffee

# Polygon Actor implementation; allows for the creation of polygons with
# arbitrary side counts, and for manipulation by radius and segment count
class AREPolygonActor extends ARERawActor

  # We keep track of polygon actor definitions (radius/segment pairs) and their
  # actor objects, so indice buffers can be re-used between actors.
  @_INDICE_BUFFER_CACHE: {}

  # Just like indice buffers, we also poly actor vertices, to re-use and avoid
  # regeneration
  @_VERTEX_CACHE: {}

  # Identical to _VERTEX_CACHE, but for UVs
  @_UV_CACHE: {}

  ###
  # Sets us up with the supplied radius and segment count, generating our
  # vertex sets.
  #
  # NOTE: Texture support is not available! No UVs! ;(
  #
  # @param [ARERenderer] renderer
  # @param [Number] radius
  # @param [Number] segments
  ###
  constructor: (renderer, @radius, @segments) ->

    ##
    ## NOTE: Things are a bit funky now. The Android engine doesn't implement
    ##       our vert generation, so AJS handles that for us. That means it
    ##       passes the verts in as the first parameter above, rendering
    ##       the segment count undefined.
    ##
    ##       So we need to check if we've been passed an array as the first
    ##       param. If so, segments are unecessary; otherwise, we require the
    ##       segment count, and generate our own verts
    ##

    if @radius instanceof Array

      @_verts = @radius
      @radius = null
      uvs = @generateUVs @_verts

      super renderer, @_verts, uvs
      @setPhysicsVertices @_verts

    else

      throw new Error "Invalid radius: #{radius}" if radius <= 0
      throw new Error "Invalid segment count: #{segments}" if segments <= 2

      verts = @generateVertices()
      psyxVerts = @generateVertices mode: "physics"
      uvs = @generateUVs verts

      super renderer, verts, uvs
      @setPhysicsVertices psyxVerts

    @setRenderMode ARERenderer.GL_MODE_TRIANGLE_FAN
    @validateCacheEntry()

  ###
  # @private
  # Private method that rebuilds our vertex array.
  #
  # @param [Object] options optional generation options
  # @options options [Boolean] mode generation mode (normal, or for physics)
  ###
  generateVertices: (options) ->
    options ||= {}

    # Check if we've already generated this vertex set
    cacheLookup = "#{@radius}.#{@segments}.#{options.mode}"
    cachedVertexSet = AREPolygonActor._VERTEX_CACHE[cacheLookup]
    return cachedVertexSet if cachedVertexSet

    # Build vertices
    # Uses algo from http://slabode.exofire.net/circle_draw.shtml
    x = @radius
    y = 0
    theta = (2.0 * 3.1415926) / @segments
    tanFactor = Math.tan theta
    radFactor = Math.cos theta

    verts = []

    for i in [0...@segments]
      verts[i * 2] = x
      verts[(i * 2) + 1] = y

      tx = -y
      ty = x

      x += tx * tanFactor
      y += ty * tanFactor

      x *= radFactor
      y *= radFactor

    # Cap the shape
    verts.push verts[0]
    verts.push verts[1]

    _tv = []
    for i in [0...verts.length] by 2
      # Reverse winding!
      _tv.push verts[verts.length - 2 - i]
      _tv.push verts[verts.length - 1 - i]

    verts = _tv

    # NOTE: We need to prepend ourselves with (0, 0) for rendering, but pass
    #       the original vert array as our physical representation!
    if options.mode != "physics"
      verts.push 0
      verts.push 0

    # Add set to cache
    AREPolygonActor._VERTEX_CACHE[cacheLookup] = verts

    verts

  ###
  # Generate UV array from a vertex set, using our current radius
  #
  # @return [Array<Number>] uvs
  ###
  generateUVs: (vertices) ->

    # Check if we've already generated this UV set
    cacheLookup = "#{@radius}.#{@segments}"
    cachedUVSet = AREPolygonActor._UV_CACHE[cacheLookup]
    return cachedUVSet if cachedUVSet

    AREPolygonActor._UV_CACHE[cacheLookup] = _.map vertices, (v) =>
      ((v / @radius) / 2) + 0.5

  ###
  # Preforms a full vert refresh (vertices, physics vertics, and UVs)
  # @private
  ###
  fullVertRefresh: ->
    verts = @generateVertices()
    psyxVerts = @generateVertices mode: "physics"
    uvs = @generateUVs verts

    @updateVertices verts, uvs
    @setPhysicsVertices psyxVerts

  ###
  # Ensure we are in the cache under our radius/segments pair, if no other poly
  # is.
  ###
  validateCacheEntry: ->
    cacheLookup = "#{@radius}.#{@segments}"

    # If a cache entry already exists, use its indice buffer
    if AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup]
      cachedActor = AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup]
      @setHostIndiceBuffer cachedActor.getIndiceBuffer(), cachedActor.getId()

    # If not, make ourselves the host
    else
      AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup] = @
      @clearHostIndiceBuffer()

  ###
  # Removes the Actor, cleaning the cache
  #
  # @return [null]
  ###
  destroy: ->
    cacheLookup = "#{@radius}.#{@segments}"

    if AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup] == @
      AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup] = null

    super()

  ###
  # Get stored radius
  #
  # @return [Number] radius
  ###
  getRadius: -> @radius

  ###
  # Get stored segment count
  #
  # @return [Number] segments
  ###
  getSegments: -> @segments

  ###
  # Set radius, causes a full vert refresh
  #
  # @param [Number] radius
  ###
  setRadius: (@radius) ->
    throw new Error "Invalid radius: #{radius}" if radius <= 0
    @fullVertRefresh()
    @validateCacheEntry()

  ###
  # Set segment count, causes a full vert refresh
  #
  # @param [Number] segments
  ###
  setSegments: (@segments) ->
    throw new Error "Invalid segment count: #{segments}" if segments <= 2
    @fullVertRefresh()
    @validateCacheEntry()

# @depend polygon_actor.coffee

# Circle helper, wraps the polygon actor and creates one with 32 sides. Allows
# for vertex manipulation by radius
class ARECircleActor extends AREPolygonActor

  ###
  # Sets us up with the supplied radius and segment count, generating our
  # vertex sets.
  #
  # NOTE: Texture support is not available! No UVs! ;(
  #
  # @param [ARERenderer] renderer
  # @param [Number] radius
  ###
  constructor: (renderer, @radius) ->
    super renderer, radius, 32

    # Clear out segment control
    delete @setSegments
    delete @getSegments

# @depend raw_actor.coffee

# Simple rectangle actor; allows for creation using a base and height, and
# manipulation of that base/height
class ARETriangleActor extends ARERawActor

  ###
  # Sets us up with the supplied base and height, generating both our vertex
  # and UV sets.
  #
  # @param [ARERenderer] renderer
  # @param [Number] base
  # @param [Number] height
  ###
  constructor: (renderer, @base, @height) ->
    throw new Error "Invalid base: #{base}" if base <= 0
    throw new Error "Invalid height: #{height}" if height <= 0

    verts = @generateVertices()
    uvs = @generateUVs()

    super renderer, verts, uvs

  ###
  # Generate array of vertices using our dimensions
  #
  # @return [Array<Number>] vertices
  ###
  generateVertices: ->
    hB = @base  / 2
    hH = @height / 2

    [
      -hB, -hH
        0,  hH
       hB, -hH
      -hB, -hH
    ]

  ###
  # Generate array of UV coordinates
  #
  # @return [Array<Number>] uvs
  ###
  generateUVs: ->
    [
      0, 1,
      0, 0,
      1, 0,
      1, 1
    ]

  ###
  # Get stored base
  #
  # @return [Number] base
  ###
  getBase: -> @base

  ###
  # Get stored height
  #
  # @return [Number] height
  ###
  getHeight: -> @height

  ###
  # Set base, causes a vert refresh
  #
  # @param [Number] base
  ###
  setBase: (@base) -> @updateVertices @generateVertices()

  ###
  # Set height, causes a vert refresh
  #
  # @param [Number] height
  ###
  setHeight: (@height) -> @updateVertices @generateVertices()

# Color class, holds r/g/b components
#
# Serves to provide a consistent structure for defining colors, and offers
# useful float to int (0.0-1.0 to 0-255) conversion functions
class AREColor3

  ###
  # Sets component values
  #
  # @param [Number] r red component
  # @param [Number] g green component
  # @param [Number] b blue component
  ###
  constructor: (colOrR, g, b) ->
    colOrR ||= 0
    g ||= 0
    b ||= 0

    if colOrR instanceof AREColor3
      @_r = colOrR.getR()
      @_g = colOrR.getG()
      @_b = colOrR.getB()
    else
      @setR colOrR
      @setG g
      @setB b

  ###
  # Returns the red component as either an int or float
  #
  # @param [Boolean] float true if a float is requested
  # @return [Number] red
  ###
  getR: (asFloat) ->
    if asFloat != true then return @_r
    @_r / 255

  ###
  # Returns the green component as either an int or float
  #
  # @param [Boolean] float true if a float is requested
  # @return [Number] green
  ###
  getG: (asFloat) ->
    if asFloat != true then return @_g
    @_g / 255

  ###
  # Returns the blue component as either an int or float
  #
  # @param [Boolean] float true if a float is requested
  # @return [Number] blue
  ###
  getB: (asFloat) ->
    if asFloat != true then return @_b
    @_b / 255

  ###
  # Set red component, takes a value between 0-255
  #
  # @param [Number] c
  ###
  setR: (c) ->
    c = Number(c)
    if c < 0 then c = 0
    if c > 255 then c = 255
    @_r = c

  ###
  # Set green component, takes a value between 0-255
  #
  # @param [Number] c
  ###
  setG: (c) ->
    c = Number(c)
    if c < 0 then c = 0
    if c > 255 then c = 255
    @_g = c

  ###
  # Set blue component, takes a value between 0-255
  #
  # @param [Number] c
  ###
  setB: (c) ->
    c = Number(c)
    if c < 0 then c = 0
    if c > 255 then c = 255
    @_b = c

  ###
  # Returns the value as a triple
  #
  # @return [String] triple in the form (r, g, b)
  ###
  toString: -> "(#{@_r}, #{@_g}, #{@_b})"

# Shader class
class AREShader

  ###
  # Doesn't do much except auto-build the shader if requested
  #
  # @param [String] vertSrc vertex shader source
  # @param [String] fragSrc fragment shader source
  # @param [Object] gl gl object if building
  # @param [Boolean] build if true, builds the shader now
  ###
  constructor: (@_vertSrc, @_fragSrc, @_gl, build) ->
    build = !!build

    # errors generated errors are pushed into this
    @errors = []

    @_prog = null
    @_vertShader = null
    @_fragShader = null
    @_handles = null

    if build == true
      _success = @build @_gl

      if _success == false
        throw new Error "Failed to build shader! #{JSON.stringify(@errors)}"

  ###
  # Builds the shader using the vert/frag sources supplied
  #
  # @param [Object] gl gl object to build shaders with/into
  # @return [Boolean] success false implies an error stored in @errors
  ###
  build: (@_gl) ->
    gl = @_gl
    @errors = [] # Clear errors

    # Sanity
    if gl == undefined or gl == null
      throw new Error "Need a valid gl object to build a shader!"

    # Create the shaders
    @_vertShader = gl.createShader gl.VERTEX_SHADER
    @_fragShader = gl.createShader gl.FRAGMENT_SHADER

    # Attach sources
    gl.shaderSource @_vertShader, @_vertSrc
    gl.shaderSource @_fragShader, @_fragSrc

    # Compile
    gl.compileShader @_vertShader
    gl.compileShader @_fragShader

    # Check for errors
    if !gl.getShaderParameter((@_vertShader), gl.COMPILE_STATUS)
      @errors.push gl.getShaderInfoLog(@_vertShader)

    if !gl.getShaderParameter((@_fragShader), gl.COMPILE_STATUS)
      @errors.push gl.getShaderInfoLog(@_fragShader)

    # Link
    @_prog = gl.createProgram()
    gl.attachShader @_prog, @_vertShader
    gl.attachShader @_prog, @_fragShader
    gl.linkProgram @_prog

    # Check for errors
    if !gl.getProgramParameter(@_prog, gl.LINK_STATUS)
      @errors.push "Failed to link!"

    if @errors.length > 0 then return false
    true

  ###
  # Really neat helper function, breaks out and supplies handles to all
  # variables. Really the meat of this class
  #
  # @return [Boolean] success fails if handles have already been generated
  ###
  generateHandles: ->

    if @_prog == null
      AREEngine.getLog().error "Build program before generating handles"
      return false

    if @_handles != null
      AREEngine.getLog().warn "Refusing to re-generate handles!"
      return false

    @_handles = {}

    # type 1 == uniform, 2 == attribute
    _makeHandle = (l, type, me) ->
      l = l.split " "
      name = l[l.length - 1].replace(";", "")

      if type == 1
        ret =
          n: name
          h: me._gl.getUniformLocation me._prog, name

        if typeof ret.h != "object"
          throw new Error "Failed to get handle for uniform #{name} [#{ret.h}]"

        return ret
      else if type == 2
        ret =
          n: name
          h: me._gl.getAttribLocation me._prog, name

        #if typeof ret.h != "object"
        #  throw new Error "Failed to get handle for attrib #{name} [#{ret.h}]"

        return ret

      throw new Error "Type not 1 or 2, WTF, internal error"

    # Go through the source, and pull out uniforms and attributes
    # Note that if a duplicate is found, it is simply skipped!
    for src in [ @_vertSrc, @_fragSrc ]

      src = src.split ";"
      for l in src

        if l.indexOf("main()") != -1
          break # Break at the start of the main function
        else if l.indexOf("attribute") != -1
          h = _makeHandle l, 2, @
          @_handles[h.n] = h.h
        else if l.indexOf("uniform") != -1
          h = _makeHandle l, 1, @
          @_handles[h.n] = h.h

    true

  ###
  # Get generated handles
  #
  # @return [Object] handles
  ###
  getHandles: -> @_handles

  ###
  # Get generated program (null by default)
  #
  # @return [Object] program
  ###
  getProgram: -> @_prog

class AREVector2

  constructor: (x, y) ->
    @x ||= 0
    @y ||= 0

  ###
  # @param [Boolean] bipolar should randomization occur in all directions?
  # @return [AREVector2] randomizedVector
  ###
  random: (options) ->
    options ||= {}
    bipolar = !!options.bipolar
    seed = options.seed or Math.random() * 0xFFFF

    x = Math.random() * @x
    y = Math.random() * @y

    if bipolar
      x = -x if Math.random() < 0.5
      y = -y if Math.random() < 0.5

    new AREVector2 x, y

  ###
  # @param [AREVector2]
  # @return [AREVector2]
  ###
  add: (other) -> new AREVector2 @x + other.x, @y + other.y

  ###
  # @param [AREVector2]
  # @return [AREVector2]
  ###
  sub: (other) -> new AREVector2 @x - other.x, @y - other.y

  ###
  # @param [AREVector2]
  # @return [AREVector2]
  ###
  mul: (other) -> new AREVector2 @x * other.x, @y * other.y

  ###
  # @param [AREVector2]
  # @return [AREVector2]
  ###
  div: (other) -> new AREVector2 @x / other.x, @y / other.y

  ###
  # @return [AREVector2]
  ###
  floor: -> new AREVector2 Math.floor(@x), Math.floor(@y)

  ###
  # @return [AREVector2]
  ###
  ceil: -> new AREVector2 Math.ceil(@x), Math.ceil(@y)

  ###
  # @return [AREVector2]
  ###
  @zero: -> new AREVector2 0, 0

AREShader.shaders = {}
AREShader.shaders.wire = {}
AREShader.shaders.solid = {}
AREShader.shaders.texture = {}

#precision = "highp"
precision = "mediump"
varying_precision = "mediump"
precision_declaration = "precision #{precision} float;"

AREShader.shaders.wire.vertex = """
#{precision_declaration}

attribute vec2 aPosition;

uniform mat4 uProjection;
uniform mat4 uModelView;

void main() {
  gl_Position = uProjection * uModelView * vec4(aPosition, 1, 1);
}
"""

AREShader.shaders.wire.fragment = """
#{precision_declaration}

uniform vec4 uColor;
uniform float uOpacity;

void main() {
  vec4 frag = uColor;
  frag.a *= uOpacity;
  gl_FragColor = frag;
}
"""

## Shaders for shapes with solid colors
AREShader.shaders.solid.vertex = AREShader.shaders.wire.vertex

AREShader.shaders.solid.fragment = """
#{precision_declaration}

uniform vec4 uColor;
uniform float uOpacity;

void main() {
  vec4 frag = uColor;
  frag.a *= uOpacity;
  gl_FragColor = frag;
}
"""

## Shaders for textured objects
AREShader.shaders.texture.vertex = """
#{precision_declaration}

attribute vec2 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uProjection;
uniform mat4 uModelView;

varying #{varying_precision} vec2 vTexCoord;

void main() {
  gl_Position = uProjection * uModelView * vec4(aPosition, 1, 1);
  vTexCoord = aTexCoord;
}
"""

AREShader.shaders.texture.fragment = """
#{precision_declaration}

uniform sampler2D uSampler;
uniform vec4 uColor;
uniform float uOpacity;
uniform vec4 uClipRect;

varying #{varying_precision} vec2 vTexCoord;

void main() {
  vec4 baseColor = texture2D(uSampler,
                             uClipRect.xy +
                             vTexCoord * uClipRect.zw);
  // baseColor *= uColor;
  baseColor.a *= uOpacity;

  gl_FragColor = baseColor;
}
"""

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
    @_width = opts.width
    @_height = opts.height
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
    actor.layer = layer unless isNaN layer

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
    _.find @_textures, (t) -> t.name == name

  ###
  # Fetches texture size
  #
  # @param [String] name name of texture
  # @param [Object] size
  ###
  getTextureSize: (name) ->
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
    @_textures.push tex
    @

###
# PhysicsManager is in charge of starting and communicating with the physics
# web worker.
###
class PhysicsManager

  constructor: (@_renderer, depPaths, cb) ->

    # Messages that are sent before our worker is initialised
    @_backlog = []

    dependencies = [
      raw: "cp = exports = {};"
    ,
      url: depPaths.chipmunk
    ,
      url: depPaths.physics_worker
    ]

    async.map dependencies, (dependency, depCB) ->
      return depCB(null, dependency.raw) if dependency.raw

      request = new XMLHttpRequest()
      request.open "GET", dependency.url, true
      request.onerror = (e) -> depCB "Connection error: #{e}", null
      request.onload = ->
        if request.status >= 200 && request.status < 400
          depCB null, request.responseText
        else
          depCB "Request returned #{request.status}", null

      request.send()

    , (error, sources) =>
      @_initFromSources sources
      @_emptyBacklog()
      cb() if cb

  _initFromSources: (sources) ->
    return if !!@_worker

    data = new Blob [sources.join("\n\n")], type: "text/javascript"
    @_worker = new Worker (URL || (window.webkitURL)).createObjectURL data
    @_worker.postMessage ""
    @_connectWorkerListener()

  _emptyBacklog: ->
    return unless !!@_worker
    for item in @_backlog
      @sendMessage item.message, item.command

  ###
  # Broadcast a message to the physics manager; this gets passed through to the
  # underlying web worker.
  #
  # @param [Object] message
  # @param [String] command
  ###
  sendMessage: (message, command) ->
    if !!@_worker
      @_worker.postMessage
        message: message
        command: command
    else
      @_backlog.push
        message: message
        command: command

  _connectWorkerListener: ->

    # Use constant indexes to get a nice speed boost
    ID_INDEX = 0
    POS_INDEX = 1
    ROT_INDEX = 2

    # Keep data storage objects here so we can re-use them later
    data = {}
    dataPacket = {}
    actor = {}

    @_worker.onmessage = (e) =>
      data = e.data

      # Array updates are batch render updates, manually apply to speed it up
      if data.length

        # This is faster than a generic for-loop
        l = data.length

        while l--
          dataPacket = data[l]

          actor = @_renderer._actor_hash[dataPacket[ID_INDEX]]
          actor._position = dataPacket[POS_INDEX]
          actor._rotation = dataPacket[ROT_INDEX]
          actor._updateModelMatrix()

# Tiny logging class created to be able to selectively
# silence all logging in production, or by level. Also supports tags
# similar to the 'spew' npm module
#
# There are 4 default levels, with 0 always turning off all logging
#
# 1 - Error
# 2 - Warning
# 3 - Debug
# 4 - Info
class ARELog

  # @property [Array<String>] tags, editable by the user
  @tags: [
    "",
    "[Error]> ",
    "[Warning]> ",
    "[Debug]> ",
    "[Info]> "
  ]

  # @property [Number] logging level
  @level: 4

  # Generic logging function
  #
  # @param [Number] level logging level to log on
  # @param [String] str log message
  @w: (level, str) ->

    me = ARELog

    # Return early if not at a suiteable level, or level is 0
    if level > me.level or level == 0 or me.level == 0 then return

    # Specialized console output
    if level == 1 and console.error != undefined
      if console.error then console.error "#{me.tags[level]}#{str}"
      else console.log "#{me.tags[level]}#{str}"
    else if level == 2 and console.warn != undefined
      if console.warn then console.warn "#{me.tags[level]}#{str}"
      else console.log "#{me.tags[level]}#{str}"
    else if level == 3 and console.debug != undefined
      if console.debug then console.debug "#{me.tags[level]}#{str}"
      else console.log "#{me.tags[level]}#{str}"
    else if level == 4 and console.info != undefined
      if console.info then console.info "#{me.tags[level]}#{str}"
      else console.log "#{me.tags[level]}#{str}"
    else if level > 4 and me.tags[level] != undefined
      console.log "#{me.tags[level]}#{str}"
    else
      console.log str

  # Specialized, sets level to error directly
  #
  # @param [String] str log message
  @error: (str) -> @w 1, str

  # Specialized, sets level to warning directly
  #
  # @param [String] str log message
  @warn: (str) -> @w 2, str

  # Specialized, sets level to debug directly
  #
  # @param [String] str log message
  @debug: (str) -> @w 3, str

  # Specialized, sets level to info directly
  #
  # @param [String] str log message
  @info: (str) -> @w 4, str

# AREBezAnimation
#
# Class to handle bezier animations
# It can animate the Color, Rotation and Position properties,
# each component only individually for the composite properties!
class AREBezAnimation

  ###
  # For all animateable properties the options param passes in the end value,
  # an array of [time, value] control points, the duration of the animation
  # and the property to be affected by these options.
  #
  # Properties are named by keys (rotation, position, color), with composite
  # values supplied as an array of the property name, and the composite name.
  #
  # i.e. ["position", "x"]
  # @param [ARERawActor] actor represents the actor we animate
  # @param [Object] options represents the options used to animate
  # @option options [Number] endVal
  # @option options [Array<Object>] controlPoints
  # @option options [Number] duration
  # @option options [String, Array] property
  # @option options [Number] fps framerate, defaults to 30
  # @option options [Method] cbStart callback to call before animating
  # @option options [Method] cbEnd callback to call after animating
  # @option options [Method] cbStep callback to call after each update
  # @param [Boolean] dryRun sets up for preCalculate only! Actor optional.
  ###
  constructor: (@actor, options, dryRun) ->
    dryRun = !!dryRun
    @_duration = options.duration
    @_property = options.property
    @_controlPoints = options.controlPoints || []
    @_fps = options.fps || 30
    @_cbStep = options.cbStep || ->
    @_cbEnd = options.cbEnd || ->
    @_cbStart = options.cbStart || ->

    # Guards against multiple exeuctions
    @_animated = false

    # In bezOpt we will keep all the info we need for the Bezier function
    # which means degree, starting value, final value and the position of
    # the control points provided
    @bezOpt = {}
    @bezOpt.degree = 0

    if options.controlPoints.length > 0
      @bezOpt.degree = options.controlPoints.length
      @bezOpt.ctrl = options.controlPoints

    @bezOpt.endPos = options.endVal
    @tIncr = 1 / (@_duration * (@_fps / 1000))

    if dryRun
      @bezOpt.startPos = options.startVal
    else

      # Getting our starting value based on our animated property
      if @_property[0] == "rotation"
        @bezOpt.startPos = @actor.getRotation()

      if @_property[0] == "position"
        if @_property[1] == "x"
          @bezOpt.startPos = @actor.getPosition().x
        else if @_property[1] == "y"
          @bezOpt.startPos = @actor.getPosition().y

      if @_property[0] == "color"
        if @_property[1] == "r"
          @bezOpt.startPos = @actor.getColor().getR()
        else if @_property[1] == "g"
          @bezOpt.startPos = @actor.getColor().getG()
        else if @_property[1] == "b"
          @bezOpt.startPos = @actor.getColor().getB()

  ###
  # Updates the animation for a certain value t, between 0 and 1
  #
  # @param [Number] t animation state, 0.0-1.0
  # @param [Boolean] apply applies the updated value, defaults to true
  #
  # @return [Number] val new value
  # @private
  ###
  _update: (t, apply) ->
    apply ||= true

    t = 0 if t < 0
    t = 1 if t > 1

    # 0th degree, linear interpolation
    if @bezOpt.degree == 0
      val = @bezOpt.startPos + ((@bezOpt.endPos - @bezOpt.startPos) * t)

    # 1st degree, quadratic
    else if @bezOpt.degree == 1

      # Speed things up by pre-calculating some elements
      _Mt = 1 - t
      _Mt2 = _Mt * _Mt
      _t2 = t * t

      # [x, y] = [(1 - t)^2]P0 + 2(1 - t)tP1 + (t^2)P2
      val = (_Mt2 * @bezOpt.startPos) + \
            (2 * _Mt * t * @bezOpt.ctrl[0].y) \
            + _t2 * @bezOpt.endPos

    # 2nd degree, cubic
    else if @bezOpt.degree == 2

      # As above, minimal optimization
      _Mt = 1 - t
      _Mt2 = _Mt * _Mt
      _Mt3 = _Mt2 * _Mt
      _t2 = t * t
      _t3 = _t2 * t

      # [x, y] = [(1 - t)^3]P0 + 3[(1 - t)^2]P1 + 3(1 - t)(t^2)P2 + (t^3)P3
      val = (_Mt3 * @bezOpt.startPos) + (3 * _Mt2 * t * @bezOpt.ctrl[0].y) \
           + (3 * _Mt * _t2 * @bezOpt.ctrl[1].y) + (_t3 * @bezOpt.endPos)

    else
      throw new Error "Invalid degree, can't evaluate (#{@bezOpt.degree})"

    # Applying the calculated value for the chosen property, and call cbStep if
    # provided
    if apply
      @_applyValue val
      @_cbStep val

    val

  ###
  # Calculate value for each step, return an object with "values" and
  # "stepTime" keys
  #
  # @return [Object] bezValues
  ###
  preCalculate: ->
    t = 0
    bezValues = { stepTime: @_duration * @tIncr }
    bezValues.values = []

    while t <= 1.0
      t += @tIncr

      # Round last t
      if t > 1 and t < (1 + @tIncr)
        t = 1
      else if t > 1
        break

      bezValues.values.push @_update t, false

    bezValues

  ###
  # Apply value to our actor
  #
  # @param [Number] val
  # @private
  ###
  _applyValue: (val) ->
    if @_property[0] == "rotation"
      @actor.setRotation val
    else if @_property[0] == "position"
      if @_property[1] == "x"
        @actor.setPosition
          x: val
          y: @actor.getPosition().y
      else if @_property[1] == "y"
        @actor.setPosition
          x: @actor.getPosition().x
          y: val

    else if @_property[0] == "color"
      if @_property[1] == "r"
        _r = val
        _g = @actor.getColor().getG()
        _b = @actor.getColor().getB()
        @actor.setColor _r, _g, _b
      else if @_property[1] == "g"
        _r = @actor.getColor().getR()
        _g = val
        _b = @actor.getColor().getB()
        @actor.setColor _r, _g, _b
      else if @_property[1] == "b"
        _r = @actor.getColor().getR()
        _g = @actor.getColor().getG()
        _b = val
        @actor.setColor _r, _g, _b

  ###
  # Called after construction of the animation object
  # to actually begin the animation
  ###
  animate: ->
    if @_animated then return else @_animated = true
    @_cbStart()

    t = -@tIncr

    @_intervalID = setInterval =>
      t += @tIncr
      t = 1 if t > 1

      @_update t

      if t == 1
        clearInterval @_intervalID
        @_cbEnd()
      else
        @_cbStep()

    , 1000 / @_fps

# AREVertAnimation
#
# Class to handle actor vertices updates
class AREVertAnimation

  ###
  # Class to animate vertices using vertex delta sets. The delta sets describe
  # the change in vertice structure at a specific point in time.
  #
  # Note that vertex sets are stored flat, and deltas are interpreted the same
  # way. So deltas take the form of [deltaX1, deltaY1, deltaX2, deltaY2, ....]
  #
  # Vertices need to be passed in as deltas. Any vertices not currently present
  # in the actor (new vertices, index > actor.vertices.length) will be pushed
  # directly. If the new vertice set is smaller than that of the actor, the
  # difference will be dropped unless the ending vertice has a value of "|"
  #
  # Vertices with a value of "." will be left unchanged. Absolute values will
  # be set directly, whereas numbers prefixed with "-" or "+" will be offset
  # accordingly.
  #
  # Repeating series may also be passed in, signaling repetition with "...",
  # and ending delta parsing. As such, no unique deltas may exist after an
  # occurence of "..." is encountered! Repeating series also support partial
  # application (existing vert set length does not have to be divisible by
  # the repeat step)
  #
  # @example Example vertex set specifications
  #   ["+5", "-3", 3.53, 5, ".", "."]
  #   applied to
  #   [20, 42, 23, 67, 34, 75, 96, 32, 76, 23]
  #   yields
  #   [25, 39, 3.53, 5, 34, 75]
  #
  #   ["2", "|"]
  #   applied to
  #   [1, 1, 1, 1, 1, 1]
  #   yields
  #   [2, 1, 1, 1, 1, 1]
  #
  #   ["+1", ".", "..."]
  #   applies to
  #   [4, 4, 4, 4, 4, 4, 4, 4, 4]
  #   yields
  #   [5, 4, 5, 4, 5, 4, 5, 4, 5]
  #
  #   Values passed in as numbers (not strings) will be interpreted as absolute
  #   changes. If you need to set a negative value, use a number, not a string!
  #
  # @param [ARERawActor] actor the actor we apply the modifications to
  # @param [Object] options the options we apply
  # @option options [Number, Array<Number>] delays
  # @option options [Array, Array<Array>] deltas
  # @option options [Array<Number>] udata objects passed into step callback
  # @option options [Method] cbStart callback to call before animating
  # @option options [Method] cbStep callback to call on each delta application
  # @option options [Method] cbEnd callback to call after animating
  ###
  constructor: (@actor, options) ->
    @_delays = options.delays
    @_deltas = options.deltas
    @_udata = options.udata
    @_cbStep = options.cbStep || ->
    @_cbEnd = options.cbEnd || ->
    @_cbStart = options.cbStart || ->

    if @_delays.length != @_deltas.length
      ARELog.warn "Vert animation delay count != delta set count! Bailing."
      @_animated = true
      return

    # Guards against multiple exeuctions
    @_animated = false

  ###
  # Set the timeout for our _applyDeltas() method
  #
  # @param [Object] deltaSet set of deltas to apply to the actor
  # @param [Number] delay the delay in miliseconds to make the update
  # @param [Object] udata optional userdata to send to callback
  # @param [Boolean] last signals this is the last timeout
  # @private
  ###
  _setTimeout: (deltaSet, delay, udata, last) ->

    setTimeout =>
      @_applyDeltas deltaSet, udata
      @_cbEnd() if last
    , delay

  ###
  # @private
  # Applies the delta set to the actor
  #
  # @param [Array<String, Number>] deltaSet
  # @param [Object] udata optional userdata to send to callback
  ###
  _applyDeltas: (deltaSet, udata) ->
    @_cbStep udata

    finalVerts = @actor.getVertices()

    # Check for repeat
    repeat = deltaSet.join("_").indexOf("...") != -1

    # Apply deltas.
    #
    #   "`N"  - Absolute update
    #   "-N"  - Negative change
    #   "+N"  - Positive change
    #   "."   - No change
    #   "|"   - Finished, break
    #   "..." - Repeat preceeding
    for i in [0...deltaSet.length]
      d = deltaSet[i]

      if i >= finalVerts.length

        # Break if repeating and we have surpassed the last vert
        break if repeat
        val = undefined

      else
        val = finalVerts[i]

      if typeof d == "number"
        val = d
      else if typeof d == "string"
        if !val
          ARELog.warn "Vertex does not exist, yet delta is relative!"
          return

        if d.charAt(0) == "|" then break
        else if d.charAt(0) == "-" then val -= Number(d.slice(1))
        else if d.charAt(0) == "+" then val += Number(d.slice(1))
        else if d == "..." then i = 0
        else if d.charAt(0) != "."
          ARELog.warn "Unknown delta action, #{d}, can't apply deltas."
          return

      else
        ARELog.warn "Unknown delta type, can't apply deltas! #{d} #{typeof d}"
        return

      if i > finalVerts.length
        ARELog.warn "Vertex gap, can't push new vert! #{val}:#{d}:#{i}"
        return
      else if i == finalVerts.length
        finalVerts.push val
      else
        finalVerts[i] = val

    @actor.updateVertices finalVerts

  ###
  # Looks through all the options provided and sends them to the update
  # function so they are not lost when i updates
  ###
  animate: ->
    if @_animated then return else @_animated = true
    @_cbStart()

    for i in [0...@_deltas.length]

      # Send proper user data if provided
      udata = null
      if @_udata
        if @_udata instanceof Array
          if i < @_udata.length
            udata = @_udata[i]
        else
          udata = @_udata

      last = i == (@_deltas.length - 1)
      @_setTimeout @_deltas[i], @_delays[i], udata, last

# AREPsyxAnimation
#
# Class to handle actor physics updates
class AREPsyxAnimation

  ###
  # Class to "animate" physics properties which means changing them
  # at certain times by calling the createPhysicsBody method of an actor
  #
  # @param [ARERawActor] actor the actor we apply the modifications to
  # @param [Object] options
  # @option options [Number] mass
  # @option options [Number] friction
  # @option options [Number] elasticity
  # @option options [Number] timeout
  # @option options [Method] cbStart callback to call before animating
  # @option options [Method] cbEnd callback to call after animating
  ###
  constructor: (@actor, options) ->
    @_mass = options.mass || 0
    @_friction = options.friction || 0
    @_elasticity = options.elasticity || 0
    @_timeout = options.timeout
    @_cbStep = options.cbStep || ->
    @_cbEnd = options.cbEnd || ->
    @_cbStart = options.cbStart || ->

    # Guards against multiple exeuctions
    @_animated = false

  ###
  # Activates the animation (can only be run once)
  ###
  animate: ->
    if @_animated then return else @_animated = true
    @_cbStart()

    setTimeout =>
      @actor.createPhysicsBody @_mass, @_friction, @_elasticity
      @_cbEnd()
    , @_timeout

# Actor interface class
class AREActorInterface

  constructor: (masterInterface) ->

  # Set the target ARE instance
  setEngine: (engine) ->
    @_renderer = engine.getRenderer()

  ###
  # Fails with null
  # @private
  ###
  _findActor: (id) ->
    for a in @_renderer._actors
      if a.getId() == id then return a

    null

  ###
  # Create actor using the supplied vertices, passed in as a flat array
  #
  # @param [Array<Number>] verts
  # @return [Number] id created actor handle
  ###
  create2DRawPolygon: (verts) ->
    new ARERawActor(@_renderer, verts).getId()

  ###
  # Create a variable sided actor of the specified radius
  #
  # @param [Number] radius
  # @param [Number] segments
  # @return [Number] id created actor handle
  ###
  create2DPolygon: (radius, segments) ->

    ##
    ## NOTE: Things are a bit fucked up at the moment. The android engine
    ##       doesn't implement the same polygon actor we do; so if we've been
    ##       passed a vert array as the first parameter above, treat this as
    ##       a raw actor creation request
    ##
    if typeof radius == "string"
      @createRawActor radius
    else
      new AREPolygonActor(@_renderer, radius, segments).getId()

  ###
  # Creates a rectangle actor of the specified width and height
  #
  # @param [Number] width
  # @param [Number] height
  # @return [Number] id created actor handle
  ###
  create2DRectangle: (width, height) ->
    new ARERectangleActor(@_renderer, width, height).getId()

  ###
  # Creates a circle actor with the specified radius
  #
  # @param [Number] radius
  # @return [Number] id created actor handle
  ###
  create2DCircle: (radius) ->
    new ARECircleActor(@_renderer, radius).getId()

  ###
  # Get actor render layer
  #
  # @param [Number] id
  # @return [Number] layer
  ###
  getLayer: (id) ->
    if a = @_findActor(id)
      a.getLayer()
    else
      null

  ###
  # Get actor physics layer
  #
  # @param [Number] id
  # @return [Number] physicsLayer
  ###
  getPhysicsLayer: (id) ->
    if a = @_findActor(id)
      a.getPhysicsLayer()
    else
      null

  ###
  # Fetch the width of the rectangle actor with the specified ID
  #
  # @param [Number] id
  # @return [Number] width
  ###
  getRectangleWidth: (id) ->
    if (a = @_findActor(id)) && a instanceof ARERectangleActor
      a.getWidth()
    else
      null

  ###
  # Fetch the height of the rectangle actor with the specified ID
  #
  # @param [Number] id
  # @return [Number] height
  ###
  getRectangleHeight: (id) ->
    if (a = @_findActor(id)) && a instanceof ARERectangleActor
      a.getHeight()
    else
      null

  ###
  # Get actor opacity using handle, fails with null
  #
  # @param [Number] id
  # @return [Number] opacity
  ###
  getOpacity: (id) ->
    if a = @_findActor id
      a.getOpacity()
    else
      null

  ###
  # Get actor visible using handle, fails with null
  #
  # @param [Number] id
  # @return [Boolean] visible
  ###
  isVisible: (id) ->
    if a = @_findActor id
      a.getVisible()
    else
      null

  ###
  # Get actor position using handle, fails with null
  # Returns position as a JSON representation of a primitive (x, y) object!
  #
  # @param [Number] id
  # @return [Object] position {x, y}
  ###
  getPosition: (id) ->
    if a = @_findActor id
      a.getPosition()
    else
      null

  ###
  # Get actor rotation
  #
  # @param [Number] id
  # @param [Boolean] radians defaults to false
  # @return [Number] angle in degrees or radians
  ###
  getRotation: (id, radians) ->
    if a = @_findActor id
      a.getRotation !!radians
    else
      null

  ###
  # Returns actor color as a JSON triple, in 0-255 range
  # Uses id, fails with null
  #
  # @param [Number] id
  # @return [String] col
  ###
  getColor: (id) ->
    if a = @_findActor id
      color = a.getColor()

      {
        r: color.getR()
        g: color.getG()
        b: color.getB()
      }
    else
      null

  ###
  # Return an Actor's texture name
  #
  # @param [Number] id
  # @return [String] texture_name
  ###
  getTexture: (id) ->
    if a = @_findActor id
      a.getTexture().name
    else
      null

  ###
  # Retrieve an Actor's texture repeat
  #
  # @param [Number] id
  # @return [Object] repeat
  ###
  getTextureRepeat: (id) ->
    if a = @_findActor id
      a.getTextureRepeat()
    else
      null

  ###
  # Set the height of the rectangle actor with the specified ID
  #
  # @param [Number] id
  # @param [Number] height
  # @return [Boolean] success
  ###
  setRectangleHeight: (id, height) ->
    if (a = @_findActor(id)) && a instanceof ARERectangleActor
      a.setHeight height
      true
    else
      false

  ###
  # Set the width of the rectangle actor with the specified ID
  #
  # @param [Number] id
  # @param [Number] width
  # @return [Boolean] success
  ###
  setRectangleWidth: (id, width) ->
    if (a = @_findActor(id)) && a instanceof ARERectangleActor
      a.setWidth width
      true
    else
      false

  ###
  # Set the segment count of the polygon actor with the specified ID
  #
  # @param [Number] id
  # @param [Number] segments
  # @return [Boolean] success
  ###
  setPolygonSegments: (id, segments) ->
    if (a = @_findActor(id)) && a instanceof AREPolygonActor
      a.setSegments segments
      true
    else
      false

  ###
  # Set the radius of the polygon actor with the specified ID
  #
  # @param [Number] id
  # @param [Number] radius
  # @return [Boolean] success
  ###
  setPolygonRadius: (id, radius) ->
    if (a = @_findActor(id)) && a instanceof AREPolygonActor
      a.setRadius radius
      true
    else
      false


  ###
  # Get the radius of the polygon actor with the specified ID
  #
  # @param [Number] id
  # @return [Number] radius
  ###
  getPolygonRadius: (id) ->
    if (a = @_findActor(id)) && a instanceof AREPolygonActor
      a.getRadius()
    else
      null

  ###
  # Get the segment count of the polygon actor with the specified ID
  #
  # @param [Number] id
  # @return [Number] segments
  ###
  getPolygonSegments: (id, radius) ->
    if (a = @_findActor(id)) && a instanceof AREPolygonActor
      a.getSegments()
    else
      null

  ###
  # Attach texture to actor. Fails if actor isn't found
  #
  # @param [Number] id id of actor to attach texture to
  # @param [String] texture texture name
  # @param [Number] width attached actor width
  # @param [Number] height attached actor height
  # @param [Number] offx anchor point offset
  # @param [Number] offy anchor point offset
  # @param [Angle] angle anchor point rotation
  # @return [Boolean] success
  ###
  attachTexture: (id, texture, w, h, x, y, angle) ->
    x ||= 0
    y ||= 0
    angle ||= 0

    if a = @_findActor id
      a.attachTexture texture, w, h, x, y, angle
      return true

    false

  ###
  # Set actor layer. Fails if actor isn't found.
  # Actors render from largest layer to smallest
  #
  # @param [Number] id id of actor to set layer of
  # @param [Number] layer
  # @return [Boolean] success
  ###
  setLayer: (id, layer) ->
    if a = @_findActor id
      a.setLayer layer
      true
    else
      false

  ###
  # Set actor physics layer. Fails if actor isn't found.
  # Physics layers persist within an actor between body creations. Only bodies
  # in the same layer will collide! There are only 16 physics layers!
  #
  # @param [Number] id id of actor to set layer of
  # @param [Number] layer
  # @return [Boolean] success
  ###
  setPhysicsLayer: (id, layer) ->
    if a = @_findActor id
      a.setPhysicsLayer layer
      true
    else
      false

  ###
  # Remove attachment from an actor. Fails if actor isn't found
  #
  # @param [Number] id id of actor to remove texture from
  # @return [Boolean] success
  ###
  removeAttachment: (id) ->
    if a = @_findActor id
      a.removeAttachment()
      true
    else
      false

  ###
  # Set attachment visiblity. Fails if actor isn't found, or actor has no
  # attachment.
  #
  # @param [Number] id id of actor to modify
  # @param [Boolean] visible
  # @return [Boolean] success
  ###
  setAttachmentVisiblity: (id, visible) ->
    if a = @_findActor id
      a.setAttachmentVisibility visible
    else
      false

  ###
  # Refresh actor vertices, passed in as a flat array
  #
  # @param [Number] id actor id
  # @param [Array<Number<] verts
  # @return [Boolean] success
  ###
  setVertices: (id, verts) ->
    if a = @_findActor id
      a.updateVertices verts
      true
    else
      false

  ###
  # Get actor vertices as a flat array
  #
  # @param [Number] id actor id
  # @return [Array<Number>] vertices
  ###
  getVertices: (id) ->
    if a = @_findActor id
      a.getVertices()
    else
      null

  ###
  # Clears stored information about the actor in question. This includes the
  # rendered and physics bodies
  #
  # @param [Numer] id actor id
  # @return [Boolean] success
  ###
  destroyActor: (id) ->
    if a = @_findActor id
      a.destroy()
      true
    else
      false

  ###
  # Supply an alternate set of vertices for the physics body of an actor. This
  # is necessary for triangle-fan shapes, since the center point must be
  # removed when building the physics body. If a physics body already exists,
  # this rebuilds it!
  #
  # @param [Number] id actor id
  # @param [Array<Number>] verts
  # @return [Boolean] success
  ###
  setPhysicsVertices: (id, verts) ->
    if a = @_findActor id
      a.setPhysicsVertices verts
      true
    else
      false

  ###
  # Change actors' render mode, currently only options are avaliable
  #   1 == TRIANGLE_STRIP
  #   2 == TRIANGLE_FAN
  #
  # @param [Number] id actor id
  # @param [Number] mode
  # @return [Boolean] success
  ###
  setRenderMode: (id, mode) ->
    if a = @_findActor id
      a.setRenderMode mode
      true
    else
      false

  ###
  # Set actor opacity using handle, fails with false
  #
  # @param [Number] id
  # @param [Number opacity
  # @return [Boolean] success
  ###
  setOpacity: (id, opacity) ->
    return false if isNaN opacity
    opacity = Number opacity

    opacity = 1.0 if opacity > 1.0
    opacity = 0.0 if opacity < 0.0

    if a = @_findActor id
      a.setOpacity opacity
      true
    else
      false

  ###
  # Set actor visible using handle, fails with false
  #
  # @param [Number] id
  # @param [Boolean] visible
  # @return [Boolean] success
  ###
  setVisible: (id, visible) ->
    if a = @_findActor id
      a.setVisible visible
      true
    else
      false

  ###
  # Set actor position using handle, fails with false
  #
  # @param [Number] id
  # @param [Object] position
  # @option position [Number] x x coordinate
  # @option position [Number] y y coordinate
  # @return [Boolean] success
  ###
  setPosition: (id, position) ->
    if a = @_findActor id
      a.setPosition position
      true
    else
      false

  ###
  # Set actor rotation using handle, fails with false
  #
  # @param [Number] id
  # @param [Number] angle in degrees or radians
  # @param [Boolean] radians defaults to false
  # @return [Boolean] success
  ###
  setRotation: (id, angle, radians) ->
    if a = @_findActor id
      a.setRotation angle, !!radians
      true
    else
      false

  ###
  # Set actor color using handle, fails with false
  #
  # @param [Number] id
  # @param [Object] color
  # @option color [Number] r red component
  # @option color [Number] g green component
  # @option color [Number] b blue component
  # @return [Boolean] success
  ###
  setColor: (id, color) ->
    if a = @_findActor id
      a.setColor color
      true
    else
      false

  ###
  # Set actor texture by texture handle. Expects the texture to already be
  # loaded by the asset system!
  #
  # @param [Number] id
  # @param [String] name
  # @return [Boolean] success
  ###
  setTexture: (id, name) ->
    if a = @_findActor id
      a.setTexture name
      true
    else
      false

  ###
  # Set actor texture repeat
  #
  # @param [Number] id
  # @param [Object] repeat
  # @option repeat [Number] x horizontal repeat
  # @option repeat [Number] y vertical repeat (default 1)
  # @return [Boolean] success
  ###
  setTextureRepeat: (id, repeat) ->
    if a = @_findActor id
      a.setTextureRepeat repeat.x, repeat.y
      true
    else
      false

  ###
  # Creates the internal physics body, if one does not already exist
  # Fails with false
  #
  # @param [Number] id
  # @param [Number] mass 0.0 - unbound
  # @param [Number] friction 0.0 - 1.0
  # @param [Number] elasticity 0.0 - 1.0
  # @return [Boolean] success
  ###
  createPhysicsBody: (id, mass, friction, elasticity) ->
    if a = @_findActor id
      a.createPhysicsBody mass, friction, elasticity
      true
    else
      false

  ###
  # Destroys the physics body if one exists, fails with false
  #
  # @param [Number] id
  # @return [Boolean] success
  ###
  destroyPhysicsBody: (id) ->
    if a = @_findActor id
      a.destroyPhysicsBody()
      true
    else
      false

  ##
  ## TODO: New NRAID methods
  ##
  enable2DMode: (id) -> false
  disable2DMode: (id) -> false
  is2DModeEnabled: (id) -> false

  create3DActor: (verts) -> false

  beginActorBatch: -> false
  endActorBatch: -> false

  # TODO: Modify setPosition to be 3D
  # TODO: Modify setRotation to be 3D
  set2DRotation: (id, angle) -> false
  rotateInto2DPlane: (id) -> false

  clearTexture: (id) -> false

  # TODO: Modify setVertices to pass 3D verts
  set2DVertices: (id, verts) -> false
  setTextureCoords: (id, coords) -> false
  getTextureCoords: (id) -> null

  # TODO: Modify getPosition to return 3D position
  # TODO: Modify getRotation to return 3D rotation
  get2DRotation: (id) -> null

  getAABB: (id) -> null
  destroy: (id) -> false

  setAttachment: (id, attachment) -> false
  setAttachmentOffset: (id, offset) -> false
  setAttachmentRotation: (id, rotation) -> false
  getAttachmentID: (id) -> null
  getAttachmentVisibility: (id) -> null
  getAttachmentOffset: (id) -> null
  getAttachmentRotation: (id) -> null

###
# Calculates the next power of 2 number from (x)
# @param [Number] x
###
nextHighestPowerOfTwo = (x) ->
  --x
  i = 1

  while i < 32
    x = x | x >> i
    i <<= 1

  x + 1

# Renderer interface class
class AREEngineInterface

  constructor: (@_masterInterface) ->

  ###
  # Initialize the engine
  #
  # @param [Number] width
  # @param [Number] height
  # @param [Method] ad function to call to create ad
  # @param [Number] log loglevel, defaults to 1
  # @param [String] id id of element to instantiate on
  ###
  initialize: (width, height, ad, log, id) ->
    log = 4 if isNaN log
    id ||= ""

    # If we've already initialised once, show a warning and just callback
    # immediately
    if @_engine
      ARELog.warn "Re-initialize attempt, ignoring and passing through"
      return ad @_engine

    ###
    # Should WGL textures be flipped by their Y axis?
    # NOTE. This does not affect existing textures.
    ###
    @wglFlipTextureY = true

    # Callback fires *after* physics init, which takes awhile
    @_engine = new ARE width, height, =>
      ad @_engine
    , log, id

    # Initiliase our engine as everything is ready at this point (except psyx)
    @_masterInterface.setEngine @_engine
    @_renderer = @_engine.getRenderer()
    @_engine

  ###
  # Set global render mode
  #   @see ARERenderer.RENDERER_MODE_*
  #
  # This is a special method only we implement; as such, any libraries
  # interfacing with us should check for the existence of the method before
  # calling it!
  ###
  getRendererMode: -> @_renderer.getActiveRendererMode()

  ###
  # Set engine clear color
  #
  # @param [Object] color
  # @option color [Number] r red component
  # @option color [Number] g green component
  # @option color [Number] b blue component
  ###
  setClearColor: (color) ->    
    return unless @_renderer
    @_renderer.setClearColor color.r, color.g, color.b

  ###
  # Get engine clear color
  #
  # @return [Object] color {r, g, b}
  ###
  getClearColor: ->
    return unless @_renderer

    col = @_renderer.getClearColor()
    
    {
      r: col.getR()
      g: col.getG()
      b: col.getB()
    }

  ###
  # Set log level
  #
  # @param [Number] level 0-4
  ###
  setLogLevel: (level) ->
    level = Number level

    if isNaN level
      return ARELog.warn "Log level is NaN"

    level = Math.round level
    level = 0 if level < 0
    level = 4 if level > 4

    ARELog.level = level

  ###
  # Get the engine log level
  #
  # @return [Number] level
  ###
  getLogLevel: ->
    ARELog.level

  ###
  # Set camera center position with an object. Leaving out a component leaves it
  # unchanged.
  #
  # @param [Object] position
  # @option position [Number] x x component
  # @option position [Number] y y component
  ###
  setCameraPosition: (position) ->
    currentPosition = @_renderer.getCameraPosition()

    currentPosition.x = position.x if position.x != undefined
    currentPosition.y = position.y if position.y != undefined

    @_renderer.setCameraPosition currentPosition

  ###
  # Fetch camera position as an object
  #
  # @return [Object] position {x, y}
  ###
  getCameraPosition: ->
    @_renderer.getCameraPosition()

  ###
  # Return our engine's width
  #
  # @return [Number] width
  ###
  getWidth: ->
    return -1 unless @_renderer
    @_renderer.getWidth()

  ###
  # Return our engine's height
  #
  # @return [Number] height
  ###
  getHeight: ->
    return -1 unless @_renderer
    @_renderer.getHeight()

  ###
  # Enable/disable benchmarking.
  #
  # NOTE: This is a special method that only we have.
  #
  # @param [Boolean] benchmark
  ###
  setBenchmark: (status) ->
    return unless @_engine
    @_engine.benchmark = status
    window.AREMessages.broadcast value: status, "physics.benchmark.set"

  ###
  # Get the NRAID version string that this ad engine supports. It is implied
  # that we are backwards compatible with all previous versions.
  #
  # @return [String] version
  ###
  getNRAIDVersion: ->
    "1.0.0,freestanding"

  ###
  # Fetch meta data as defined in loaded manifest
  #
  # @return [Object] meta
  ###
  getMetaData: ->
    @_metaData

  ###
  # Load a package.json manifest, assume texture paths are relative to our
  # own.
  #
  # As we are a browser engine built for the desktop, and therefore don't
  # support mobile device features like orientation, or need to load files off
  # the disk, we only support a subset of the NRAID creative manifest.
  #
  # @param [Object] manifest
  # @option manifest [String] version NRAID version string
  # @option manifest [Object] meta
  # @option manifest [Array<Object>] textures
  # @param [Method] cb callback to call once the load completes (textures)
  ###
  loadManifest: (manifest, cb) ->
    unless manifest.version
      throw new Error "No manifest version provided!"

    # Ensure we are of the proper version
    if manifest.version.split(",")[0] > @getNRAIDVersion().split(",")[0]
      throw new Error "Unsupported NRAID version"

    # We store meta data on ourselves
    @_metaData = manifest.meta

    if manifest.textures
      async.each manifest.textures, (tex, done) =>
        @loadTexture tex, ->
          done()
        , @wglFlipTextureY
      , cb
    else
      cb()

  ###
  # Loads a texture, and adds it to our renderer
  #
  # @param [Object] textureDef Texture definition object, NRAID-compatible
  # @param [Method] cb called when texture is loaded
  # @param [Boolean] flipTexture optional
  ###
  loadTexture: (textureDef, cb, flipTexture) ->
    flipTexture = @wglFlipTextureY if typeof flipTexture != "boolean"
    
    if !!textureDef.atlas
      throw new Error "This version of ARE does not support atlas loading!"

    # Create texture and image
    img = new Image()
    img.crossOrigin = "anonymous"

    gl = @_renderer.getGL()
    tex = null

    if @_renderer.isWGLRendererActive()

      tex = gl.createTexture()
      img.onload = =>
        ARELog.info "Loading GL tex: #{textureDef.name}, #{textureDef.file}"

        scaleX = 1
        scaleY = 1

        # Resize image if needed
        w_NPOT = (img.width & (img.width - 1)) != 0
        h_NPOT = (img.height & (img.height - 1)) != 0

        if w_NPOT || h_NPOT

          canvas = document.createElement "canvas"

          canvas.width = nextHighestPowerOfTwo img.width
          canvas.height = nextHighestPowerOfTwo img.height

          scaleX = img.width / canvas.width
          scaleY = img.height / canvas.height

          ctx = canvas.getContext "2d"
          ctx.drawImage img, 0, 0, canvas.width, canvas.height

          img = canvas

        # Set up GL texture
        gl.bindTexture gl.TEXTURE_2D, tex
        gl.pixelStorei gl.UNPACK_FLIP_Y_WEBGL, flipTexture
        gl.texImage2D gl.TEXTURE_2D, 0,
                      gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img

        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR
        gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR

        # gl.generateMipmap gl.TEXTURE_2D
        gl.bindTexture gl.TEXTURE_2D, null

        # Add to renderer
        @_renderer.addTexture
          name: textureDef.name
          texture: tex
          width: img.width
          height: img.height
          scaleX: scaleX
          scaleY: scaleY

        cb() if cb

    else
      img.onload = =>
        ARELog.info "Loading canvas tex: #{textureDef.name}, #{textureDef.file}"

        # Add to renderer
        @_renderer.addTexture
          name: textureDef.name
          texture: img
          width: img.width
          height: img.height

        cb() if cb

    # Load!
    img.src = textureDef.file

  ###
  # Get renderer texture size by name
  #
  # @param [String] name
  # @param [Object] size
  ###
  getTextureSize: (name) ->
    @_renderer.getTextureSize name

# Animation interface class
class AREAnimationInterface

  # A map of properties and their animations. Note that the editor uses this
  # same map to properly format animation exports!
  #
  # @private
  @_animationMap:

    # AREBezAnimation
    "position": AREBezAnimation
    "color": AREBezAnimation
    "rotation": AREBezAnimation

    # AREPsyxAnimation
    "mass": AREPsyxAnimation
    "friction": AREPsyxAnimation
    "elasticity": AREPsyxAnimation
    "physics": AREPsyxAnimation

    # AREVertAnimation
    "vertices": AREVertAnimation

  constructor: (masterInterface) ->

  # Set the target ARE instance
  setEngine: (engine) ->
    @_renderer = engine.getRenderer()

  # Check if we know how to directly animate the property provided
  #
  # @param [String] property property name, parent name if composite
  # @return [Boolean] canAnimate
  canAnimate: (property) ->
    !!AREAnimationInterface._animationMap[property]

  # Grab animation target for a property, if we support it. Null otherwise.
  #
  # @param [String] property property name, arent name if composite
  # @return [String] name
  getAnimationName: (property) ->
    if !AREAnimationInterface._animationMap[property]
      return false
    else
      switch AREAnimationInterface._animationMap[property]
        when AREBezAnimation then return "bezier"
        when AREPsyxAnimation then return "psyx"
        when AREVertAnimation then return "vert"
        else return false

  # Top-level animate method for ARE, creates specific animations internally
  # depending on the requirements of the input. Fails with null if the property
  # is not recognized.
  #
  # An optional 'start' parameter can be passed in on the 'options' object,
  # signifying when to initiate the animation. (< 0) means now, (> 0) after
  # 'start' ms, and 0 as default no auto start
  #
  # @param [Number] actorID id of actor to animate, as per AREActorInterface
  # @param [Array<String>] property property array, second element is component
  # @param [Object] options options to pass to animation, varies by property
  animate: (actorID, property, options) ->
    options.start ||= 0

    actor = null

    for a in @_renderer._actors
      if a.getId() == actorID
        actor = a
        break

    if actor == null
      throw new Error "Actor not found, can't animate! #{actorId}"

    # Grab true property name
    name = property[0]

    if options.property == undefined then options.property = property

    # Build animation according to mapping
    _spawnAnim = (_n, _a, _o) ->
      if AREAnimationInterface._animationMap[_n] == AREBezAnimation
        new AREBezAnimation(_a, _o).animate()
      else if AREAnimationInterface._animationMap[_n] == AREPsyxAnimation
        new AREPsyxAnimation(_a, _o).animate()
      else if AREAnimationInterface._animationMap[_n] == AREVertAnimation
        new AREVertAnimation(_a, _o).animate()
      else ARELog.warn "Unrecognized property: #{_n}"

    if options.start > 0
      setTimeout (-> _spawnAnim name, actor, options), options.start
    else
      _spawnAnim name, actor, options

  # Return bezier output for a specific set of animation options. Requires
  # a startVal on the options object!
  #
  # Result contains a "values" key, and a "stepTime" key
  #
  # @param [Object] options
  # @option options [Number] startVal
  # @option options [Number] endVal
  # @option options [Array<Object>] controlPoints
  # @option options [Number] duration
  # @option options [Number] fps framerate, defaults to 30
  # @return [Array<Number>] bezValues
  preCalculateBez: (options) ->
    options.controlPoints ||= 0
    options.fps ||= 30

    new AREBezAnimation(null, options, true).preCalculate()

# Engine interface, used by the ads themselves, serves as an API
#
# @depend actor_interface.coffee
# @depend engine_interface.coffee
# @depend animation_interface.coffee
class AREInterface

  # Instantiates sub-interfaces
  constructor: ->
    @_Actors = new AREActorInterface @
    @_Engine = new AREEngineInterface @
    @_Animations = new AREAnimationInterface @

  # Sub-interfaces are broken out through accessors to prevent modification

  # Get actor sub-interface
  # @return [AREActorInterface] actors
  Actors: -> @_Actors

  # Get renderer sub-interface
  # @return [AREEngineInterface] renderer
  Engine: -> @_Engine

  # Get animation sub-interface
  # @return [AREAnimationInterface] animations
  Animations: -> @_Animations

  # Set the ARE instance targeted by the interface
  setEngine: (engine) ->
    @_Actors.setEngine engine
    @_Animations.setEngine engine

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
        chipmunk: "/components/chipmunk/cp.js"
        physics_worker: "/lib/physics/worker.js"

  @Version:
    MAJOR: 1
    MINOR: 5
    PATCH: 1
    BUILD: null
    STRING: "1.5.1"

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
