##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# AWGLPsyxAnimation
#
# Class to handle actor physics updates
class AWGLPsyxAnimation

  # Class to "animate" physics properties which means changing them
  # at certain times by calling the createPhysicsBody method of an actor
  #
  # @param [AWGLActor] actor the actor we apply the modifications to
  # @param [Object] options
  # @option options [Number] mass
  # @option options [Number] friction
  # @option options [Number] elasticity
  # @option options [Number] timeout
  constructor: (@actor, @options) ->
    param.required @actor
    param.required @options.mass
    param.required @options.friction
    param.required @options.elasticity
    param.optional @options.timeout

  animate: ->
    setTimeout =>
      @actor.createPhysicsBody @options.mass, \
        @options.friction, @options.elasticity
    , @options.timeout
