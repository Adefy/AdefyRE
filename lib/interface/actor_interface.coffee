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
  # Create actor using the supplied vertices, passed in as a JSON
  # representation of a flat array
  #
  # @param [String] verts
  # @return [Number] id created actor handle
  ###
  createRawActor: (verts) ->
    param.required verts

    new ARERawActor(@_renderer, JSON.parse verts).getId()

  ###
  # Create a variable sided actor of the specified radius
  #
  # @param [Number] radius
  # @param [Number] segments
  # @return [Number] id created actor handle
  ###
  createPolygonActor: (radius, segments) ->

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
  createRectangleActor: (width, height) ->
    new ARERectangleActor(@_renderer, width, height).getId()

  ###
  # Creates a circle actor with the specified radius
  #
  # @param [Number] radius
  # @return [Number] id created actor handle
  ###
  createCircleActor: (radius) ->
    new ARECircleActor(@_renderer, radius).getId()

  ###
  # Get actor render layer
  #
  # @param [Number] id
  # @return [Number] layer
  ###
  getActorLayer: (id) ->
    if a = @_findActor(id)
      return a.getLayer()

    null

  ###
  # Get actor physics layer
  #
  # @param [Number] id
  # @return [Number] physicsLayer
  ###
  getActorPhysicsLayer: (id) ->
    if a = @_findActor(id)
      return a.getPhysicsLayer()

    null

  ###
  # Fetch the width of the rectangle actor with the specified ID
  #
  # @param [Number] id
  # @return [Number] width
  ###
  getRectangleActorWidth: (id) ->
    for a in @_renderer._actors
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
    for a in @_renderer._actors
      if a.getId() == id and a instanceof ARERectangleActor
        return a.getHeight()

    null

  ###
  # Get actor opacity using handle, fails with null
  #
  # @param [Number] id
  # @return [Number] opacity
  ###
  getActorOpacity: (id) ->
    if a = @_findActor id
      return a.getOpacity()

    null

  ###
  # Get actor visible using handle, fails with null
  #
  # @param [Number] id
  # @return [Boolean] visible
  ###
  getActorVisible: (id) ->
    if a = @_findActor id
      return a.getVisible()

    null

  ###
  # Get actor position using handle, fails with null
  # Returns position as a JSON representation of a primitive (x, y) object!
  #
  # @param [Number] id
  # @return [Object] position {x, y}
  ###
  getActorPosition: (id) ->
    if a = @_findActor id
      a.getPosition()
    else
      null

  ###
  # Get actor rotation using handle, fails with 0.000001
  #
  # @param [Number] id
  # @param [Boolean] radians defaults to false
  # @return [Number] angle in degrees or radians
  ###
  getActorRotation: (id, radians) ->
    if a = @_findActor id
      return a.getRotation !!radians

    0.000001

  ###
  # Returns actor color as a JSON triple, in 0-255 range
  # Uses id, fails with null
  #
  # @param [Number] id
  # @return [String] col
  ###
  getActorColor: (id) ->
    if a = @_findActor id
      color = a.getColor()

      return {
        r: color.getR()
        g: color.getG()
        b: color.getB()
      }

    return null

  ###
  # Return an Actor's texture name
  #
  # @param [Number] id
  # @return [String] texture_name
  ###
  getActorTexture: (id) ->
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
  getActorTextureRepeat: (id) ->
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
  setRectangleActorHeight: (id, height) ->
    for a in @_renderer._actors
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
    for a in @_renderer._actors
      if a.getId() == id and a instanceof ARERectangleActor
        a.setWidth width
        return true

    false

  ###
  # Set the segment count of the polygon actor with the specified ID
  #
  # @param [Number] id
  # @param [Number] segments
  # @return [Boolean] success
  ###
  setPolygonActorSegments: (id, segments) ->
    for a in @_renderer._actors
      if a.getId() == id and a instanceof AREPolygonActor
        a.setSegments segments
        return true

    false

  ###
  # Set the radius of the polygon actor with the specified ID
  #
  # @param [Number] id
  # @param [Number] radius
  # @return [Boolean] success
  ###
  setPolygonActorRadius: (id, radius) ->
    for a in @_renderer._actors
      if a.getId() == id and a instanceof AREPolygonActor
        a.setRadius radius
        return true

    false

  ###
  # Get the radius of the polygon actor with the specified ID
  #
  # @param [Number] id
  # @return [Number] radius
  ###
  getPolygonActorRadius: (id) ->
    for a in @_renderer._actors
      if a.getId() == id and a instanceof AREPolygonActor
        return a.getRadius()

    null

  ###
  # Get the segment count of the polygon actor with the specified ID
  #
  # @param [Number] id
  # @return [Number] segments
  ###
  getPolygonActorSegments: (id, radius) ->
    for a in @_renderer._actors
      if a.getId() == id and a instanceof AREPolygonActor
        return a.getSegments()

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
  setActorLayer: (id, layer) ->
    if a = @_findActor id
      a.setLayer layer
      return true

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
  setActorPhysicsLayer: (id, layer) ->
    if a = @_findActor id
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
    if a = @_findActor id
      a.removeAttachment()
      return true

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
      return a.setAttachmentVisibility visible

    false

  ###
  # Refresh actor vertices, passed in as a JSON representation of a flat array
  #
  # @param [Number] id actor id
  # @param [String] verts
  # @return [Boolean] success
  ###
  updateVertices: (id, verts) ->
    if a = @_findActor id
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
    if a = @_findActor id
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
    if a = @_findActor id
      a.destroy()
      return true

    false

  ###
  # Supply an alternate set of vertices for the physics body of an actor. This
  # is necessary for triangle-fan shapes, since the center point must be
  # removed when building the physics body. If a physics body already exists,
  # this rebuilds it!
  #
  # @param [Number] id actor id
  # @param [String] verts
  # @return [Boolean] success
  ###
  setPhysicsVertices: (id, verts) ->
    if a = @_findActor id
      a.setPhysicsVertices JSON.parse verts
      return true

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
      return true

    false

  ###
  # Set actor opacity using handle, fails with false
  #
  # @param [Number] id
  # @param [Number opacity
  # @return [Boolean] success
  ###
  setActorOpacity: (id, opacity) ->
    return false if isNaN opacity
    opacity = Number opacity

    opacity = 1.0 if opacity > 1.0
    opacity = 0.0 if opacity < 0.0

    if a = @_findActor id
      a.setOpacity opacity
      return true

    false

  ###
  # Set actor visible using handle, fails with false
  #
  # @param [Number] id
  # @param [Boolean] visible
  # @return [Boolean] success
  ###
  setActorVisible: (id, visible) ->
    if a = @_findActor id
      a.setVisible visible
      return true

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
  setActorPosition: (id, position) ->
    if a = @_findActor id
      a.setPosition position
      return true

    false

  ###
  # Set actor rotation using handle, fails with false
  #
  # @param [Number] id
  # @param [Number] angle in degrees or radians
  # @param [Boolean] radians defaults to false
  # @return [Boolean] success
  ###
  setActorRotation: (id, angle, radians) ->
    if a = @_findActor id
      a.setRotation angle, !!radians
      return true

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
  setActorColor: (id, color) ->
    if a = @_findActor id
      a.setColor color
      return true

    false

  ###
  # Set actor texture by texture handle. Expects the texture to already be
  # loaded by the asset system!
  #
  # @param [Number] id
  # @param [String] name
  # @return [Boolean] success
  ###
  setActorTexture: (id, name) ->
    if a = @_findActor id
      a.setTexture name
      return true

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
  setActorTextureRepeat: (id, repeat) ->
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
  enableActorPhysics: (id, mass, friction, elasticity) ->
    if a = @_findActor id
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
    if a = @_findActor id
      a.destroyPhysicsBody()
      return true

    false
