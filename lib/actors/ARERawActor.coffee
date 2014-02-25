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
    @_stroke_color = null
    @_colArray = null

    @lit = false
    @visible = true
    @layer = 0
    @_physicsLayer = ~0

    @_id = -1
    @_position = new cp.v 0, 0
    @_rotation = 0 # Radians, but set in degrees by default
    ## size calculated by from verticies
    @_size =
      x: 0
      y: 0

    # Chipmunk-js values
    @_shape = null
    @_body = null
    @_friction = null
    @_mass = null
    @_elasticity = null

    # Our actual vertex lists. Note that we will optionally use a different
    # set of vertices for the physical body!
    @_vertices = []
    @_psyxVertices = []
    @_texVerts = []

    # If we modify our UVs (scaling, translation), we always do so relative
    # to the original UVs in this array (updated on true UV update)
    @_origTexVerts = []

    # Vertice containers
    @_vertBuffer = null
    @_vertBufferFloats = null # Float32Array

    # Shader handles, for now there are only three
    # TODO: Make this dynamic
    @_sh_modelview = null
    @_sh_position = null
    @_sh_color = null

    # Render modes decide how the vertices are treated.
    #   1 == Stroked
    #   2 == Filled
    #   3 == Stroked | Filled
    @_renderMode = 2

    # No attached texture; when one exists, we render that texture (actor)
    # instead of ourselves!
    @_attachedTexture = null
    @attachedTextureAnchor =
      x: 0
      y: 0
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
      return

    @_texture = ARERenderer.getTexture name
    @setShader ARERenderer.getMe().getTextureShader()
    @_material = "texture"
    @

  ###
  # Clear our internal texture, leaving us to render with a flat color
  # @return [this]
  ###
  clearTexture: ->
    @_texture = undefined
    @setShader ARERenderer.getMe().getDefaultShader()
    @_material = "flat"
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

      @_sh_modelview = handles["ModelView"]
      @_sh_position = handles["Position"]
      @_sh_color = handles["Color"]
      @_sh_texture = handles["aTexCoord"]
      @_sh_sampler = handles["uSampler"]
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
    @_origTexVerts = @_texVerts
    @_texVBufferFloats = new Float32Array(@_texVerts)

    if ARERenderer.activeRendererMode == ARERenderer.RENDERER_MODE_WGL
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
      uvs.push @_origTexVerts[i] * y
      uvs.push @_origTexVerts[i + 1] * x

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
    @attachedTextureAnchor.x = param.optional offx, 0
    @attachedTextureAnchor.y = param.optional offy, 0
    @attachedTextureAnchor.angle = param.optional angle, 0

    # Sanity check
    if not ARERenderer.hasTexture texture
      throw new Error "No such texture loaded: #{texture}"
      return

    # If we already have an attachment, discard it
    if @_attachedTexture != null then @removeAttachment()

    # Create actor
    @_attachedTexture = new ARERectangleActor width, height

    # Set texture
    @_attachedTexture.setTexture texture

    # Ship eeet
    @_attachedTexture

  ###
  # Remove attached texture, if we have one
  #
  # @return [Boolean] success fails if we have no attached texture
  ###
  removeAttachment: ->
    if @_attachedTexture == null then return false

    for a, i in ARERenderer.actors
      if a.getId() == @_attachedTexture.getId()
        a.destroyPhysicsBody()
        ARERenderer.actors.splice i, 1
        @_attachedTexture = null
        return true

    false

  ###
  # Set attachment visiblity. Fails if we don't have an attached texture
  #
  # @param [Boolean] visible
  # @return [Boolean] success
  ###
  setAttachmentVisibility: (visible) ->
    param.required visible

    if @_attachedTexture == null then return false

    @_attachedTexture.visible = visible
    true

  # Checks to see if we have an attached texture
  #
  # @return [Boolean] hasAttachment
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
    if @hasAttachment() and @getAttachment().visible

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
      @setPosition pos
      @setRotation rot

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
    if @_material == "texture"
      gl.bindBuffer gl.ARRAY_BUFFER, @_texBuffer
      gl.vertexAttribPointer @_sh_texture, 2, gl.FLOAT, false, 0, 0

      gl.activeTexture gl.TEXTURE0
      gl.bindTexture gl.TEXTURE_2D, @_texture
      gl.uniform1i @_sh_sampler, 0

  ###
  # Renders the Actor using the WebGL interface, this function should only
  # be called by a ARERenderer in WGL mode
  # @param [Object] gl WebGL context
  ###
  wglDraw: (gl) ->
    param.required gl

    # We only respect our own visibility flag! Any invisible attached textures
    # cause us to render!
    if not @visible then return

    @updatePosition()

    # Prep our vectors and matrices
    @_modelM = new Matrix4()
    @_transV.elements[0] = @_position.x - ARERenderer.camPos.x
    @_transV.elements[1] = @_position.y - ARERenderer.camPos.y

    #@_modelM = @_modelM.x((new Matrix4()).translate(@_transV))
    #@_modelM = @_modelM.x((new Matrix4()).rotate(@_rotation, @_rotV))
    @_modelM.translate(@_transV)
    @_modelM.rotate(@_rotation, @_rotV)

    #flatMV = new Float32Array(@_modelM.flatten())
    flatMV = @_modelM.flatten()

    gl.bindBuffer gl.ARRAY_BUFFER, @_vertBuffer
    gl.vertexAttribPointer @_sh_position, 2, gl.FLOAT, false, 0, 0

    gl.uniform4f @_sh_color, @_colArray[0], @_colArray[1], @_colArray[2], 1
    gl.uniformMatrix4fv @_sh_modelview, false, flatMV

    @wglBindTexture gl

    if @_renderMode == 1
      gl.drawArrays gl.LINE_LOOP, 0, @_vertices.length / 2
    else if @_renderMode == 2
      gl.drawArrays gl.TRIANGLE_FAN, 0, @_vertices.length / 2
    else if @_renderMode == 3 # wireframe
      gl.drawArrays gl.TRIANGLE_STRIP, 0, @_vertices.length / 2
    else throw new Error "Invalid render mode! #{@_renderMode}"

  ###
  # Updates the context settings with the Actor's strokeStyle and fillStyle
  # @param [Object] 2d context
  ###
  cvSetupStyle: (context) ->

    if @_stroke_color
      context.strokeStyle = "rgb(#{@_stroke_color})"
    else
      context.strokeStyle = "#FFF"

    if @_material == "texture"
      #
    else

      if @_color
        context.fillStyle = "rgb(#{@_color})"
      else
        context.fillStyle = "#FFF"

  ###
  # Renders the current actor using the 2d context, this function should only
  # be called by a ARERenderer in CANVAS mode
  # @param [Object] 2d context
  ###
  cvDraw: (context) ->
    param.required context

    # We only respect our own visibility flag! Any invisible attached textures
    # cause us to render!
    if not @visible then return

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

    if @_renderMode == 1
      context.stroke()
    else if @_renderMode == 2
      if @_material == "texture"
        context.clip()
        context.scale 1, -1
        context.drawImage @_texture,
                          -@_size.x / 2, -@_size.y / 2, @_size.x, @_size.y
      else
        context.fill()
    else if @_renderMode == 3 # wireframe
      if @_material == "texture"
        context.clip()
        context.scale 1, -1
        context.drawImage @_texture,
                          -@_size.x / 2, -@_size.y / 2, @_size.x, @_size.y
      else
        context.fill()
      context.stroke()
    else throw new Error "Invalid render mode! #{@_renderMode}"

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
    if not @visible then return

    @updatePosition()

  ###
  # Set actor render mode, decides how the vertices are perceived
  #   1 == LINE_LOOP
  #   2 == TRIANGLE_FAN
  #   3 == TRIANGLE_STRIP
  #
  # @paran [Number] mode
  ###
  setRenderMode: (mode) ->
    @_renderMode = param.required mode, [1, 2, 3]
    @

  ###
  # Set actor position, effects either the actor or the body directly if one
  # exists
  #
  # @param [Object] position x, y
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
  # @param [Number] radians true if angle is in radians
  ###
  setRotation: (rotation, radians) ->
    param.required rotation
    radians = param.optional radians, false

    if radians == false then rotation = Number(rotation) * 0.0174532925

    @_rotation = rotation

    if @_body != null
      @_body.SetAngle @_rotation
    else if @_shape != null
      @destroyPhysicsBody()
      @createPhysicsBody @_mass, @_friction, @_elasticity

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
  ###
  setColor: (colOrR, g, b) ->
    param.required colOrR

    unless @_color then @_color = new AREColor3

    if colOrR instanceof AREColor3
      @_color = colOrR

      @_colArray = [
        colOrR.getR true
        colOrR.getG true
        colOrR.getB true
      ]

    else
      param.required g
      param.required b

      @_color.setR Number(colOrR)
      @_color.setG Number(g)
      @_color.setB Number(b)

      @_colArray = [
        @_color.getR true
        @_color.getG true
        @_color.getB true
      ]

    @

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
