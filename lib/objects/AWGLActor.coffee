##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Highly generic actor class
class AWGLActor

  # Default physical properties
  @defaultFriction: 0.3
  @defaultMass: 10
  @defaultElasticity: 0.2

  # Null offset, used when creating dynamic bodies
  # @private
  @_nullV: new cp.v 0, 0

  # Adds the actor to the renderer actor list, gets a unique id from the
  # renderer, and builds our vert buffer.
  #
  # If no texture verts are provided, a default array is provided for square
  # actors.
  #
  # @param [Array<Number>] vertices flat array of vertices (x1, y1, x2, ...)
  # @param [Array<Number>] texverts flat array of texture coords, optional
  constructor: (verts, texverts) ->
    param.required verts
    texverts = param.optional texverts, null

    @_gl = AWGLRenderer._gl
    if @_gl == undefined or @_gl == null
      throw new Error "GL context is required for actor initialization!"

    # Color used for drawing, colArray is pre-computed for the render routine
    @_color = null
    @_colArray = null

    @lit = false
    @visible = true
    @layer = 0

    @_id = -1
    @_position = new cp.v 0, 0
    @_rotation = 0 # Radians, but set in degrees by default

    # Vectors and matrices used for drawing
    @_rotV = null
    @_transV = null
    @_modelM = null

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

    # Vertice containers
    @_vertBuffer = null
    @_vertBufferFloats = null # Float32Array

    # Shader handles, for now there are only three
    # TODO: Make this dynamic
    @_sh_modelview = null
    @_sh_position = null
    @_sh_color = null

    # Render modes decide how the vertices are treated.
    #   1 == TRIANGLE_STRIP
    #   2 == TRIANGLE_FAN
    @_renderMode = 1

    @_id = AWGLRenderer._nextID++

    # Add us to the render actor list (in layer order)
    AWGLRenderer.addActor @

    # Sets up our vert buffer, also validates the vertex array (length)
    @updateVertices verts, texverts

    @setColor new AWGLColor3 255, 255, 255

    # Initialize our rendering objects
    @_rotV = $V([0, 0, 1])
    @_transV = $V([0, 0, 1])
    @_modelM = Matrix.I 4

    # Flat rendering by default
    @clearTexture()

    # No attached texture; when one exists, we render that texture (actor)
    # instead of ourselves!
    @_attachedTexture = null
    @attachedTextureAnchor =
      x: 0
      y: 0
      angle: 0

  # Get material name
  #
  # @return [String] material
  getMaterial: -> @_material

  # Set our render layer. Higher layers render on top of lower ones
  #
  # @param [Number] layer
  setLayer: (layer) ->
    @layer = param.required layer

    # Re-insert ourselves with new layer
    AWGLRenderer.removeActor @
    AWGLRenderer.addActor @

  # We support a single texture per actor for the time being. UV coords are
  # generated automatically internally, for a flat map.
  #
  # @param [String] name name of texture to use from renderer
  setTexture: (name) ->
    param.required name

    if not AWGLRenderer.hasTexture name
      throw new Error "No such texture loaded: #{name}"
      return

    @_texture = AWGLRenderer.getTexture name
    @setShader AWGLRenderer.getMe().getTextureShader()
    @_material = "texture"

  # Clear our internal texture, leaving us to render with a flat color
  clearTexture: ->
    @_texture = undefined
    @setShader AWGLRenderer.getMe().getDefaultShader()
    @_material = "flat"

  # Get our texture, if we have one
  #
  # @return [WebGLTexture] texture
  getTexture: -> @_texture

  # Set shader used to draw actor. For the time being, the routine mearly
  # pulls out handles for the ModelView, Color, and Position structures
  #
  # @param [AWGLShader] shader
  setShader: (shader) ->
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

  # Creates the internal physics body, if one does not already exist
  #
  # @param [Number] mass 0.0 - unbound
  # @param [Number] friction 0.0 - unbound
  # @param [Number] elasticity 0.0 - unbound
  createPhysicsBody: (@_mass, @_friction, @_elasticity) ->

    # Start the world stepping if not already doing so
    if AWGLPhysics.getWorld() == null or AWGLPhysics.getWorld() == undefined
      AWGLPhysics.startStepping()

    if @_shape == not null then return

    if AWGLPhysics.bodyCount == 0 then AWGLPhysics.startStepping()

    AWGLPhysics.bodyCount++

    # Sanity checks
    if @_mass == undefined or @_mass == null then @_mass = 0
    if @_mass < 0 then @_mass = 0

    if @_friction == undefined
      @_friction = AWGLActor.defaultFriction
    else if @_friction < 0 then @_friction = 0

    if @_elasticity == undefined
      @_elasticity = AWGLActor.defaultElasticity
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
      verts.push origVerts[i] / AWGLRenderer.getPPM()
      verts.push origVerts[i + 1] / AWGLRenderer.getPPM()

      # Rotate vert if mass is 0, since we can't set static body angle
      if @_mass == 0
        x = verts[verts.length - 2]
        y = verts[verts.length - 1]
        a = @_rotation

        verts[verts.length - 2] = x * Math.cos(a) - (y * Math.sin(a))
        verts[verts.length - 1] = x * Math.sin(a) + (y * Math.cos(a))

    # Grab world handle to shorten future calls
    space = AWGLPhysics.getWorld()
    pos = AWGLRenderer.screenToWorld @_position

    if @_mass == 0
      @_shape = space.addShape new cp.PolyShape space.staticBody, verts, pos
      @_body = null
    else

      moment = cp.momentForPoly @_mass, verts, AWGLActor._nullV
      @_body = space.addBody new cp.Body @_mass, moment
      @_body.setPos pos
      @_body.setAngle @_rotation

      @_shape = space.addShape new cp.PolyShape @_body, verts, AWGLActor._nullV

    @_shape.setFriction @_friction
    @_shape.setElasticity @_elasticity

  # Destroys the physics body if one exists
  destroyPhysicsBody: ->
    if AWGLPhysics.bodyCount == 0 then return
    if @_shape == null then return

    AWGLPhysics.bodyCount--

    AWGLPhysics.getWorld().removeShape @_shape
    if @_body then AWGLPhysics.getWorld().removeBody @_body

    @_shape = null
    @_body = null

    if AWGLPhysics.bodyCount == 0
      AWGLPhysics.stopStepping()
    else if AWGLPhysics.bodyCount < 0
      throw new Error "Body count is negative!"

  # Update our vertices, causing a rebuild of the physics body, if it doesn't
  # have its' own set of verts. Note that for large actors this is expensive.
  #
  # Texture coordinates are only required if the actor needs to be textured. If
  # provided, the array must be the same length as that containing the vertices
  #
  # @param [Array<Number>] verts flat array of vertices
  # @param [Array<Number>] texverts flat array of texture coords
  updateVertices: (verts, texverts) ->
    @_vertices = param.required verts
    @_texVerts = param.optional texverts, null

    if @_vertices.length < 6
      throw new Error "At least 3 vertices make up an actor"

    if @_texVerts != null
      if @_vertices.length != @_texVerts.length
        throw new Error "Vert array and texture vert array lengths must match!"

    @_vertBuffer = @_gl.createBuffer()
    @_vertBufferFloats = new Float32Array(@_vertices)
    @_gl.bindBuffer @_gl.ARRAY_BUFFER, @_vertBuffer
    @_gl.bufferData @_gl.ARRAY_BUFFER, @_vertBufferFloats, @_gl.STATIC_DRAW

    if @_texVerts != null
      @_texBuffer = @_gl.createBuffer()
      @_texVBufferFloats = new Float32Array(@_texVerts)
      @_gl.bindBuffer @_gl.ARRAY_BUFFER, @_texBuffer
      @_gl.bufferData @_gl.ARRAY_BUFFER, @_texVBufferFloats, @_gl.STATIC_DRAW

    @_gl.bindBuffer @_gl.ARRAY_BUFFER, null

  # Set an alternate vertex array for our physics object. Note that this also
  # triggers a rebuild! If less than 6 vertices are provided, the normal
  # set of vertices is used
  #
  # @param [Array<Number>] verts flat array of vertices
  setPhysicsVertices: (verts) ->
    @_psyxVertices = param.required verts

    if @_body != null
      @destroyPhysicsBody()
      @createPhysicsBody @_mass, @_friction, @_elasticity

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
  # @return [AWGLActor] actor attached actor
  attachTexture: (texture, width, height, offx, offy, angle) ->
    param.required texture
    param.required width
    param.required height
    @attachedTextureAnchor.x = param.optional offx, 0
    @attachedTextureAnchor.y = param.optional offy, 0
    @attachedTextureAnchor.angle = param.optional angle, 0

    # Sanity check
    if not AWGLRenderer.hasTexture texture
      throw new Error "No such texture loaded: #{texture}"
      return

    # If we already have an attachment, discard it
    if @_attachedTexture != null then @removeAttachment()

    # Create actor
    hW = width / 2.0
    hH = height / 2.0

    @_attachedTexture = new AWGLActor [
      -hW, -hH
      -hW,  hH
       hW,  hH
       hW, -hH
      -hW, -hH
    ], [
      0, 0,
      1, 0,
      1, 1,
      0, 1,
      0, 0
    ]

    # Set texture
    @_attachedTexture.setTexture texture

    # Ship eeet
    @_attachedTexture

  # Remove attached texture, if we have one
  #
  # @return [Boolean] success fails if we have no attached texture
  removeAttachment: ->
    if @_attachedTexture == null then return false

    for a, i in AWGLRenderer.actors
      if a.getId() == @_attachedTexture.getId()
        a.destroyPhysicsBody()
        AWGLRenderer.actors.splice i, 1
        @_attachedTexture = null
        return true

    false

  # Set attachment visiblity. Fails if we don't have an attached texture
  #
  # @param [Boolean] visible
  # @return [Boolean] success
  setAttachmentVisibility: (visible) ->
    param.required visible

    if @_attachedTexture == null then return false

    @_attachedTexture.visible = visible
    true

  # Checks to see if we have an attached texture
  #
  # @return [Boolean] hasAttachment
  hasAttachment: -> @_attachedTexture != null

  # Returns attached texture if we have one, null otherwise
  #
  # @return [AWGLActor] attachment
  getAttachment: -> @_attachedTexture

  # Update position from physics body if we have one
  updatePosition: ->

    # @_body is null for static bodies!
    if @_body != null
      @_position = AWGLRenderer.worldToScreen @_body.getPos()
      @_rotation = @_body.a

  # Renders the actor
  #
  # @param [Object] gl gl context
  draw: (gl) ->
    param.required gl

    # We only respect our own visibility flag! Any invisible attached textures
    # cause us to render!
    if not @visible then return

    @updatePosition()

    # Prep our vectors and matrices
    @_modelM = Matrix.I 4
    @_transV.elements[0] = @_position.x
    @_transV.elements[1] = @_position.y

    @_modelM = @_modelM.x (Matrix.Translation(@_transV).ensure4x4())
    @_modelM = @_modelM.x (Matrix.Rotation(@_rotation, @_rotV).ensure4x4())

    flatMV = new Float32Array(@_modelM.flatten())

    gl.bindBuffer gl.ARRAY_BUFFER, @_vertBuffer
    gl.vertexAttribPointer @_sh_position, 2, gl.FLOAT, false, 0, 0

    gl.uniform4f @_sh_color, @_colArray[0], @_colArray[1], @_colArray[2], 1
    gl.uniformMatrix4fv @_sh_modelview, false, flatMV

    # Texture rendering, if needed
    if @_material == "texture"
      gl.bindBuffer gl.ARRAY_BUFFER, @_texBuffer
      gl.vertexAttribPointer @_sh_texture, 2, gl.FLOAT, false, 0, 0

      gl.activeTexture gl.TEXTURE0
      gl.bindTexture gl.TEXTURE_2D, @_texture
      gl.uniform1i @_sh_sampler, 0

    if @_renderMode == 1
      gl.drawArrays gl.TRIANGLE_STRIP, 0, @_vertices.length / 2
    else if @_renderMode == 2
      gl.drawArrays gl.TRIANGLE_FAN, 0, @_vertices.length / 2
    else throw new Error "Invalid render mode! #{@_renderMode}"

  # Set actor render mode, decides how the vertices are perceived
  #   1 == TRIANGLE_STRIP
  #   2 == TRIANGLE_FAN
  #
  # @paran [Number] mode
  setRenderMode: (mode) -> @_renderMode = param.required mode, [1, 2]

  # Set actor position, effects either the actor or the body directly if one
  # exists
  #
  # @param [Object] position x, y
  setPosition: (position) ->
    param.required position

    if @_shape == null
      if position instanceof cp.v
        @_position = position
      else
        @_position = new cp.v Number(position.x), Number(position.y)
    else if @_body != null
      @_body.setPos AWGLRenderer.screenToWorld position

  # Set actor rotation, affects either the actor or the body directly if one
  # exists
  #
  # @param [Number] rotation angle
  # @param [Number] radians true if angle is in radians
  setRotation: (rotation, radians) ->
    param.required rotation
    radians = param.optional radians, false

    if radians == false then rotation = Number(rotation) * 0.0174532925

    if @_shape == null
      @_rotation = rotation
    else if @_body != null
      @_body.SetAngle @_rotation

  # Returns the actor position as an object with x and y properties
  #
  # @return [Object] position x, y
  getPosition: -> @_position

  # Returns actor rotation as an angle in degrees
  #
  # @param [Boolean] radians true to return in radians
  # @return [Number] angle rotation in degrees on z axis
  getRotation: (radians) ->
    radians = param.optional radians, false
    if radians == false
      return @_rotation * 57.2957795
    else
      return @_rotation

  # Get array of vertices
  #
  # @return [Array<Number>] vertices
  getVertices: -> @_vertices

  # Get body id
  #
  # @return [Number] id
  getId: -> @_id

  # Get color
  #
  # @return [AWGLColor3] color
  getColor: -> new AWGLColor3 @_color

  # Set color
  #
  # @overload setColor(col)
  #   Sets the color using an AWGLColor3 instance
  #   @param [AWGLColor3] color
  #
  # @overload setColor(r, g, b)
  #   Sets the color using component values
  #   @param [Integer] r red component
  #   @param [Integer] g green component
  #   @param [Integer] b blue component
  setColor: (colOrR, g, b) ->
    param.required colOrR

    if @_color == undefined or @_color == null then @_color = new AWGLColor3

    if colOrR instanceof AWGLColor3
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
