##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Actor interface class
class AWGLActorInterface

  # Fails with null
  # @private
  _findActor: (id) ->
    param.required id

    for a in AWGLRenderer.actors
      if a.getId() == id then return a
    return null

  # Create actor using the supplied vertices, passed in as a JSON
  # representation of a flat array
  #
  # @param [String] verts
  # @param [String] texverts optional
  # @return [Number] id created actor handle
  createActor: (verts, texverts) ->
    param.required verts
    if texverts != undefined then texverts = JSON.parse texverts

    verts = JSON.parse verts

    a = new AWGLActor verts, texverts
    return a.getId()

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

  # Set actor layer. Fails if actor isn't found.
  # Actors render from largest layer to smallest
  #
  # @param [Number] layer
  # @param [Number] id id of actor to set layer of
  # @return [Boolean] success
  setActorLayer: (layer, id) ->
    param.required id
    param.required layer

    if (a = @_findActor(id)) != null
      a.setLayer layer
      return true

    false

  # Set actor physics layer. Fails if actor isn't found.
  # Physics layers persist within an actor between body creations. Only bodies
  # in the same layer will collide! There are only 16 physics layers!
  #
  # @param [Number] layer
  # @param [Number] id id of actor to set layer of
  # @return [Boolean] success
  setActorPhysicsLayer: (layer, id) ->
    param.required id
    param.required layer

    if (a = @_findActor(id)) != null
      a.setPhysicsLayer layer
      return true

    false


  # Remove attachment from an actor. Fails if actor isn't found
  #
  # @param [Number] id id of actor to remove texture from
  # @return [Boolean] success
  removeAttachment: (id) ->
    param.required id

    if (a = @_findActor(id)) != null
      a.removeAttachment()
      return true

    false

  # Set attachment visiblity. Fails if actor isn't found, or actor has no
  # attachment.
  #
  # @param [Boolean] visible
  # @param [Number] id id of actor to modify
  # @return [Boolean] success
  setAttachmentVisiblity: (visible, id) ->
    param.required visible

    if (a = @_findActor(id)) != null
      return a.setAttachmentVisibility visible

    false

  # Refresh actor vertices, passed in as a JSON representation of a flat array
  #
  # @param [String] verts
  # @param [Number] id actor id
  # @return [Boolean] success
  updateVertices: (verts, id) ->
    param.required verts
    param.required id

    if (a = @_findActor(id)) != null
      a.updateVertices JSON.parse verts
      return true

    false

  # Get actor vertices as a flat array
  #
  # @param [Number] id actor id
  # @return [String] vertices
  getVertices: (id) ->
    param.required id

    if (a = @_findActor(id)) != null
      return JSON.stringify a.getVertices()

    null

  # Clears stored information about the actor in question. This includes the
  # rendered and physics bodies
  #
  # @param [Numer] id actor id
  # @return [Boolean] success
  destroyActor: (id) ->
    param.required id

    for a, i in AWGLRenderer.actors
      if a.getId() == id
        a.destroyPhysicsBody()
        AWGLRenderer.actors.splice i, 1
        a = undefined
        return true

    false

  # Supply an alternate set of vertices for the physics body of an actor. This
  # is necessary for triangle-fan shapes, since the center point must be
  # removed when building the physics body. If a physics body already exists,
  # this rebuilds it!
  #
  # @param [String] verts
  # @param [Number] id actor id
  # @return [Boolean] success
  setPhysicsVertices: (verts, id) ->
    param.required verts
    param.required id

    if (a = @_findActor(id)) != null
      a.setPhysicsVertices JSON.parse verts
      return true

    false

  # Change actors' render mode, currently only options are avaliable
  #   1 == TRIANGLE_STRIP
  #   2 == TRIANGLE_FAN
  #
  # @param [Number] mode
  # @param [Number] id actor id
  # @return [Boolean] success
  setRenderMode: (mode, id) ->
    mode = param.required mode, [1, 2]
    param.required id

    if (a = @_findActor(id)) != null
      a.setRenderMode mode
      return true

    false

  # Set actor position using handle, fails with false
  #
  # @param [Number] x x coordinate
  # @param [Number] y y coordinate
  # @param [Number] id
  # @return [Boolean] success
  setActorPosition: (x, y, id) ->
    param.required x
    param.required y
    param.required id

    if (a = @_findActor(id)) != null
      a.setPosition new cp.v x, y
      return true

    false

  # Get actor position using handle, fails with null
  # Returns position as a JSON representation of a primitive (x, y) object!
  #
  # @param [Number] id
  # @return [String] position
  getActorPosition: (id) ->
    param.required id

    if (a = @_findActor(id)) != null
      pos = a.getPosition()

      return JSON.stringify
        x: pos.x
        y: pos.y

    null

  # Set actor rotation using handle, fails with false
  #
  # @param [Number] angle in degrees or radians
  # @param [Number] id
  # @param [Boolean] radians defaults to false
  # @return [Boolean] success
  setActorRotation: (angle, id, radians) ->
    param.required angle
    param.required id
    radians = param.optional radians, false

    if (a = @_findActor(id)) != null
      a.setRotation angle, radians
      return true

    false

  # Get actor rotation using handle, fails with 0.000001
  #
  # @param [Number] id
  # @param [Boolean] radians defaults to false
  # @return [Number] angle in degrees or radians
  getActorRotation: (id, radians) ->
    param.required id
    radians = param.optional radians, false

    if (a = @_findActor(id)) != null then return a.getRotation radians
    0.000001

  # Set actor color using handle, fails with false
  #
  # @param [Number] r red component
  # @param [Number] g green component
  # @param [Number] b blue component
  # @param [Number] id
  # @return [Boolean] success
  setActorColor: (r, g, b, id) ->
    param.required r
    param.required g
    param.required b
    param.required id

    if (a = @_findActor(id)) != null
      a.setColor new AWGLColor3 r, g, b
      return true

    false

  setTexture: (texture, id) ->
    param.required texture
    if (a = @_findActor(id)) != null
      a.setTexture texture
      return true

  # Returns actor color as a JSON triple, in 0-255 range
  # Uses id, fails with null
  #
  # @param [Number] id
  # @return [String] col
  getActorColor: (id) ->
    param.required id

    if (a = @_findActor(id)) != null
      return JSON.stringify
        r: a.getColor().getR()
        g: a.getColor().getG()
        b: a.getColor().getB()

    null

  # Creates the internal physics body, if one does not already exist
  # Fails with false
  #
  # @param [Number] mass 0.0 - unbound
  # @param [Number] friction 0.0 - 1.0
  # @param [Number] elasticity 0.0 - 1.0
  # @param [Number] id
  # @return [Boolean] success
  enableActorPhysics: (mass, friction, elasticity, id) ->
    param.required id
    param.required mass
    param.required friction
    param.required elasticity

    if (a = @_findActor(id)) != null
      a.createPhysicsBody mass, friction, elasticity
      return true

    false

  # Destroys the physics body if one exists, fails with false
  #
  # @param [Number] id
  # @return [Boolean] success
  destroyPhysicsBody: (id) ->
    param.required id

    if (a = @_findActor(id)) != null
      a.destroyPhysicsBody()
      true

    false

  # Assigns a texture to an actor by name
  #
  # @param [String] name
  # @param [Number] id
  # @return [Boolean] success
  setActorTexture: (name, id) ->
    param.required name
    param.required id

    if (a = @_findActor(id)) != null
      a.setTexture name
      true

    false
