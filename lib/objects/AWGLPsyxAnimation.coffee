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
  # @option options [Number] start optional, negative means start immediately
  constructor: (@actor, @options) ->
    param.required @actor
    param.required @options.mass
    param.required @options.friction
    param.required @options.elasticity
    param.optional @options.timeout
    options.start = param.optional options.start, 0

    # Start animation now, or schedule start in the future if desired
    if options.start < 0 then @animate()
    else if options.start > 0 then setTimeout (=> @animate()), options.start

  animate: ->
    setTimeout =>
      @actor.createPhysicsBody @options.mass, \
        @options.friction, @options.elasticity
    , @options.timeout
