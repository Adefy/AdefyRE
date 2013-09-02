# Actor interface class
class AWGLActorInterface

  # Fails with null
  _findActor: (id) ->
    param.required id

    for a in AWGLRenderer.actors
      if a.getId() == id then return a
    return null

  # Create actor using the supplied vertices, passed in as a JSON
  # representation of a flat array
  #
  # @param [String] verts
  # @return [Number] id created actor handle
  createActor: (verts) ->
    param.required verts
    verts = JSON.parse verts

    a = new AWGLActor verts
    return a.getId()

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
  # @return [Object] position
  getActorPosition: (id) ->
    param.required id

    if (a = @_findActor(id)) != null
      pos = a.getPosition()
      return "{ x: #{pos.x}, y: #{pos.y} }"

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

  # Get actor rotation using handle, fails with -1
  #
  # @param [Number] id
  # @param [Boolean] radians defaults to false
  # @return [Number] angle in degrees or radians
  getActorRotation: (id, radians) ->
    param.required id
    radians = param.optional radians, false

    if (a = @_findActor(id)) != null then return a.getRotation radians
    -1

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

  # Returns actor color as a JSON triple, in 0-255 range
  # Uses id, fails with null
  #
  # @param [Number] id
  # @return [AWGLColor3] col
  getActorColor: (id) ->
    param.required id

    if (a = @_findActor(id)) != null
      r = a.getColor().getR()
      g = a.getColor().getB()
      b = a.getColor().getG()
      return "{ r: #{r}, g: #{g}, b: #{b} }"

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
