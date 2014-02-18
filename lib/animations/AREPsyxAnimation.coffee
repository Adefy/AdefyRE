##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# AREPsyxAnimation
#
# Class to handle actor physics updates
class AREPsyxAnimation

  # Class to "animate" physics properties which means changing them
  # at certain times by calling the createPhysicsBody method of an actor
  #
  # @param [ARERawActor] actor the actor we apply the modifications to
  # @param [Object] options
  # @option options [Number] mass
  # @option options [Number] friction
  # @option options [Number] elasticity
  # @option options [Number] timeout
  # @option options [Method] cbStart callback to call before animating
  # @option options [Method] cbEnd callback to call after animating
  constructor: (@actor, @options) ->
    param.required @actor
    param.required @options.mass
    param.required @options.friction
    param.required @options.elasticity
    param.required @options.timeout

    # Guards against multiple exeuctions
    @_animated = false

  # Activates the animation (can only be run once)
  animate: ->
    if @_animated then return else @_animated = true
    if @options.cbStart != undefined then @options.cbStart()

    setTimeout =>
      @actor.createPhysicsBody @options.mass, \
        @options.friction, @options.elasticity
      if @options.cbEnd != undefined then @options.cbEnd()
    , @options.timeout
