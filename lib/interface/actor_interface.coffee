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
    param.required id

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
