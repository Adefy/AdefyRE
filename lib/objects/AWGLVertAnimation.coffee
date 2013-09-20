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

  # The actual vertices changing function
  #
  # @param [Object] vert set of vertices to apply to the actor
  # @param [Number] time the delay in miliseconds to make the update
  update: (vert, time) ->
    me = @
    setTimeout ->
      me.actor.updateVertices vert
    , time

  # Looks through all the options provided and sends them to the update
  # function so they are not lost when i updates
  animate: ->
    me = @
    for vert, i in @options.vertices
      me.update @options.vertices[i], @options.time[i]