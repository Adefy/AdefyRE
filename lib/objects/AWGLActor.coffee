# Actor class, skeleton for now
class AWGLActor

  # Default physical properties
  @defaultFriction: 0.3
  @defaultMass: 10
  @defaultElasticity: 0.2

  # @property [AWGLColor3] color
  color: new AWGLColor3 255, 255, 255

  # @property [Boolean] lit
  lit: false

  # @property [Boolean] visible
  visible: true

  _id: -1
  _position: new cp.v 0, 0
  _rotation: 0 # Radians, but set in degrees by default

  _shape: null
  _body: null
  _friction: null
  _mass: null
  _elasticity: null

  _vertices: []
  _vertBuffer: null

  # Null offset, used when creating dynamic bodies
  @_nullV: new cp.v 0, 0

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
    @_gl.bindBuffer @_gl.ARRAY_BUFFER, @_vertBuffer
    @_gl.bufferData @_gl.ARRAY_BUFFER, new Float32Array(@_vertices), @_gl.STATIC_DRAW

  # Creates the internal physics body, if one does not already exist
  #
  # @param [Number] mass 0.0 - unbound
  # @param [Number] friction 0.0 - 1.0
  # @param [Number] elasticity 0.0 - 1.0
  createPhysicsBody: (@_mass, @_friction, @_elasticity) ->

    if @_shape is not null then return

    # Sanity checks
    if @_mass == undefined
      @_mass = AWGLActor.defaultDensity
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
    space = AWGLEngine.getPsyx().getWorld()
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

    AWGLEngine.getPsyx().getWorld().removeShape @_shape
    AWGLEngine.getPsyx().getWorld().removeBody @_body

    @_shape = null
    @_body = null

  # Renders the actor
  #
  # @param [Object] gl gl context
  draw: (gl) ->

    if not @visible then return

    modelView = Matrix.I 4

    # @_body is null for static bodies!
    if @_body != null
      @_position = AWGLRenderer.worldToScreen @_body.getPos()
      @_rotation = @_body.a
      modelView = modelView.x (Matrix.Translation($V([@_position.x, @_position.y, 1])).ensure4x4())
      modelView = modelView.x (Matrix.Rotation(@_rotation, $V([0, 0, 1])).ensure4x4())
    else
      modelView = modelView.x (Matrix.Translation($V([@_position.x, @_position.y, 1])).ensure4x4())
      modelView = modelView.x (Matrix.Rotation(@_rotation, $V([0, 0, 1])).ensure4x4())

    gl.bindBuffer gl.ARRAY_BUFFER, @_vertBuffer
    gl.vertexAttribPointer AWGLRenderer.attrVertPosition, 2, gl.FLOAT, false, 0, 0

    gl.uniformMatrix4fv AWGLRenderer.attrModelView, false, new Float32Array(modelView.flatten())

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
