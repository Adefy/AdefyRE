# Engine interface, used by the ads themselves, serves as an API
#
# @depend actor_interface.coffee
# @depend engine_interface.coffee
# @depend animation_interface.coffee
class AREInterface

  # Instantiates sub-interfaces
  constructor: ->
    @_Actors = new AREActorInterface @
    @_Engine = new AREEngineInterface @
    @_Animations = new AREAnimationInterface @

  # Sub-interfaces are broken out through accessors to prevent modification

  # Get actor sub-interface
  # @return [AREActorInterface] actors
  Actors: -> @_Actors

  # Get renderer sub-interface
  # @return [AREEngineInterface] renderer
  Engine: -> @_Engine

  # Get animation sub-interface
  # @return [AREAnimationInterface] animations
  Animations: -> @_Animations

  # Set the ARE instance targeted by the interface
  setEngine: (engine) ->
    @_Actors.setEngine engine
    @_Animations.setEngine engine
