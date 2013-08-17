# Actor interface class
class AWGLActorInterface

  # Fails with null
  _findActor: (id) ->
    for a in AWGLRenderer
      if a.getId() == id then return a
    return null

  # Create actor using the supplied vertices, passed in as { x: , y: } objects
  # Fails with -1
  #
  # @param [Array<Object>] verts
  # @return [Number] id created actor handle
  createActor: (verts) -> -1

  # Set actor position using handle, fails with false
  #
  # @param [Object] position
  # @param [Number] id
  # @return [Boolean] success
  setActorPosition: (vec, id) -> false

  # Get actor position using handle, fails with null
  #
  # @param [Number] id
  # @return [Object] position
  getActorPosition: (id) -> null

  # Set actor rotation using handle, fails with false
  #
  # @param [Number] angle in degrees
  # @param [Number] id
  setActorRotation: (angle, id) -> false

  # Get actor rotation using handle, fails with null
  #
  # @param [Number] id
  # @return [Number] angle in degrees
  getActorRotation: (id) -> null

  # Set actor color using handle, fails with false
  #
  # @param [Number] r red component
  # @param [Number] g green component
  # @param [Number] b blue component
  # @param [Number] id
  # @return [Boolean] success
  setActorColor: (r, g, b, id) -> false

  # Returns actor color as a triple, in 0-255 range
  # Uses id, fails with null
  #
  # @param [Number] id
  getActorColor: (id) -> null
