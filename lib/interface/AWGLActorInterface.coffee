# Actor interface class
class AWGLActorInterface

  # Fails with null
  _findActor: (id) ->
    for a in AWGLRenderer.actors
      if a.getId() == id then return a
    return null

  # Create actor using the supplied vertices, passed in as { x: , y: } objects
  #
  # @param [Array<Object>] verts
  # @return [Number] id created actor handle
  createActor: (verts) ->

    a = new AWGLActor verts
    return a.getId()

  # Set actor position using handle, fails with false
  #
  # @param [Object] position
  # @param [Number] id
  # @return [Boolean] success
  setActorPosition: (vec, id) ->

    if a = @_findActor(id) != null
      a.setPosition vec
      return true

    false

  # Get actor position using handle, fails with null
  #
  # @param [Number] id
  # @return [Object] position
  getActorPosition: (id) ->

    if a = @_findActor(id) != null
      return a.getPosition()

    null

  # Set actor rotation using handle, fails with false
  #
  # @param [Number] angle in degrees or radians
  # @param [Number] id
  # @param [Boolean] radians defaults to false
  setActorRotation: (angle, id, radians) ->

    if a = @_findActor(id) != null
      if radians != true then radians = false
      a.setRotation angle, radians
      return true

    false

  # Get actor rotation using handle, fails with null
  #
  # @param [Number] id
  # @param [Boolean] radians defaults to false
  # @return [Number] angle in degrees or radians
  getActorRotation: (id, radians) ->

    if a = @_findActor(id) != null
      if radians != true then radians = false
      return a.getRotation radians

    null

  # Set actor color using handle, fails with false
  #
  # @param [Number] r red component
  # @param [Number] g green component
  # @param [Number] b blue component
  # @param [Number] id
  # @return [Boolean] success
  setActorColor: (r, g, b, id) ->

    if a = @_findActor(id) != null
      a.setColor new AWGLColor3 r, g, b
      return true

    false

  # Returns actor color as a triple, in 0-255 range
  # Uses id, fails with null
  #
  # @param [Number] id
  getActorColor: (id) ->
    if a = @_findActor(id) != null then return a.getColor()
    null
