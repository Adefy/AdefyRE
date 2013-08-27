# Engine interface, used by the ads themselves, serves as an API
#
# @depend AWGLActorInterface.coffee
class AWGLInterface

  constructor: -> @_Actors = new AWGLActorInterface()

  # Sub-interfaces are broken out through accessors to prevent modification

  # Get actor sub-interface
  # @return [AWGLActorInterface] actors
  Actors: -> @_Actors
