# Actor class, skeleton for now
class AWGLActor

  # Default physical properties
  @defaultFriction: 0.3
  @defaultMass: 10
  @defaultElasticity: 0.2

  # Null offset, used when creating dynamic bodies
  @_nullV: new cp.v 0, 0

  # Color used for drawing, colArray is pre-computed for the render routine
  _color: null
  _colArray: null

  # @property [Boolean] lit
  lit: false

  # @property [Boolean] visible
  visible: true

  _id: -1
  _position: new cp.v 0, 0
  _rotation: 0 # Radians, but set in degrees by default

  # Vectors and matrices used for drawing
  _rotV: null
  _transV: null
  _modelM: null

  # Chipmunk-js values
  _shape: null
  _body: null
  _friction: null
  _mass: null
  _elasticity: null

  # Vertice containers
  _vertices: []
  _vertBuffer: null
  _vertBufferFloats: null # Float32Array

  # Shader handles, for now there are only three
  # TODO: Make this dynamic
  _sh_modelview: null
  _sh_position: null
  _sh_color: null

  # Adds the actor to the renderer actor list, gets a unique id from the
  # renderer, and builds our vert buffer
  #
  # @param [Array<Object>] vertices <x, y>
  constructor: (@_vertices) ->

    @_gl = AWGLRenderer._gl

    if @_gl == undefined or @_gl == null
      throw "GL context is required for actor initialization!"

    if @_vertices == undefined or @_vertices == null
      throw "Actor needs vertices!"

    if @_vertices.length < 6 then throw "At least 3 vertices make up an actor"

    @_id = AWGLRenderer._nextID++

    AWGLRenderer.actors.push @

    # Initialize our buffer
    @_vertBuffer = @_gl.createBuffer()
    @_vertBufferFloats = new Float32Array(@_vertices)

    @_gl.bindBuffer @_gl.ARRAY_BUFFER, @_vertBuffer
    @_gl.bufferData @_gl.ARRAY_BUFFER, @_vertBufferFloats, @_gl.STATIC_DRAW

    @setColor new AWGLColor3 255, 255, 255

    # Initialize our rendering objects
    @_rotV = $V([0, 0, 1])
    @_transV = $V([0, 0, 1])
    @_modelM = Matrix.I 4

    # Grab default shader from the renderer
    @setShader AWGLRenderer.getMe().getDefaultShader()

  # Set shader used to draw actor. For the time being, the routine mearly
  # pulls out handles for the ModelView, Color, and Position structures
  #
  # @param [AWGLShader] shader
  setShader: (shader) ->

    # Ensure shader is built, and generate handles if not already done
    if shader.getProgram() == null
      throw new Error "Shader has to be built before it can be used!"

    if shader.getHandles() == null
      shader.generateHandles()

    handles = shader.getHandles()

    _sh_modelview = handles["ModelView"]
    _sh_position = handles["Position"]
    _sh_color = handles["Color"]

  # Creates the internal physics body, if one does not already exist
  #
  # @param [Number] mass 0.0 - unbound
  # @param [Number] friction 0.0 - 1.0
  # @param [Number] elasticity 0.0 - 1.0
  createPhysicsBody: (@_mass, @_friction, @_elasticity) ->

    if @_shape is not null then return

    if AWGLPhysics.bodyCount == 0 then AWGLPhysics.startStepping()

    AWGLPhysics.bodyCount++

    # Sanity checks
    if @_mass == undefined
      @_mass = AWGLActor.defaultDensity * 100
    else
      if @_mass < 0 then @_mass = 0

    if @_friction == undefined
      @_friction = AWGLActor.defaultFriction
    else
      if @_friction < 0 then @_friction = 0
      if @_friction > 1 then @_friction = 1

    if @_elasticity == undefined
      @_elasticity = AWGLActor.defaultElasticity
    else
      if @_elasticity < 0 then @_elasticity = 0
      if @_elasticity > 1 then @_elasticity = 1

    # Convert vertices
    verts = []
    vertIndex = 0

    for i in [0...@_vertices.length - 1] by 2

      # Actual coord system conversion
      verts.push @_vertices[i] / AWGLRenderer.getPPM()
      verts.push @_vertices[i + 1] / AWGLRenderer.getPPM()

      # Rotate vert if mass is 0, since we can't set static body angle
      if @_mass == 0
        x = verts[verts.length - 2]
        y = verts[verts.length - 1]
        a = @_rotation

        verts[verts.length - 2] = (x * Math.cos(a)) - (y * Math.sin(a))
        verts[verts.length - 1] = (x * Math.sin(a)) + (y * Math.cos(a))

    # Grab world handle to shorten future calls
    space = AWGLPhysics.getWorld()
    pos = AWGLRenderer.screenToWorld @_position

    if @_mass == 0
      @_shape = space.addShape new cp.PolyShape space.staticBody, verts, pos
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

    if @_shape is null then return

    AWGLPhysics.bodyCount--

    if AWGLPhysics.bodyCount == 0
      AWGLPhysics.stopStepping()
    else if AWGLPhysics.bodyCount < 0
      throw "Body count is negative!"

    AWGLPhysics.getWorld().removeShape @_shape
    AWGLPhysics.getWorld().removeBody @_body

    @_shape = null
    @_body = null

  # Renders the actor
  #
  # @param [Object] gl gl context
  draw: (gl) ->

    if not @visible then return

    # Prep our vectors and matrices
    @_modelM = Matrix.I 4
    @_transV.x = @_position.x
    @_transV.y = @_position.y

    # @_body is null for static bodies!
    if @_body != null
      @_position = AWGLRenderer.worldToScreen @_body.getPos()
      @_rotation = @_body.a
      modelView = modelView.x (Matrix.Translation(@_transV).ensure4x4())
      modelView = modelView.x (Matrix.Rotation(@_rotation, @_rotV).ensure4x4())
    else
      modelView = modelView.x (Matrix.Translation(@_transV).ensure4x4())
      modelView = modelView.x (Matrix.Rotation(@_rotation, @_rotV).ensure4x4())

    flatMV = new Float32Array(modelView.flatten())

    gl.bindBuffer gl.ARRAY_BUFFER, @_vertBuffer
    gl.vertexAttribPointer @_sh_position, 2, gl.FLOAT, false, 0, 0

    gl.uniform4f @_sh_color, @_colArray[0], @_colArray[1], @_colArray[2], 1
    gl.uniformMatrix4fv @_sh_modelview, false, flatMV

    gl.drawArrays gl.TRIANGLE_STRIP, 0, @_vertices.length / 2

  # Set actor position, effects either the actor or the body directly if one
  # exists
  #
  # @param [Object] position x, y
  setPosition: (position) ->
    if @_shape is null
      if position instanceof cp.v
        @_position = position
      else
        @_position = new cp.v position.x, position.y
    else if @_body != null
      @_body.setPos AWGLRenderer.screenToWorld position

  # Set actor rotation, affects either the actor or the body directly if one
  # exists
  #
  # @param [Number] radians true if angle is in radians
  # @param [Number] rotation degrees
  setRotation: (rotation, radians) ->

    if radians != true
      rotation = rotation * 0.0174532925

    if @_shape is null
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
    if radians != true
      return @_rotation * 57.2957795
    else
      return @_rotation

  # Get array of vertices
  #
  # @return [Array<Object>] vertices
  getVertices: -> @_vertices

  # Get body id
  #
  # @return [Number] id
  getId: -> @_id

  # Get color
  #
  # @return [AWGLColor3] color
  getColor: -> @_color

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

    if colOrR instanceof AWGLColor3
      @_color = colOrR

      @_colArray = [
        colOrR.getR true
        colOrR.getG true
        colOrR.getB true
      ]

    else
      @_color.setR colOrR
      @_color.setG g
      @_color.setB b

      @_colArray = [
        @_color.getR true
        @_color.getG true
        @_color.getB true
      ]
