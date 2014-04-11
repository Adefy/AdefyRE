##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# This class implements some helper methods for function param enforcement
# It simply serves to standardize error messages for missing/incomplete
# parameters, and set them to default values if such values are provided.
#
# Since it can be used in every method of every class, it is created static
# and attached to the window object as 'param'
class AREUtilParam

  # Defines an argument as required. Ensures it is defined and valid
  #
  # @param [Object] p parameter to check
  # @param [Array] valid optional array of valid values the param can have
  # @param [Boolean] canBeNull true if the value can be null
  # @return [Object] p
  @required: (p, valid, canBeNull) ->

    if p == null and canBeNull != true then p = undefined
    if p == undefined then throw new Error "Required argument missing!"

    # Check for validity if required
    if valid instanceof Array
      if valid.length > 0
        isValid = false
        for v in valid
          if p == v
            isValid = true
            break
        if not isValid
          throw new Error "Required argument is not of a valid value!"

    # Ship
    p

  # Defines an argument as optional. Sets a default value if it is not
  # supplied, and ensures validity (post-default application)
  #
  # @param [Object] p parameter to check
  # @param [Object] def default value to use if necessary
  # @param [Array] valid optional array of valid values the param can have
  # @param [Boolean] canBeNull true if the value can be null
  # @return [Object] p
  @optional: (p, def, valid, canBeNull) ->

    if p == null and canBeNull != true then p = undefined
    if p == undefined then p = def

    # Check for validity if required
    if valid instanceof Array
      if valid.length > 0
        isValid = false
        for v in valid
          if p == v
            isValid = true
            break
        if not isValid
          throw new Error "Required argument is not of a valid value!"

    p

