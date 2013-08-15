# Box2D wrapper
# @depend AWGLEngine.coffee
class AWGLPhysics

  # @property [Number] velocity iterations
  velIterations: 6

  # @property [Number] position iterations
  posIterations: 2

  # @property [Number] time to step for
  frameTime: 1.0 / 60.0

  _gravity: new b2Vec2 0, 0
  _stepIntervalId: null
  _world: null

  # Constructor, creates the world
  constructor: ->
    _world = new Box2D.Dynamics.b2World @_gravity, true

  # Starts the world step loop if not already running
  startStepping: ->
    if @_stepIntervalId != null then return

    me = @
    AWGLEngine.getLog().info "Starting world update loop"

    @_stepIntervalId = setInterval ->
      me._world.step me.frameTime, me.velIterations, me.posIterations
    , @frameTime

  # Halt the world step loop if running
  stopStepping: ->
    if @_stepIntervalId == null then return
    AWGLEngine.getLog().info "Halting world update loop"
    clearInterval @_stepIntervalId
    @_stepIntervalId = null

  # Get the internal Box2D world
  #
  # @return [Object] world
  getWorld: -> @_world
