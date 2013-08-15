# Actor class, skeleton for now
class AWGLActor

  #private int id;
  #private Body body = null;

  #protected FloatBuffer vertBuffer;
  #protected FloatBuffer texBuffer;

  #protected float vertices[];
  #protected float texVerts[] = null;
  #protected int[] texture = new int[1];

  #protected Vec2 position = new Vec2(0.0f, 0.0f);
  #protected float rotation = 0.0f;

  color: new AWGLColor3(255, 255, 255)

  lit = false
  visible = false

  #how do you make this declaration in coffee?
  #private float friction;
  #private float density;
  #private float restitution;

  _positionHandle = gl.glGetAttribLocation Renderer.getShaderProg, "Position"
  _colorHandle = gl.glGetUniformLocation Renderer.getShaderProg, "Color"
  _modelHandle = gl.glGetUniformLocation Renderer.getShaderProg "ModelView"


  constructor: (id, vertices) ->

    # ...
    @_id = id
    @_vertices = vertices

    AWGLRenderer.actors.add(@)

    refreshVertBuffer

  @refreshVertBuffer: ->

    #ByteBuffer byteBuffer = ByteBuffer.allocateDirect(vertices.length * 4);
    byteBuffer.order ByteOrder.nativeOrder
    vertBuffer = byteBuffer.asFloatBuffer
    vertBuffer.put _vertices
    vertBuffer.position 0

    if body != null
      destroyPhysicsBody
      createPhysicsBody(_density, _friction, _restitution)

  createPhysicsBody: (density, friction, restitution) ->

    if body is null
      return

    @_density = density
    @_friction = friction
    @_restitution = restitution
    #....


  onBodyCreation: (body) ->
    #// Threads ftw
    #synchronized (this) {
    #body = _body;

    #// Body has been created, make fixture and finalize it
    #// Physics world waits for completion before continuing

    #// Create fixture from vertices
    #PolygonShape shape = new PolygonShape();
    #Vec2[] verts = new Vec2[vertices.length / 3];

    #int vertIndex = 0;
    #for(int i = 0; i < vertices.length; i += 3) {
    #  verts[vertIndex] = new Vec2(vertices[i] / Renderer.getPPM(), vertices[i + 1] / Renderer.getPPM());
    #  vertIndex++;
    #}

    #shape.set(verts, verts.length);

    #// Attach fixture
    #FixtureDef fd = new FixtureDef();
    #fd.shape = shape;
    #fd.density = density;
    #fd.friction = friction;
    #fd.restitution = restitution;

    #body.createFixture(fd);
  #}


  @destroyPhysicsBody: ->

    if body is null
      return
    PhysicsEngine.destroyBody body
    body = null

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


  @setPosition: (position) ->
    if body is null
      @_position = position
    else
      body.setTransform Renderer.screenToWorld position, body.getAngle


  @setRotation: (rotation) ->
    if body is null
      @_rotation = rotation
    else
      # how do you convert the number?
      #body.setTransform body.getPosition, rotation * 0.0174532925f

  @getPosition: ->

    if body is null
      return position
    else
      # how do you translate this to CS?
      # return Renderer.worldToScreen(body.getPosition());

  @getRotation: ->
    if body is null
      return rotation
    else
      # how do you get the funky 57.2957795786f in coffeescript?
      # return body.getAngle * 57.2957795786f


  @getVertices: -> @_vertices

  @getId: -> @_id