if window.param == undefined then window.param = AREUtilParam

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Raw actor class, handles rendering and physics simulation. Offers a base
# for the specialized actor classes.
#
# Constructs itself from the supplied vertex and UV sets
class ARERawActor

  @defaultFriction: 0.3
  @defaultMass: 10
  @defaultElasticity: 0.2

  ###
  # Null offset, used when creating dynamic bodies
  # @private
  ###
  @_nullV: new cp.v 0, 0

  ###
  # Adds the actor to the renderer actor list, gets a unique id from the
  # renderer, and builds our vert buffer.
  #
  # If no texture verts are provided, a default array is provided for square
  # actors.
  #
  # @param [Array<Number>] vertices flat array of vertices (x1, y1, x2, ...)
  # @param [Array<Number>] texverts flat array of texture coords, optional
  ###
  constructor: (verts, texverts) ->
    param.required verts
    texverts = param.optional texverts, null

    @_initializeValues()
    @_registerWithRenderer()

    @updateVertices verts, texverts
    @setColor new AREColor3 255, 255, 255

    # Default to flat rendering
    @clearTexture()

  ###
  # Gets an id and registers our existence with the renderer
  # @private
  ###
  _registerWithRenderer: ->
    @_id = ARERenderer.getNextId()
    ARERenderer.addActor @

  ###
  # Sets up default values and initializes our data structures.
  # @private
  ###
  _initializeValues: ->

    if ARERenderer.activeRendererMode == ARERenderer.RENDERER_MODE_WGL
      @_gl = ARERenderer._gl
      if @_gl == undefined or @_gl == null
        throw new Error "GL context is required for actor initialization!"

    # Initialize our rendering objects
    @_rotV = new Vector3([0, 0, 1])
    @_transV = new Vector3([0, 0, 1])
    @_modelM = new Matrix4()

    # Color used for drawing, colArray is pre-computed for the render routine
    @_color = null
    @_strokeColor = null
    @_strokeWidth = 1
    @_colArray = null

    @_opacity = 1.0

    @lit = false
    @_visible = true
    @layer = 0
    @_physicsLayer = ~0

    @_id = -1
    @_position = new cp.v 0, 0
    @_rotation = 0 # Radians, but set in degrees by default

    ## size calculated by from verticies
    @_size =
      x: 0
      y: 0

    ###
    # Chipmunk-js values
    ###
    @_shape = null
    @_body = null
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
    # @see AREREnderer.RENDER_MODE_*
    ###
    @_renderMode = ARERenderer.RENDER_MODE_TRIANGLE_FAN

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
  # Removes the Actor
  # @return [null]
  ###
  destroy: ->
    @destroyPhysicsBody()
    null

  ###
  # Get material name
  #
  # @return [String] material
  ###
  getMaterial: -> @_material

  ###
  # Set our render layer. Higher layers render on top of lower ones
  #
  # @param [Number] layer
  ###
  setLayer: (layer) ->
    @layer = param.required layer

    # Re-insert ourselves with new layer
    ARERenderer.removeActor @, true
    ARERenderer.addActor @

  ###
  # We support a single texture per actor for the time being. UV coords are
  # generated automatically internally, for a flat map.
  #
  # @param [String] name name of texture to use from renderer
  # @return [this]
  ###
  setTexture: (name) ->
    param.required name

    if not ARERenderer.hasTexture name
      throw new Error "No such texture loaded: #{name}"

    @_texture = ARERenderer.getTexture name
    @setShader ARERenderer.getMe().getTextureShader()
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

    @setShader ARERenderer.getMe().getDefaultShader()
    @_material = ARERenderer.MATERIAL_FLAT
    @

  ###
  # Get our texture, if we have one
  #
  # @return [WebGLTexture] texture
  ###
  getTexture: -> @_texture

  ###
  # Set shader used to draw actor. For the time being, the routine mearly
  # pulls out handles for the ModelView, Color, and Position structures
  #
  # @param [AREShader] shader
  # @return [this]
  ###
  setShader: (shader) ->
    if ARERenderer.activeRendererMode == ARERenderer.RENDERER_MODE_WGL
      param.required shader
      # Ensure shader is built, and generate handles if not already done
      if shader.getProgram() == null
        throw new Error "Shader has to be built before it can be used!"

      if shader.getHandles() == null
        shader.generateHandles()

      handles = shader.getHandles()

      @_sh_handles = handles

    else
      #ARELog.info "Shader's are not supported with this render mode"

  ###
  # Creates the internal physics body, if one does not already exist
  #
  # @param [Number] mass 0.0 - unbound
  # @param [Number] friction 0.0 - unbound
  # @param [Number] elasticity 0.0 - unbound
  ###
  createPhysicsBody: (@_mass, @_friction, @_elasticity) ->

    # Start the world stepping if not already doing so
    if AREPhysics.getWorld() == null or AREPhysics.getWorld() == undefined
      AREPhysics.startStepping()

    if @_shape == not null then return

    if AREPhysics.bodyCount == 0 then AREPhysics.startStepping()

    AREPhysics.bodyCount++

    # Sanity checks
    if @_mass == undefined or @_mass == null then @_mass = 0
    if @_mass < 0 then @_mass = 0

    if @_friction == undefined
      @_friction = ARERawActor.defaultFriction
    else if @_friction < 0 then @_friction = 0

    if @_elasticity == undefined
      @_elasticity = ARERawActor.defaultElasticity
    else if @_elasticity < 0 then @_elasticity = 0

    # Convert vertices
    verts = []
    vertIndex = 0

    # If we have alternate vertices, use those, otherwise go with the std ones
    origVerts = null
    if @_psyxVertices.length > 6 then origVerts = @_psyxVertices
    else origVerts = @_vertices

    for i in [0...origVerts.length - 1] by 2

      # Actual coord system conversion
      verts.push origVerts[i] / ARERenderer.getPPM()
      verts.push origVerts[i + 1] / ARERenderer.getPPM()

      # Rotate vert if mass is 0, since we can't set static body angle
      if @_mass == 0
        x = verts[verts.length - 2]
        y = verts[verts.length - 1]
        a = @_rotation

        verts[verts.length - 2] = x * Math.cos(a) - (y * Math.sin(a))
        verts[verts.length - 1] = x * Math.sin(a) + (y * Math.cos(a))

    # Grab world handle to shorten future calls
    space = AREPhysics.getWorld()
    pos = ARERenderer.screenToWorld @_position

    if @_mass == 0
      @_shape = space.addShape new cp.PolyShape space.staticBody, verts, pos
      @_shape.setLayers @_physicsLayer
      @_body = null
    else
      moment = cp.momentForPoly @_mass, verts, ARERawActor._nullV
      @_body = space.addBody new cp.Body @_mass, moment
      @_body.setPos pos
      @_body.setAngle @_rotation

      @_shape = new cp.PolyShape @_body, verts, ARERawActor._nullV
      @_shape = space.addShape @_shape
      @_shape.setLayers @_physicsLayer

    @_shape.setFriction @_friction
    @_shape.setElasticity @_elasticity

    @

  ###
  # Destroys the physics body if one exists
  ###
  destroyPhysicsBody: ->
    if AREPhysics.bodyCount == 0 then return
    if @_shape == null then return

    AREPhysics.bodyCount--

    AREPhysics.getWorld().removeShape @_shape
    if @_body then AREPhysics.getWorld().removeBody @_body

    @_shape = null
    @_body = null

    if AREPhysics.bodyCount == 0
      AREPhysics.stopStepping()
    else if AREPhysics.bodyCount < 0
      throw new Error "Body count is negative!"

  ###
  # Set physics layer. If we have a physics body, applies immediately. Value
  # persists between physics bodies!
  #
  # There are only 16 physics layers (17 with default layer 0)!
  #
  # @param [Number] layer
  ###
  setPhysicsLayer: (layer) ->
    @_physicsLayer = 1 << param.required(layer, [0..16])

    if @_shape != null then @_shape.setLayers @_physicsLayer

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
    newVertices = param.optional vertices, @_vertices
    newTexVerts = param.optional texverts, @_texVerts

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

    if newVertices != @_vertices then @updateVertBuffer newVertices
    if newTexVerts != @_texVerts then @updateUVBuffer newTexVerts

  ###
  # Updates vertex buffer
  # NOTE: No check is made as to the validity of the supplied data!
  #
  # @private
  # @param [Array<Number>] vertices
  ###
  updateVertBuffer: (@_vertices) ->
    @_vertBufferFloats = new Float32Array(@_vertices)

    if ARERenderer.activeRendererMode == ARERenderer.RENDERER_MODE_WGL
      @_vertBuffer = @_gl.createBuffer()
      @_gl.bindBuffer @_gl.ARRAY_BUFFER, @_vertBuffer
      @_gl.bufferData @_gl.ARRAY_BUFFER, @_vertBufferFloats, @_gl.STATIC_DRAW
      @_gl.bindBuffer @_gl.ARRAY_BUFFER, null

    mnx = 0
    mny = 0
    mxx = 0
    mxy = 0

    for i in [1..(@_vertices.length / 2)]
      if @_vertices[i * 2] < mnx
        mnx = @_vertices[i * 2]
      if mxx < @_vertices[i * 2]
        mxx = @_vertices[i * 2]
      if @_vertices[i * 2 + 1] < mny
        mny = @_vertices[i * 2 + 1]
      if mxy < @_vertices[i * 2 + 1]
        mxy = @_vertices[i * 2 + 1]

    @_size.x = mxx - mnx
    @_size.y = mxy - mny

  ###
  # Updates UV buffer (should only be called by updateVertices())
  # NOTE: No check is made as to the validity of the supplied data!
  #
  # @private
  # @param [Array<Number>] vertices
  ###
  updateUVBuffer: (@_texVerts) ->
    if ARERenderer.activeRendererMode == ARERenderer.RENDERER_MODE_WGL
      @_origTexVerts = @_texVerts
      @_texVBufferFloats = new Float32Array(@_texVerts)
      @_texBuffer = @_gl.createBuffer()
      @_gl.bindBuffer @_gl.ARRAY_BUFFER, @_texBuffer
      @_gl.bufferData @_gl.ARRAY_BUFFER, @_texVBufferFloats, @_gl.STATIC_DRAW
      @_gl.bindBuffer @_gl.ARRAY_BUFFER, null

  ###
  # Set texture repeat per coordinate axis
  #
  # @param [Number] x horizontal repeat
  # @param [Number] y vertical repeat (default 1)
  ###
  setTextureRepeat: (x, y) ->
    param.required x
    y = param.optional y, 1

    uvs = []

    for i in [0...@_origTexVerts.length] by 2
      uvs.push (@_origTexVerts[i] / @_texRepeatX) * x
      uvs.push (@_origTexVerts[i + 1] / @_texRepeatY) * y

    @_texRepeatX = x
    @_texRepeatY = y

    @updateUVBuffer uvs
    @

  ###
  # Set an alternate vertex array for our physics object. Note that this also
  # triggers a rebuild! If less than 6 vertices are provided, the normal
  # set of vertices is used
  #
  # @param [Array<Number>] verts flat array of vertices
  ###
  setPhysicsVertices: (verts) ->
    @_psyxVertices = param.required verts

    if @_body != null
      @destroyPhysicsBody()
      @createPhysicsBody @_mass, @_friction, @_elasticity

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
    param.required texture
    param.required width
    param.required height
    @attachedTextureAnchor.width = width
    @attachedTextureAnchor.height = height
    @attachedTextureAnchor.x = param.optional offx, 0
    @attachedTextureAnchor.y = param.optional offy, 0
    @attachedTextureAnchor.angle = param.optional angle, 0

    # Sanity check
    if not ARERenderer.hasTexture texture
      throw new Error "No such texture loaded: #{texture}"

    # If we already have an attachment, discard it
    if @_attachedTexture
      @removeAttachment()

    # this will force the actor to render with attachment parameters
    @_attachedTexture = new ARERectangleActor width, height
    @_attachedTexture.setTexture texture
    @_attachedTexture

    # Now we replace the active texture, with the attached one
    #@_attachedTexture = texture
    #@setTexture texture
    #@


  ###
  # Remove attached texture, if we have one
  #
  # @return [Boolean] success fails if we have no attached texture
  ###
  removeAttachment: ->
    return false unless @_attachedTexture

    ARERenderer.removeActor @_attachedTexture
    @_attachedTexture = null
    true

  ###
  # Set attachment visiblity. Fails if we don't have an attached texture
  #
  # @param [Boolean] visible
  # @return [Boolean] success
  ###
  setAttachmentVisibility: (visible) ->
    param.required visible

    if @_attachedTexture == null then return false

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

      # Get physics updates
      @updatePosition()

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

      return a

    return @

  ###
  # Update position from physics body if we have one
  ###
  updatePosition: ->
    # @_body is null for static bodies!
    if @_body != null
      @_position = ARERenderer.worldToScreen @_body.getPos()
      @_rotation = @_body.a

    @

  ###
  # Binds the actor's WebGL Texture with all needed attributes
  # @param [Object] gl WebGL Context
  ###
  wglBindTexture: (gl) ->
    # Texture rendering, if needed
    if @_material == ARERenderer.MATERIAL_TEXTURE
      gl.bindBuffer gl.ARRAY_BUFFER, @_texBuffer

      gl.vertexAttribPointer @_sh_handles.aTexCoord, 2, gl.FLOAT, false, 0, 0
      #gl.vertexAttrib2f @_sh_handles.aUVScale,
      #  @_texture.scaleX, @_texture.scaleY
      # We apparently don't need uUVScale in webgl
      #gl.uniform2f @_sh_handles.uUVScale, @_texture.scaleX, @_texture.scaleY

      gl.activeTexture gl.TEXTURE0
      gl.bindTexture gl.TEXTURE_2D, @_texture.texture
      gl.uniform1i @_sh_handles.uSampler, 0

    @

  ###
  # Renders the Actor using the WebGL interface, this function should only
  # be called by a ARERenderer in WGL mode
  # @param [Object] gl WebGL context
  ###
  wglDraw: (gl) ->
    param.required gl

    # We only respect our own visibility flag! Any invisible attached textures
    # cause us to render!
    return false unless @_visible

    @updatePosition()

    # Prep our vectors and matrices
    @_modelM = new Matrix4()
    @_transV.elements[0] = @_position.x - ARERenderer.camPos.x
    if ARERenderer.force_pos0_0
      @_transV.elements[1] = ARERenderer.getHeight() - \
                              @_position.y + ARERenderer.camPos.y
    else
      @_transV.elements[1] = @_position.y - ARERenderer.camPos.y

    #@_modelM = @_modelM.x((new Matrix4()).translate(@_transV))
    #@_modelM = @_modelM.x((new Matrix4()).rotate(@_rotation, @_rotV))
    @_modelM.translate(@_transV)
    @_modelM.rotate(-@_rotation, @_rotV)

    #flatMV = new Float32Array(@_modelM.flatten())
    flatMV = @_modelM.flatten()

    gl.bindBuffer gl.ARRAY_BUFFER, @_vertBuffer

    gl.vertexAttribPointer @_sh_handles.aPosition, 2, gl.FLOAT, false, 0, 0

    gl.uniformMatrix4fv @_sh_handles.uModelView, false, flatMV

    gl.uniform4f @_sh_handles.uColor,
      @_colArray[0], @_colArray[1], @_colArray[2], 1.0

    if @_sh_handles.uClipRect
      gl.uniform4fv @_sh_handles.uClipRect, @_clipRect

    gl.uniform1f @_sh_handles.uOpacity, @_opacity

    @wglBindTexture gl

    ###
    # @TODO, actually apply the RENDER_STYLE_*
    ###
    switch @_renderMode
      when ARERenderer.RENDER_MODE_LINE_LOOP
        gl.drawArrays gl.LINE_LOOP, 0, @_vertices.length / 2

      when ARERenderer.RENDER_MODE_TRIANGLE_FAN
        gl.drawArrays gl.TRIANGLE_FAN, 0, @_vertices.length / 2

      when ARERenderer.RENDER_MODE_TRIANGLE_STRIP
        gl.drawArrays gl.TRIANGLE_STRIP, 0, @_vertices.length / 2

      else throw new Error "Invalid render mode! #{@_renderMode}"

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

    if @_material == ARERenderer.MATERIAL_TEXTURE
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
  # @param [Object] 2d context
  ###
  cvDraw: (context) ->
    param.required context

    # We only respect our own visibility flag! Any invisible attached textures
    # cause us to render!
    return false unless @_visible

    @updatePosition()

    # Prep our vectors and matrices
    @_transV.elements[0] = @_position.x - ARERenderer.camPos.x
    @_transV.elements[1] = @_position.y - ARERenderer.camPos.y

    x = @_transV.elements[0]
    y = @_transV.elements[1]

    context.translate(x, y)
    context.beginPath()
    context.rotate(@_rotation)
    context.moveTo(@_vertices[0], @_vertices[1])

    for i in [1..(@_vertices.length / 2)]
      context.lineTo(@_vertices[i * 2], @_vertices[i * 2 + 1])
    context.closePath()
    #context.fill()

    @cvSetupStyle context

    unless ARERenderer.force_pos0_0
      context.scale 1, -1

    switch @_renderMode
      when ARERenderer.RENDER_MODE_LINE_LOOP # stroke
        # regardless of your current renderStyle, this will forever outline.
        context.stroke()

      # canvas doesn't really know what a strip or a fan is...
      when ARERenderer.RENDER_MODE_TRIANGLE_STRIP, \
           ARERenderer.RENDER_MODE_TRIANGLE_FAN # fill

        if (@_renderStyle & ARERenderer.RENDER_STYLE_STROKE) > 0
          context.stroke()

        if (@_renderStyle & ARERenderer.RENDER_STYLE_FILL) > 0
          if @_material == ARERenderer.MATERIAL_TEXTURE
            context.clip()
            context.drawImage @_texture.texture,
                              -@_size.x / 2, -@_size.y / 2, @_size.x, @_size.y
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
    param.required context

    # We only respect our own visibility flag! Any invisible attached textures
    # cause us to render!
    return false unless @_visible

    @updatePosition()

    @

  ###
  # Set actor render mode, decides how the vertices are perceived
  # @see ARERenderer.RENDER_MODE_*
  #
  # @paran [Number] mode
  # @return [self]
  ###
  setRenderMode: (mode) ->
    @_renderMode = param.required mode, ARERenderer.renderModes
    @

  ###
  # Set actor render style, decides how the object is filled/stroked
  # @see ARERenderer.RENDER_STYLE_*
  #
  # @paran [Number] mode
  # @return [self]
  ###
  setRenderStyle: (mode) ->
    @_renderStyle = param.required mode, ARERenderer.renderStyles
    @

  ###
  # Set actor opacity
  #
  # @param [Number] opacity
  # @return [self]
  ###
  setOpacity: (@_opacity) ->
    param.required @_opacity
    @

  ###
  # Set actor position, affects either the actor or the body directly if one
  # exists
  #
  # @param [Object] position x, y
  # @return [self]
  ###
  setPosition: (position) ->
    param.required position

    if @_shape == null
      if position instanceof cp.v
        @_position = position
      else
        @_position = new cp.v Number(position.x), Number(position.y)
    else if @_body != null
      @_body.setPos ARERenderer.screenToWorld position

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
    param.required rotation
    radians = param.optional radians, false

    if radians == false then rotation = Number(rotation) * 0.0174532925

    @_rotation = rotation

    if @_body != null
      @_body.setAngle @_rotation
    else if @_shape != null
      @destroyPhysicsBody()
      @createPhysicsBody @_mass, @_friction, @_elasticity

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
    param.required colOrR

    if colOrR instanceof AREColor3
      target.setR colOrR.getR()
      target.setG colOrR.getG()
      target.setB colOrR.getB()
    else
      param.required g
      param.required b

      target.setR Number(colOrR)
      target.setG Number(g)
      target.setB Number(b)

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
    param.required colOrR

    unless @_color then @_color = new AREColor3

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
    param.required colOrR

    unless @_strokeColor then @_strokeColor = new AREColor3

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

  ###
  # Returns actor rotation as an angle in degrees
  #
  # @param [Boolean] radians true to return in radians
  # @return [Number] angle rotation in degrees on z axis
  ###
  getRotation: (radians) ->
    radians = param.optional radians, false
    if radians == false
      return @_rotation * 57.2957795
    else
      return @_rotation

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

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# @depend raw_actor.coffee

