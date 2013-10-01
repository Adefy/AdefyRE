##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# AWGLVertAnimation
#
# Class to handle actor vertices updates
class AWGLVertAnimation

  # Class to "animate" vertices which basically means changing them
  # at certain times by calling the updateVertices method of an actor
  #
  # @param [Actor] actor the actor we apply the modifications to
  # @param [Object] options the options we apply
  # @option options [Array<Number>] time
  # @option options [Array<String>] vertices
  constructor: (@actor, @options) ->
    param.required @actor
    param.required @options
    param.required @options.time
    param.required @options.vertices

  # The actual vertices changing function
  #
  # @param [Object] vert set of vertices to apply to the actor
  # @param [Number] time the delay in miliseconds to make the update
  update: (vert, time) ->
    setTimeout =>
      @actor.updateVertices vert
    , time

  # Looks through all the options provided and sends them to the update
  # function so they are not lost when i updates
  animate: ->
    for vert, i in @options.vertices
      @update @options.vertices[i], @options.time[i]