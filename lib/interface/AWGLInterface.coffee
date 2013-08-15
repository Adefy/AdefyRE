# Engine interface, used by the ads themselves, serves as an API
class AWGLInterface

  # @property [AWGLActorInterface] actor interface
  _Actors: null

  constructor: ->

    @_Actors = new AWGLActorInterface()

  # Sub-interfaces are broken out through accessors to prevent modification

  # Get actor sub-interface
  # @return [AWGLActorInterface] actors
  Actors: -> @_Actors