# Simple rectangle actor; allows for creation using a width and height, and
# manipulation of that width/height
class ARERectangleActor extends ARERawActor

  ###
  # Sets us up with the supplied width and height, generating both our vertex
  # and UV sets.
  #
  # @param [Number] width
  # @param [Number] height
  ###
  constructor: (@width, @height) ->
    param.required width
    param.required height

    if width <= 0 then throw new Error "Invalid width: #{width}"
    if height <= 0 then throw new Error "Invalid height: #{height}"

    verts = @generateVertices()
    uvs = @generateUVs()

    super verts, uvs

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
  setWidth: (@width) -> @updateVertBuffer @generateVertices()

  ###
  # Set height, causes a vert refresh
  #
  # @param [Number] height
  ###
  setHeight: (@height) -> @updateVertBuffer @generateVertices()

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# @depend raw_actor.coffee

# Polygon Actor implementation; allows for the creation of polygons with
# arbitrary side counts, and for manipulation by radius and segment count
class AREPolygonActor extends ARERawActor

  ###
  # Sets us up with the supplied radius and segment count, generating our
  # vertex sets.
  #
  # NOTE: Texture support is not available! No UVs! ;(
  #
  # @param [Number] radius
  # @param [Number] segments
  ###
  constructor: (@radius, @segments) ->
    param.required radius

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

      super @_verts, uvs
      @setPhysicsVertices @_verts

    else
      param.required segments

      if radius <= 0 then throw new Error "Invalid radius: #{radius}"
      if segments <= 2 then throw new ERror "Invalid segment count: #{segments}"

      verts = @generateVertices()
      psyxVerts = @generateVertices mode: "physics"
      uvs = @generateUVs verts

      super verts, uvs
      @setPhysicsVertices psyxVerts

    @setRenderMode ARERenderer.RENDER_MODE_TRIANGLE_FAN

  ###
  # @private
  # Private method that rebuilds our vertex array.
  #
  # @param [Object] options optional generation options
  # @options options [Boolean] mode generation mode (normal, or for physics)
  ###
  generateVertices: (options) ->
    options = param.optional options, {}

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

    verts

  ###
  # Generate UV array from a vertex set, using our current radius
  #
  # @return [Array<Number>] uvs
  ###
  generateUVs: (vertices) ->
    param.required vertices

    uvs = []
    for v in vertices
      uvs.push ((v / @radius) / 2) + 0.5

    uvs

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
    if radius <= 0 then throw new Error "Invalid radius: #{radius}"
    @fullVertRefresh()

  ###
  # Set segment count, causes a full vert refresh
  #
  # @param [Number] segments
  ###
  setSegments: (@segments) ->
    if segments <= 2 then throw new ERror "Invalid segment count: #{segments}"
    @fullVertRefresh()

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

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
  # @param [Number] radius
  ###
  constructor: (@radius) ->

    super radius, 32

    # Clear out segment control
    delete @setSegments
    delete @getSegments

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

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
    colOrR = param.optional colOrR, 0
    g = param.optional g, 0
    b = param.optional b, 0

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

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

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

    param.required @_vertSrc
    param.required @_fragSrc
    param.required @_gl
    build = param.optional build, false

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
    param.required @_gl

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

