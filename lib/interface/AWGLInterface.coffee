##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Engine interface, used by the ads themselves, serves as an API
#
# @depend AWGLActorInterface.coffee
# @depend AWGLEngineInterface.coffee
# @depend AWGLAnimationInterface.coffee
class AWGLInterface

  # Instantiates sub-interfaces
  constructor: ->
    @_Actors = new AWGLActorInterface()
    @_Engine = new AWGLEngineInterface()
    @_Animations = new AWGLAnimationInterface()

  # Sub-interfaces are broken out through accessors to prevent modification

  # Get actor sub-interface
  # @return [AWGLActorInterface] actors
  Actors: -> @_Actors

  # Get renderer sub-interface
  # @return [AWGLEngineInterface] renderer
  Engine: -> @_Engine

  # Get animation sub-interface
  # @return [AWGLAnimationInterface] animations
  Animations: -> @_Animations
