# AWGLVertAnimation
#
# Class to handle actor vertices updates
class AWGLVertAnimation

  # Class to 'animate' vertices which basically means changing them
  # at certain times by calling the updateVertices method of an actor
  # @param [Actor] actor the actor we apply the modifications to
  # @param [Object] options the options [timeout, verticesSet] we apply
  # @param [Bool] relOrabs relative or absolute time
  constructor: (@actor, @options, @relOrabs) ->
    param.required @actor
    param.required @options
    param.optional @relOrabs

  # param [Array] vert set of vertices to be set
  update: (vert) -> @actor.updateVertices(vert)

  # Starts the animation
  animate: ->
    for item in @options
      setTimeout(update(item.vertices), item.time)
