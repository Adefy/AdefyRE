# Actor class, skeleton for now
#
# @depend ../AWGLRenderer.coffee
class AWGLActor

  # Default physical properties
  @defaultFriction: 0.3
  @defaultDensity: 1.0
  @defaultRestitution: 0.2

  color: new AWGLColor3 255, 255, 255

  lit: false
  visible: false

  _id: -1
  _position: new b2Vec2 0, 0
  _rotation: 0 # Degrees

  _body: null
  _friction: null
  _density: null
  _restitution: null

  _vertices: []

  ###
  _positionHandle: gl.glGetAttribLocation Renderer.getShaderProg, "Position"
  _colorHandle: gl.glGetUniformLocation Renderer.getShaderProg, "Color"
  _modelHandle: gl.glGetUniformLocation Renderer.getShaderProg "ModelView"
  ###

  # Adds the actor to the renderer actor list, gets a unique id from the
  # renderer
  constructor: (@_vertices) ->

    if @_vertices == undefined or @_vertices == null
      throw "Actor needs vertices!"

    if @_vertices.length < 3 then throw "At least 3 vertices make up an actor"

    @_id = AWGLRenderer.getNextID()
    AWGLRenderer.actors.add @

  # Creates the internal physics body, if one does not already exist
  #
  # @param [Number] density 0.0 - 1.0
  # @param [Number] friction 0.0 - 1.0
  # @param [Number] restitution 0.0 - 1.0
  createPhysicsBody: (@_density, @_friction, @_restitution) ->

    if @_body is null then return

    # Sanity checks
    if @_density == undefined
      @_density = AWGLActor.defaultDensity
    else
      if @_density < 0 then @_density = 0
      if @_density > 1 then @_density = 1

    if @_friction == undefined
      @_friction = AWGLActor.defaultFriction
    else
      if @_friction < 0 then @_friction = 0
      if @_friction > 1 then @_friction = 1

    if @_restitution == undefined
      @_restitution = AWGLActor.defaultRestitution
    else
      if @_restitution < 0 then @_restitution = 0
      if @_restitution > 1 then @_restitution = 1

    # TODO: Actually create the body

  # Destroys the physics body if one exists
  destroyPhysicsBody: ->

    if @_body is null then return
    #PhysicsEngine.destroyBody body
    @_body = null

  # Renders the actor
  #
  # @param [Object] gl gl context
  draw: (gl) ->

  #public void draw()

    #if(!visible) { return; }

    #// Update local data from physics engine, if applicable
    #if(body != null) {
    #  position = Renderer.worldToScreen(body.getPosition());
    #  rotation = body.getAngle() * 57.2957795786f;
    #}

    #// Construct mvp to be applied to every vertex
    #float[] modelView = new float[16];

    #// Equivalent of gl.glLoadIdentity()
    #Matrix.setIdentityM(modelView, 0);

    #// gl.glTranslatef()
    #Matrix.translateM(modelView, 0, position.x, position.y, 1.0f);

    #// gl.glRotatef()
    #Matrix.rotateM(modelView, 0, rotation, 0, 0, 1.0f);

    #// Load our matrix and color into our shader
    #GLES20.glUniformMatrix4fv(modelHandle, 1, false, modelView, 0);
    #GLES20.glUniform4fv(colorHandle, 1, color.toFloatArray(), 0);

    #// Set up pointers, and draw using our vertBuffer as before
    #GLES20.glVertexAttribPointer(positionHandle, 3, GLES20.GL_FLOAT, false, 0, vertBuffer);
    #GLES20.glEnableVertexAttribArray(positionHandle);
    #GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, vertices.length / 3);
    #GLES20.glDisableVertexAttribArray(positionHandle);

  # Set actor position, effects either the actor or the body directly if one
  # exists
  #
  # @param [Object] position x, y
  setPosition: (position) ->
    if @_body is null
      @_position = position
    else
      return # @_body.setTransform Renderer.screenToWorld position, @_body.getAngle

  # Set actor rotation, affects either the actor or the body directly if one
  # exists
  #
  # @param [Number] rotation degrees
  setRotation: (rotation) ->
    if @_body is null
      @_rotation = rotation
    else
      return #@_body.setTransform @_body.getPosition, rotation * 0.0174532925f

  # Returns the actor position as an object with x and y properties
  #
  # @return [Object] position x, y
  getPosition: ->
    if @_body is null
      return @_position
    else
      # how do you translate this to CS?
      return null # return Renderer.worldToScreen(@_body.getPosition());

  # Returns actor rotation as an angle in degrees
  #
  # @return [Number] angle rotation in degrees on z axis
  getRotation: ->
    if @_body is null
      return @_rotation
    else
      # how do you get the funky 57.2957795786f in coffeescript?
      return null # return @_body.getAngle * 57.2957795786f

  # Get array of vertices
  #
  # @return [Array<Object>] vertices
  getVertices: -> @_vertices

  # Get body id
  #
  # @return [Number] id
  getId: -> @_id