AREShader.shaders = {}
AREShader.shaders.wire = {}
AREShader.shaders.solid = {}
AREShader.shaders.texture = {}

#precision = "highp"
precision = "mediump"
varying_precision = "highp"
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
/* attribute vec2 aUVScale; */

uniform mat4 uProjection;
uniform mat4 uModelView;

varying #{varying_precision} vec2 vTexCoord;
/* varying #{varying_precision} vec2 vUVScale; */

void main() {
  gl_Position = uProjection * uModelView * vec4(aPosition, 1, 1);
  vTexCoord = aTexCoord;
  /* vUVScale = aUVScale; */
}
"""

AREShader.shaders.texture.fragment = """
#{precision_declaration}

uniform sampler2D uSampler;
uniform vec4 uColor;
uniform float uOpacity;
/* uniform #{varying_precision} vec2 uUVScale; */
uniform vec4 uClipRect;

varying #{varying_precision} vec2 vTexCoord;
/* varying #{varying_precision} vec2 vUVScale; */

void main() {
  vec4 baseColor = texture2D(uSampler,
                             uClipRect.xy +
                             vTexCoord * uClipRect.zw);
                             //vTexCoord * uClipRect.zw * uUVScale);
  baseColor *= uColor;

  if(baseColor.rgb == vec3(1.0, 0.0, 1.0))
    discard;

  baseColor.a *= uOpacity;
  gl_FragColor = baseColor;
}
"""
##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# ARERenderer
#
# @depend objects/color3.coffee
# @depend objects/shader.coffee
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
  # @enum
  ###
  @RENDERER_MODE_NULL: 0
  @RENDERER_MODE_CANVAS: 1
  @RENDERER_MODE_WGL: 2

  ###
  # @type [Array<Number>]
  ###
  @rendererModes: [0, 1, 2]

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
  # Render Modes
  # This affects the method GL will use to render a WGL element
  # @enum
  ###
  @RENDER_MODE_LINE_LOOP: 0
  @RENDER_MODE_TRIANGLE_FAN: 1
  @RENDER_MODE_TRIANGLE_STRIP: 2

  ###
  # @type [Array<Number>]
  ###
  @renderModes: [0, 1, 2]

  ###
  # Render Style
  # A render style determines how a canvas element is drawn, this can
  # also be used for WebGL elements as well, as they fine tune the drawing
  # process.
  # STROKE will work with all RENDER_MODE*.
  # FILL will work with RENDER_MODE_TRIANGLE_FAN and
  # RENDER_MODE_TRIANGLE_STRIP only.
  # FILL_AND_STROKE will work with all current render modes, however
  # RENDER_MODE_LINE_LOOP will only use STROKE
  # @enum
  ###
  @RENDER_STYLE_STROKE: 1
  @RENDER_STYLE_FILL: 2
  @RENDER_STYLE_FILL_AND_STROKE: 3

  ###
  # @type [Array<Number>]
  ###
  @renderStyles: [0, 1, 2, 3]

  ###
  # Render Modes
  # This affects the method GL will use to render a WGL element
  # @enum
  ###
  @MATERIAL_NONE: "none"
  @MATERIAL_FLAT: "flat"
  @MATERIAL_TEXTURE: "texture"

  ###
  # Signifies the current material; when this doesn't match, a material change
  # is made (different shader program)
  # @type [MATERIAL_*]
  ###
  @_currentMaterial: "none"

  ###
  # Should 0, 0 always be the top left position?
  ###
  @force_pos0_0: true

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

    @setClearColor 0, 0, 0

    @switchMaterial ARERenderer.MATERIAL_FLAT

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
  @getWidth: -> (@me && @me.getWidth()) || -1

  ###
  # Returns canvas height
  #
  # @return [Number] height
  ###
  getHeight: -> @_height
  @getHeight: -> (@me && @me.getHeight()) || -1

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
        _savedOpacity = a.getOpacity()

        _id = a.getId() - (Math.floor(a.getId() / 255) * 255)
        _idSector = Math.floor(a.getId() / 255)

        @switchMaterial ARERenderer.MATERIAL_FLAT

        # Recover id with (_idSector * 255) + _id
        a.setColor _id, _idSector, 248
        a.setOpacity 1.0
        a.wglDraw gl
        a.setColor _savedColor
        a.setOpacity _savedOpacity

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
    unless ARERenderer.force_pos0_0
      ctx.translate 0, @_height
      ctx.scale 1, -1

    for a in ARERenderer.actors
      ctx.save()

      if @_pickRenderRequested
        # If rendering for picking, we need to temporarily change the color
        # of the actor. Blue key is 248
        _savedColor = a.getColor()
        _savedOpacity = a.getOpacity()

        _id = a.getId() - (Math.floor(a.getId() / 255) * 255)
        _idSector = Math.floor(a.getId() / 255)

        @switchMaterial ARERenderer.MATERIAL_FLAT

        # Recover id with (_idSector * 255) + _id
        a.setColor _id, _idSector, 248
        a.setOpacity 1.0
        a.cvDraw ctx
        a.setColor _savedColor
        a.setOpacity _savedOpacity

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
  # Is the null renderer active?
  # @return [Boolean] is_active
  ###
  isNullRendererActive: ->
    @getActiveRendererMode() == ARERenderer.RENDERER_MODE_NULL

  ###
  # Is the canvas renderer active?
  # @return [Boolean] is_active
  ###
  isCanvasRendererActive: ->
    @getActiveRendererMode() == ARERenderer.RENDERER_MODE_CANVAS

  ###
  # Is the WebGL renderer active?
  # @return [Boolean] is_active
  ###
  isWGLRendererActive: ->
    @getActiveRendererMode() == ARERenderer.RENDERER_MODE_WGL

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

    return false if material == ARERenderer._currentMaterial

    if @isWGLRendererActive()

      ortho = Matrix4.makeOrtho(0, @_width, 0, @_height, -10, 10).flatten()
      ##
      # Its a "Gotcha" from using EWGL
      ortho[15] = 1.0

      gl = ARERenderer._gl


      switch material
        when ARERenderer.MATERIAL_FLAT
          gl.useProgram @_defaultShader.getProgram()

          handles = @_defaultShader.getHandles()
          gl.uniformMatrix4fv handles.uProjection, false, ortho

          gl.enableVertexAttribArray handles.aPosition

        when ARERenderer.MATERIAL_TEXTURE

          gl.useProgram @_texShader.getProgram()

          handles = @_texShader.getHandles()
          gl.uniformMatrix4fv handles.uProjection, false, ortho
          gl.enableVertexAttribArray handles.aPosition
          gl.enableVertexAttribArray handles.aTexCoord
          #gl.enableVertexAttribArray handles.aUVScale

        else
          throw new Error "Unknown material #{material}"

    ARERenderer._currentMaterial = material

    ARELog.info "ARERenderer Switched material #{ARERenderer._currentMaterial}"

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

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Chipmunk-js wrapper
class AREPhysics

  # @property [Number] velocity iterations
  @velIterations: 6

  # @property [Number] position iterations
  @posIterations: 2

  # @property [Number] time to step for
  @frameTime: 1.0 / 60.0

  # acting upwards
  #@_gravity: new cp.v 0, -1
  # 0, 0 acting downwards
  @_gravity: new cp.v 0, 1

  @_stepIntervalId: null
  @_world: null

  @_densityRatio: 1 / 10000

  @bodyCount: 0

  @benchmark: false

  # Constructor, should never be called
  # AREPhysics should only ever be accessed as static
  constructor: -> throw new Error "Physics constructor called"

  # Starts the world step loop if not already running
  @startStepping: ->

    if @_stepIntervalId != null then return

    @_world = new cp.Space
    @_world.gravity = @_gravity
    @_world.iterations = 60
    @_world.collisionSlop = 0.5
    @_world.sleepTimeThreshold = 0.5

    ARELog.info "Starting world update loop"

    avgStep = 0
    stepCount = 0

    @_stepIntervalId = setInterval =>
      start = Date.now()

      @_world.step @frameTime

      if @benchmark
        stepCount++
        avgStep = avgStep + ((Date.now() - start) / stepCount)

        if stepCount % 500 == 0
          console.log "Physics step time: #{avgStep.toFixed(2)}ms"

    , @frameTime

  # Halt the world step loop if running
  @stopStepping: ->
    if @_stepIntervalId == null then return
    ARELog.info "Halting world update loop"
    clearInterval @_stepIntervalId
    @_stepIntervalId = null
    @_world = null

  # Get the internal chipmunk world
  #
  # @return [Object] world
  @getWorld: -> @_world

  # Get object density ratio number thing (keeps it constant)
  #
  # @return [Number] densityRatio
  @getDensityRatio: -> @_densityRatio

  # Get gravity
  #
  # @return [cp.v] gravity
  @getGravity: -> @_gravity

  # Set gravity
  #
  # @param [cp.v] gravity
  @setGravity: (v) ->

    if v !instanceof cp.Vect
      throw new Error "You need to set space gravity using cp.v!"

    @_gravity = v

    if @_world != null and @_world != undefined
      @_world.gravity = v

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

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

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

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
    dryRun = param.optional dryRun, false
    @options = param.required options
    @_duration = param.required options.duration
    param.required options.endVal
    @_property = param.required options.property
    options.controlPoints = param.optional options.controlPoints, []
    @_fps = param.optional options.fps, 30

    if dryRun
      param.optional @actor
      param.required options.startVal
    else param.required @actor

    # Guards against multiple exeuctions
    @_animated = false

    # In bezOpt we will keep all the info we need for the Bezier function
    # which means degree, starting value, final value and the position of
    # the control points provided
    @bezOpt = {}

    if options.controlPoints.length > 0
      @bezOpt.degree = options.controlPoints.length
      if @bezOpt.degree > 0
        param.required options.controlPoints[0].x
        param.required options.controlPoints[0].y
        if @bezOpt.degree == 2
          param.required options.controlPoints[1].x
          param.required options.controlPoints[1].y
      @bezOpt.ctrl = options.controlPoints
    else @bezOpt.degree = 0

    @bezOpt.endPos = param.required options.endVal
    @tIncr = 1 / (@_duration * (@_fps / 1000))

    if dryRun then @bezOpt.startPos = options.startVal
    else

      # Getting our starting value based on our animated property
      if @_property == "rotation"
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
    param.required t
    apply = param.optional apply, true

    # Throw an error if t is out of bounds. We could just cap it, but it should
    # never be provided out of bounds. If it is, something is wrong with the
    # code calling us
    if t > 1 or t < 0 then throw new Error "t out of bounds! #{t}"

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
      if @options.cbStep != undefined then @options.cbStep val

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
      if t > 1 and t < (1 + @tIncr) then t = 1 else if t > 1 then break

      bezValues.values.push @_update t, false

    bezValues

  ###
  # Apply value to our actor
  #
  # @param [Number] val
  # @private
  ###
  _applyValue: (val) ->
    if @_property == "rotation" then @actor.setRotation val

    if @_property[0] == "position"
      if @_property[1] == "x"
        pos = new cp.v val, @actor.getPosition().y
        @actor.setPosition pos
      else if @_property[1] == "y"
        pos = new cp.v @actor.getPosition().x, val
        @actor.setPosition pos

    if @_property[0] == "color"
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
    if @options.cbStart != undefined then @options.cbStart()

    t = -@tIncr

    @_intervalID = setInterval =>
      t += @tIncr

      if t > 1
        clearInterval @_intervalID
        if @options.cbEnd != undefined then @options.cbEnd()
      else
        @_update t
        if @options.cbStep != undefined then @options.cbStep()

    , 1000 / @_fps

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

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
  constructor: (@actor, @options) ->
    param.required @actor
    param.required @options
    param.required @options.delays
    param.required @options.deltas

    if @options.delays.length != @options.deltas.length
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
    param.required deltaSet
    param.required delay
    udata = param.optional udata, null

    setTimeout (=>
      @_applyDeltas deltaSet, udata
      if last then if @options.cbEnd != undefined then @options.cbEnd()
    ), delay

  ###
  # @private
  # Applies the delta set to the actor
  #
  # @param [Array<String, Number>] deltaSet
  # @param [Object] udata optional userdata to send to callback
  ###
  _applyDeltas: (deltaSet, udata) ->
    param.required deltaSet
    if @options.cbStep != undefined then @options.cbStep udata

    finalVerts = @actor.getVertices()

    # Check for repeat
    if deltaSet.join("_").indexOf("...") != -1
      repeat = true
    else repeat = false

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
        if repeat then break

        val = undefined
      else val = finalVerts[i]

      if typeof d == "number" then val = d
      else if typeof d == "string"
        if val == undefined
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
      else finalVerts[i] = val

    @actor.updateVertices finalVerts

  ###
  # Looks through all the options provided and sends them to the update
  # function so they are not lost when i updates
  ###
  animate: ->
    if @_animated then return else @_animated = true
    if @options.cbStart != undefined then @options.cbStart()

    for i in [0...@options.deltas.length]

      # Send proper user data if provided
      udata = null
      if @options.udata != undefined
        if @options.udata instanceof Array
          if i < @options.udata.length then udata = @options.udata[i]
        else udata = @options.udata

      if i == (@options.deltas.length - 1) then last = true else last = false
      @_setTimeout @options.deltas[i], @options.delays[i], udata, last

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

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
  constructor: (@actor, @options) ->
    param.required @actor
    param.required @options.mass
    param.required @options.friction
    param.required @options.elasticity
    param.required @options.timeout

    # Guards against multiple exeuctions
    @_animated = false

  ###
  # Activates the animation (can only be run once)
  ###
  animate: ->
    if @_animated then return else @_animated = true
    if @options.cbStart != undefined then @options.cbStart()

    setTimeout =>
      @actor.createPhysicsBody @options.mass, \
        @options.friction, @options.elasticity
      if @options.cbEnd != undefined then @options.cbEnd()
    , @options.timeout

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Actor interface class
class AREActorInterface

  ###
  # Fails with null
  # @private
  ###
  _findActor: (id) ->
    param.required id

    for a in ARERenderer.actors
      if a.getId() == id then return a

    null

  ###
  # Create actor using the supplied vertices, passed in as a JSON
  # representation of a flat array
  #
  # @param [String] verts
  # @return [Number] id created actor handle
  ###
  createRawActor: (verts) ->
    param.required verts

    new ARERawActor(JSON.parse verts).getId()

  ###
  # Create a variable sided actor of the specified radius
  #
  # @param [Number] radius
  # @param [Number] segments
  # @return [Number] id created actor handle
  ###
  createPolygonActor: (radius, segments) ->
    param.required radius

    ##
    ## NOTE: Things are a bit fucked up at the moment. The android engine
    ##       doesn't implement the same polygon actor we do; so if we've been
    ##       passed a vert array as the first parameter above, treat this as
    ##       a raw actor creation request
    ##
    if typeof radius == "string"
      @createRawActor radius
    else
      param.required segments
      new AREPolygonActor(radius, segments).getId()

  ###
  # Creates a rectangle actor of the specified width and height
  #
  # @param [Number] width
  # @param [Number] height
  # @return [Number] id created actor handle
  ###
  createRectangleActor: (width, height) ->
    param.required width
    param.required height

    new ARERectangleActor(width, height).getId()

  ###
  # Creates a circle actor with the specified radius
  #
  # @param [Number] radius
  # @return [Number] id created actor handle
  ###
  createCircleActor: (radius) ->
    param.required radius

    new ARECircleActor(radius).getId()

  ###
  # Fetch the width of the rectangle actor with the specified ID
  #
  # @param [Number] id
  # @return [Number] width
  ###
  getRectangleActorWidth: (id) ->
    for a in ARERenderer.actors
      if a.getId() == id and a instanceof ARERectangleActor
        return a.getWidth()

    null

  ###
  # Fetch the height of the rectangle actor with the specified ID
  #
  # @param [Number] id
  # @return [Number] height
  ###
  getRectangleActorHeight: (id) ->
    for a in ARERenderer.actors
      if a.getId() == id and a instanceof ARERectangleActor
        return a.getHeight()

    null

  ###
  # Set the height of the rectangle actor with the specified ID
  #
  # @param [Number] id
  # @param [Number] height
  # @return [Boolean] success
  ###
  setRectangleActorHeight: (id, height) ->
    for a in ARERenderer.actors
      if a.getId() == id and a instanceof ARERectangleActor
        a.setHeight height
        return true

    false

  ###
  # Set the width of the rectangle actor with the specified ID
  #
  # @param [Number] id
  # @param [Number] width
  # @return [Boolean] success
  ###
  setRectangleActorWidth: (id, width) ->
    for a in ARERenderer.actors
      if a.getId() == id and a instanceof ARERectangleActor
        a.setWidth width
        return true

    false

  ###
  # Fetch the radius of the circle actor with the specified ID
  #
  # @param [Number] id
  # @return [Number] radius
  ###
  getCircleActorRadius: (id) ->
    for a in ARERenderer.actors
      if a.getId() == id and a instanceof AREPolygonActor
        return a.getRadius()

    null

  ###
  # Set the radius of the circle actor with the specified ID
  #
  # @param [Number] id
  # @param [Number] radius
  # @return [Boolean] success
  ###
  setCircleActorRadius: (id, radius) ->
    for a in ARERenderer.actors
      if a.getId() == id and a instanceof AREPolygonActor
        a.setRadius radius
        return true

    false

  ###
  # Attach texture to actor. Fails if actor isn't found
  #
  # @param [String] texture texture name
  # @param [Number] width attached actor width
  # @param [Number] height attached actor height
  # @param [Number] offx anchor point offset
  # @param [Number] offy anchor point offset
  # @param [Angle] angle anchor point rotation
  # @param [Number] id id of actor to attach texture to
  # @return [Boolean] success
  ###
  attachTexture: (texture, w, h, x, y, angle, id) ->
    param.required id
    param.required texture
    param.required w
    param.required h
    x = param.optional x, 0
    y = param.optional y, 0
    angle = param.optional angle, 0

    if (a = @_findActor(id)) != null
      a.attachTexture texture, w, h, x, y, angle
      return true

    false

  ###
  # Set actor layer. Fails if actor isn't found.
  # Actors render from largest layer to smallest
  #
  # @param [Number] layer
  # @param [Number] id id of actor to set layer of
  # @return [Boolean] success
  ###
  setActorLayer: (layer, id) ->
    param.required id
    param.required layer

    if (a = @_findActor(id)) != null
      a.setLayer layer
      return true

    false

  ###
  # Set actor physics layer. Fails if actor isn't found.
  # Physics layers persist within an actor between body creations. Only bodies
  # in the same layer will collide! There are only 16 physics layers!
  #
  # @param [Number] layer
  # @param [Number] id id of actor to set layer of
  # @return [Boolean] success
  ###
  setActorPhysicsLayer: (layer, id) ->
    param.required id
    param.required layer

    if (a = @_findActor(id)) != null
      a.setPhysicsLayer layer
      return true

    false

  ###
  # Remove attachment from an actor. Fails if actor isn't found
  #
  # @param [Number] id id of actor to remove texture from
  # @return [Boolean] success
  ###
  removeAttachment: (id) ->
    param.required id

    if (a = @_findActor(id)) != null
      a.removeAttachment()
      return true

    false

  ###
  # Set attachment visiblity. Fails if actor isn't found, or actor has no
  # attachment.
  #
  # @param [Boolean] visible
  # @param [Number] id id of actor to modify
  # @return [Boolean] success
  ###
  setAttachmentVisiblity: (visible, id) ->
    param.required visible

    if (a = @_findActor(id)) != null
      return a.setAttachmentVisibility visible

    false

  ###
  # Refresh actor vertices, passed in as a JSON representation of a flat array
  #
  # @param [String] verts
  # @param [Number] id actor id
  # @return [Boolean] success
  ###
  updateVertices: (verts, id) ->
    param.required verts
    param.required id

    if (a = @_findActor(id)) != null
      a.updateVertices JSON.parse verts
      return true

    false

  ###
  # Get actor vertices as a flat JSON array
  #
  # @param [Number] id actor id
  # @return [String] vertices
  ###
  getVertices: (id) ->
    param.required id

    if (a = @_findActor(id)) != null
      return JSON.stringify a.getVertices()

    null

  ###
  # Clears stored information about the actor in question. This includes the
  # rendered and physics bodies
  #
  # @param [Numer] id actor id
  # @return [Boolean] success
  ###
  destroyActor: (id) ->
    param.required id

    for a, i in ARERenderer.actors
      if a.getId() == id
        a.destroyPhysicsBody()
        ARERenderer.actors.splice i, 1
        a = undefined
        return true

    false

  ###
  # Supply an alternate set of vertices for the physics body of an actor. This
  # is necessary for triangle-fan shapes, since the center point must be
  # removed when building the physics body. If a physics body already exists,
  # this rebuilds it!
  #
  # @param [String] verts
  # @param [Number] id actor id
  # @return [Boolean] success
  ###
  setPhysicsVertices: (verts, id) ->
    param.required verts
    param.required id

    if (a = @_findActor(id)) != null
      a.setPhysicsVertices JSON.parse verts
      return true

    false

  ###
  # Change actors' render mode, currently only options are avaliable
  #   1 == TRIANGLE_STRIP
  #   2 == TRIANGLE_FAN
  #
  # @param [Number] mode
  # @param [Number] id actor id
  # @return [Boolean] success
  ###
  setRenderMode: (mode, id) ->
    mode = param.required mode, ARERenderer.renderModes
    param.required id

    if (a = @_findActor(id)) != null
      a.setRenderMode mode
      return true

    false

  ###
  # Set actor opacity using handle, fails with false
  #
  # @param [Number opacity
  # @param [Number] id
  # @return [Boolean] success
  ###
  setActorOpacity: (opacity, id) ->
    param.required opacity
    param.required id

    if (a = @_findActor(id)) != null
      a.setOpacity opacity
      return true

    false

  ###
  # Get actor opacity using handle, fails with null
  #
  # @param [Number] id
  # @return [Number] opacity
  ###
  getActorOpacity: (id) ->
    param.required id

    if (a = @_findActor(id)) != null
      return a.getOpacity()

    null

  ###
  # Set actor visible using handle, fails with false
  #
  # @param [Boolean] visible
  # @param [Number] id
  # @return [Boolean] success
  ###
  setActorVisible: (visible, id) ->
    param.required visible
    param.required id

    if (a = @_findActor(id)) != null
      a.setVisible visible
      return true

    false

  ###
  # Get actor visible using handle, fails with null
  #
  # @param [Number] id
  # @return [Boolean] visible
  ###
  getActorVisible: (id) ->
    param.required id

    if (a = @_findActor(id)) != null
      return a.getVisible()

    null

  ###
  # Set actor position using handle, fails with false
  #
  # @param [Number] x x coordinate
  # @param [Number] y y coordinate
  # @param [Number] id
  # @return [Boolean] success
  ###
  setActorPosition: (x, y, id) ->
    param.required x
    param.required y
    param.required id

    if (a = @_findActor(id)) != null
      a.setPosition new cp.v x, y
      return true

    false

  ###
  # Get actor position using handle, fails with null
  # Returns position as a JSON representation of a primitive (x, y) object!
  #
  # @param [Number] id
  # @return [String] position
  ###
  getActorPosition: (id) ->
    param.required id

    if (a = @_findActor(id)) != null
      pos = a.getPosition()

      return JSON.stringify
        x: pos.x
        y: pos.y

    null

  ###
  # Set actor rotation using handle, fails with false
  #
  # @param [Number] angle in degrees or radians
  # @param [Number] id
  # @param [Boolean] radians defaults to false
  # @return [Boolean] success
  ###
  setActorRotation: (angle, id, radians) ->
    param.required angle
    param.required id
    radians = param.optional radians, false

    if (a = @_findActor(id)) != null
      a.setRotation angle, radians
      return true

    false

  ###
  # Get actor rotation using handle, fails with 0.000001
  #
  # @param [Number] id
  # @param [Boolean] radians defaults to false
  # @return [Number] angle in degrees or radians
  ###
  getActorRotation: (id, radians) ->
    param.required id
    radians = param.optional radians, false

    if (a = @_findActor(id)) != null then return a.getRotation radians
    0.000001

  ###
  # Set actor color using handle, fails with false
  #
  # @param [Number] r red component
  # @param [Number] g green component
  # @param [Number] b blue component
  # @param [Number] id
  # @return [Boolean] success
  ###
  setActorColor: (r, g, b, id) ->
    param.required r
    param.required g
    param.required b
    param.required id

    if (a = @_findActor(id)) != null
      a.setColor new AREColor3 r, g, b
      return true

    false

  ###
  # Returns actor color as a JSON triple, in 0-255 range
  # Uses id, fails with null
  #
  # @param [Number] id
  # @return [String] col
  ###
  getActorColor: (id) ->
    param.required id

    if (a = @_findActor(id)) != null
      return JSON.stringify
        r: a.getColor().getR()
        g: a.getColor().getG()
        b: a.getColor().getB()

    null

  ###
  # Creates the internal physics body, if one does not already exist
  # Fails with false
  #
  # @param [Number] mass 0.0 - unbound
  # @param [Number] friction 0.0 - 1.0
  # @param [Number] elasticity 0.0 - 1.0
  # @param [Number] id
  # @return [Boolean] success
  ###
  enableActorPhysics: (mass, friction, elasticity, id) ->
    param.required id
    param.required mass
    param.required friction
    param.required elasticity

    if (a = @_findActor(id)) != null
      a.createPhysicsBody mass, friction, elasticity
      return true

    false

  ###
  # Destroys the physics body if one exists, fails with false
  #
  # @param [Number] id
  # @return [Boolean] success
  ###
  destroyPhysicsBody: (id) ->
    param.required id

    if (a = @_findActor(id)) != null
      a.destroyPhysicsBody()
      true

    false

  ###
  # Set actor texture by texture handle. Expects the texture to already be
  # loaded by the asset system!
  #
  # @param [String] name
  # @param [Number] id
  # @return [Boolean] success
  ###
  setActorTexture: (name, id) ->
    param.required name
    param.required id

    if (a = @_findActor(id)) != null
      a.setTexture name
      true

    false

  ###
  # Set actor texture repeat
  #
  # @param [Number] x horizontal repeat
  # @param [Number] y vertical repeat (default 1)
  # @param [Number] id
  # @return [Boolean] success
  ###
  setActorTextureRepeat: (x, y, id) ->
    param.required x
    param.required id
    y = param.optional y, 1

    if (a = @_findActor(id)) != null
      a.setTextureRepeat x, y
      true

    false

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

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
    param.required ad
    param.required width
    param.required height
    log = param.optional log, 4
    id = param.optional id, ""

    # Clean us up just in case we are being initialized for a second time
    ARERenderer.actors = []
    ARERenderer.textures = []
    ARERenderer._gl = null
    ARERenderer.me = null
    ARERenderer._currentMaterial = "none"
    ARERenderer.camPos = x: 0, y: 0

    ###
    # Should WGL textures be flipped by their Y axis?
    # NOTE. This does not affect existing textures.
    ###
    @wglFlipTextureY = false

    # Clear out physics world
    AREPhysics.stopStepping()

    new AREEngine width, height, (are) =>
      @_engine = are

      are.startRendering()
      ad are
    , log, id


  ###
  # Set global render mode
  #   @see ARERenderer.RENDERER_MODE_*
  # This is a special method only we implement; as such, any libraries
  # interfacing with us should check for the existence of the method before
  # calling it!
  ###
  getRendererMode: -> ARERenderer.rendererMode
  setRendererMode: (mode) -> ARERenderer.rendererMode = mode

  ###
  # Set engine clear color
  #
  # @param [Number] r
  # @param [Number] g
  # @param [Number] b
  ###
  setClearColor: (r, g, b) ->
    param.required r
    param.required g
    param.required b

    if @_engine == undefined then return
    else ARERenderer.me.setClearColor r, g, b

  ###
  # Get engine clear color as (r,g,b) JSON, fails with null
  #
  # @return [String] clearcol
  ###
  getClearColor: ->
    if @_engine == undefined then return null

    col = ARERenderer.me.getClearColor()
    JSON.stringify { r: col.getR(), g: col.getG(), b: col.getB() }

  ###
  # Set log level
  #
  # @param [Number] level 0-4
  ###
  setLogLevel: (level) ->
    param.required level, [0, 1, 2, 3, 4]

    ARELog.level = level

  ###
  # Set camera center position. Leaving out a component leaves it unchanged
  #
  # @param [Number] x
  # @param [Number] y
  ###
  setCameraPosition: (x, y) ->
    ARERenderer.camPos.x = param.optional x, ARERenderer.camPos.x
    ARERenderer.camPos.y = param.optional y, ARERenderer.camPos.y

  ###
  # Fetch camera position. Returns a JSON object with x,y keys
  #
  # @return [Object]
  ###
  getCameraPosition: -> JSON.stringify ARERenderer.camPos

  ###
  # Return our engine's width
  #
  # @return [Number] width
  ###
  getWidth: ->
    if @_engine == null or @_engine == undefined
      -1
    else
      @_engine.getWidth()

  ###
  # Return our engine's height
  #
  # @return [Number] height
  ###
  getHeight: ->
    if @_engine == null or @_engine == undefined
      -1
    else
      @_engine.getHeight()

  ###
  # Enable/disable benchmarking
  #
  # @param [Boolean] benchmark
  ###
  setBenchmark: (status) ->
    AREPhysics.benchmark = status
    @_engine.benchmark = status

  ###
  # Load a package.json manifest, assume texture paths are relative to our
  # own
  #
  # @param [String] json package.json source
  # @param [Method] cb callback to call once the load completes (textures)
  ###
  loadManifest: (json, cb) ->
    param.required json

    manifest = JSON.parse json

    ##
    ## NOTE: The manifest only contains textures now, but for the sake of
    ##       backwards compatibilty, we check for a textures array

    manifest = manifest.textures if manifest.textures != undefined
    if _.isEmpty(manifest)
      return cb()

    count = 0

    flipTexture = @wglFlipTextureY

    # Loads a texture, and adds it to our renderer
    loadTexture = (name, path) ->
      ARELog.info "Loading texture: #{name}, #{path}"

      # Create texture and image
      img = new Image()
      img.crossOrigin = "anonymous"

      gl = ARERenderer._gl
      tex = null

      if ARERenderer.activeRendererMode == ARERenderer.RENDERER_MODE_WGL

        ARELog.info "Loading Gl Texture"

        tex = gl.createTexture()
        img.onload = ->

          scaleX = 1
          scaleY = 1

          # Resize image if needed
          w = (img.width & (img.width - 1)) != 0
          h = (img.height & (img.height - 1)) != 0
          if w || h

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

          # if not pot
          #  gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE
          #  gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE

          gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT
          gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT
          gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR
          gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR

          # gl.generateMipmap gl.TEXTURE_2D
          gl.bindTexture gl.TEXTURE_2D, null

          # Add to renderer
          ARERenderer.addTexture
            name: name
            texture: tex
            width: img.width
            height: img.height
            scaleX: scaleX
            scaleY: scaleY

          # Call cb once we've loaded all textures
          count++
          if count == manifest.length then cb()

      else

        ARELog.info "Loading Canvas Image"

        img.onload = ->

          # Add to renderer
          ARERenderer.addTexture
            name: name
            texture: img
            width: img.width
            height: img.height

          # Call cb once we've loaded all textures
          count++
          if count == manifest.length then cb()

      # Load!
      img.src = path

    # Load textures
    for tex in manifest

      # Feature check
      if tex.compression != undefined and tex.compression != "none"
        console.error tex.compression
        throw new Error "Only un-compressed textures are supported!"

      if tex.type != undefined and tex.type != "image"
        console.error tex.type
        throw new Error "Only image textures are supported!"

      # Gogo
      loadTexture tex.name, tex.path

  ###
  # Get renderer texture size by name
  #
  # @param [String] name
  # @param [Object] size
  ###
  getTextureSize: (name) -> ARERenderer.getTextureSize name

  ###
  # TODO: Implement
  #
  # Set remind me later button region
  #
  # @param [Number] x
  # @param [Number] y
  # @param [Number] w
  # @param [Number] h
  ###
  setRemindMeButton: (x, y, w, h) ->

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

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

  # Check if we know how to directly animate the property provided
  #
  # @param [String] property property name, parent name if composite
  # @return [Boolean] canAnimate
  canAnimate: (property) ->

    if AREAnimationInterface._animationMap[property] == undefined
      return false
    true

  # Grab animation target for a property, if we support it. Null otherwise.
  #
  # @param [String] property property name, arent name if composite
  # @return [String] name
  getAnimationName: (property) ->
    if AREAnimationInterface._animationMap[property] == undefined
      return false
    else
      type = AREAnimationInterface._animationMap[property]

      if type == AREBezAnimation then return "bezier"
      else if type == AREPsyxAnimation then return "psyx"
      else if type == AREVertAnimation then return "vert"

  # Top-level animate method for ARE, creates specific animations internally
  # depending on the requirements of the input. Fails with null if the property
  # is not recognized.
  #
  # An optional 'start' parameter can be passed in on the 'options' object,
  # signifying when to initiate the animation. (< 0) means now, (> 0) after
  # 'start' ms, and 0 as default no auto start
  #
  # Options and property are passed in as JSON strings
  #
  # @param [Number] actorID id of actor to animate, as per AREActorInterface
  # @param [String] property property array, second element is component
  # @param [String] options options to pass to animation, varies by property
  animate: (actorID, property, options) ->
    param.required actorID
    property = JSON.parse param.required property
    options = JSON.parse param.required options
    options.start = param.optional options.start, 0

    actor = null

    for a in ARERenderer.actors
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
    else _spawnAnim name, actor, options

  # Return bezier output for a specific set of animation options. Requires
  # a startVal on the options object!
  #
  # Result contains a "values" key, and a "stepTime" key
  #
  # Note that both the options object and the returned object are JSON strings
  #
  # @param [String] options
  # @option options [Number] startVal
  # @option options [Number] endVal
  # @option options [Array<Object>] controlPoints
  # @option options [Number] duration
  # @option options [Number] fps framerate, defaults to 30
  # @return [String] bezValues
  preCalculateBez: (options) ->
    options = JSON.parse param.required options

    param.required options.startVal
    param.required options.endVal
    param.required options.duration
    options.controlPoints = param.required options.controlPoints, []
    options.fps = param.required options.fps, 30

    ret = new AREBezAnimation(null, options, true).preCalculate()
    JSON.stringify ret

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Engine interface, used by the ads themselves, serves as an API
#
# @depend actor_interface.coffee
# @depend engine_interface.coffee
# @depend animation_interface.coffee
class AREInterface

  # Instantiates sub-interfaces
  constructor: ->
    @_Actors = new AREActorInterface()
    @_Engine = new AREEngineInterface()
    @_Animations = new AREAnimationInterface()

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

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# @depend renderer.coffee
# @depend physics.coffee
# @depend util/log.coffee
# @depend animations/bez_animation.coffee
# @depend animations/vert_animation.coffee
# @depend animations/psyx_animation.coffee
# @depend interface/interface.coffee

# Requires Underscore.js fromhttp://documentcloud.github.io/underscore
# Requires Chipmunk-js https://github.com/josephg/Chipmunk-js

# The WebGL Adefy engine. Implements the full AJS interface.
#
# ARELog is used for all logging throughout the application
class AREEngine

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
    param.required width
    param.required height
    param.required cb

    ARELog.level = param.optional logLevel, 4
    canvas = param.optional canvas, ""

    # Holds a handle on the render loop interval
    @_renderIntervalId = null

    @benchmark = false

    # Framerate for renderer, defaults to 60FPS
    @setFPS(60)

    # Ensure Underscore.js is loaded
    if window._ == null or window._ == undefined
      return ARELog.error "Underscore.js is not present!"

    # Ensure Chipmunk-js is loaded
    if window.cp == undefined or window.cp == null
      return ARELog.error "Chipmunk-js is not present!"

    @_renderer = new ARERenderer canvas, width, height
    @startRendering()
    cb @

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
  # @return [Void]
  ###
  startRendering: ->
    if @_renderIntervalId != null then return

    ARELog.info "Starting render loop"

    avgStep = 0
    stepCount = 0

    @_renderIntervalId = setInterval =>
      start = Date.now()

      @_renderer.render()

      if @benchmark
        stepCount++
        avgStep = avgStep + ((Date.now() - start) / stepCount)

        if stepCount % 500 == 0
          fps = (1000 / avgStep).toFixed 2
          console.log "Render step time: #{avgStep.toFixed(2)}ms (#{fps} FPS)"

    , @_framerate

  ###
  # Halt render loop if it's running
  # @return [Void]
  ###
  stopRendering: ->
    if @_renderIntervalId == null then return

    ARELog.info "Halting render loop"
    clearInterval @_renderIntervalId
    @_renderIntervalId = null

  ###
  # Set renderer clear color in integer RGB form (passes through to renderer)
  #
  # @param [Number] r
  # @param [Number] g
  # @param [Number] b
  # @return [self]
  ###
  setClearColor: (r, g, b) ->
    r = param.optional r, 0
    g = param.optional g, 0
    b = param.optional b, 0

    if @_renderer instanceof ARERenderer
      @_renderer.setClearColor r, g, b

    @

  ###
  # Get clear color from renderer (if active, null otherwise)
  #
  # @return [AREColor3] color
  ###
  getClearColor: ->
    if @_renderer instanceof ARERenderer
      @_renderer.getClearColor()
    else
      null

  ###
  # Return our internal renderer width, returns -1 if we don't have a renderer
  #
  # @return [Number] width
  ###
  getWidth: ->
    if @_renderer == null or @_renderer == undefined
      -1
    else
      @_renderer.getWidth()

  ###
  # Return our internal renderer height
  #
  # @return [Number] height
  ###
  getHeight: ->
    if @_renderer == null or @_renderer == undefined
      -1
    else
      @_renderer.getHeight()

  ###
  # Request a pick render, passed straight to the renderer
  #
  # @param [FrameBuffer] buffer
  # @param [Method] cb cb to call post-render
  ###
  requestPickingRenderWGL: (buffer, cb) ->
    if @_renderer == null or @_renderer == undefined
      ARELog.warn "Can't request a pick render, renderer not instantiated!"
    else
      if @_renderer.isWGLRendererActive()
        @_renderer.requestPickingRenderWGL buffer, cb
      else
        ARELog.warn "Can't request a WGL pick render, " + \
                    "not using WGL renderer"

  ###
  # Request a pick render, passed straight to the renderer
  #
  # -param [FrameBuffer] buffer
  # @param [Method] cb cb to call post-render
  ###
  requestPickingRenderCanvas: (selectionRect, cb) ->
    if @_renderer == null or @_renderer == undefined
      ARELog.warn "Can't request a pick render, renderer not instantiated!"
    else
      if @_renderer.isCanvasRendererActive()
        @_renderer.requestPickingRenderCanvas selectionRect, cb
      else
        ARELog.warn "Can't request a canvas pick render, " + \
                    "not using canvas renderer"

  ###
  # Get our renderer's gl object
  #
  # @return [Object] gl
  ###
  getGL: ->
    if ARERenderer._gl == null then ARELog.warn "Render not instantiated!"
    ARERenderer._gl

  ###
  # Return the current active renderer mode
  #
  # @return [Number]
  ###
  getActiveRendererMode: -> ARERenderer.activeRendererMode

# Break out an interface. Use responsibly.
# All we need, is the awesome
window.AdefyGLI = window.AdefyRE = new AREInterface

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Top-level file, used by concat_in_order
#
# As part of the build process, grunt concats all of our coffee sources in a
# dependency-aware manner. Deps are described at the top of each file, with
# this essentially serving as the root node in the dep tree.
#
# @depend util/util_param.coffee
# @depend actors/rectangle_actor.coffee
# @depend actors/circle_actor.coffee
# @depend actors/polygon_actor.coffee
# @depend engine.coffee

AREVersion =
  MAJOR: 1
  MINOR: 0
  PATCH: 1
  BUILD: null
  STRING: "1.0.1"