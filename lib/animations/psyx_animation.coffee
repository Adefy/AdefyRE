# AREPsyxAnimation
#
# Class to handle actor physics updates
class AREPsyxAnimation

  ###
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
  ###
  constructor: (@actor, options) ->
    @_mass = options.mass || 0
    @_friction = options.friction || 0
    @_elasticity = options.elasticity || 0
    @_timeout = options.timeout
    @_cbStep = options.cbStep || ->
    @_cbEnd = options.cbEnd || ->
    @_cbStart = options.cbStart || ->

    # Guards against multiple exeuctions
    @_animated = false

  ###
  # Activates the animation (can only be run once)
  ###
  animate: ->
    if @_animated then return else @_animated = true
    @_cbStart()

    setTimeout =>
      @actor.createPhysicsBody @_mass, @_friction, @_elasticity
      @_cbEnd()
    , @_timeout
