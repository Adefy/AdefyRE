# AWGLVertAnimation
#
# Class to handle actor vertices updates
class AWGLVertAnimation

  # Class to "animate" vertices which basically means changing them
  # at certain times by calling the updateVertices method of an actor
  #
  # @param [Actor] actor the actor we apply the modifications to
  # @param [Object] options the options we apply
  # @option options [Array<Number>] timeoutSets
  # @option options [Array<String>] vertexSets
  constructor: (@actor, @options) ->
    param.required @actor
    param.required @options
    param.required @options.timeoutSets
    param.requires @options.vertexSets

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
    for vert, i in @options.vertexSets
      me.update @options.vertexSets[i], @options.timeoutSets[i]