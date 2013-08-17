# Chipmunk-js wrapper
class AWGLPhysics

  # @property [Number] velocity iterations
  velIterations: 6

  # @property [Number] position iterations
  posIterations: 2

  # @property [Number] time to step for
  frameTime: 1.0 / 60.0

  _gravity: new cp.v 0, -1
  _stepIntervalId: null
  _world: null

  _densityRatio: 1 / 10000

  # Constructor, creates the world
  constructor: ->
    @_world = new cp.Space
    @_world.gravity = @_gravity
    @_world.iterations = 60
    @_world.collisionSlop = 0.5
    @_world.sleepTimeThreshold = 0.5

  # Starts the world step loop if not already running
  startStepping: ->
    if @_stepIntervalId != null then return

    me = @
    AWGLEngine.getLog().info "Starting world update loop"

    @_stepIntervalId = setInterval ->
      me._world.step me.frameTime
    , @frameTime

  # Halt the world step loop if running
  stopStepping: ->
    if @_stepIntervalId == null then return
    AWGLEngine.getLog().info "Halting world update loop"
    clearInterval @_stepIntervalId
    @_stepIntervalId = null

  # Get the internal chipmunk world
  #
  # @return [Object] world
  getWorld: -> @_world

  # Get object density ratio number thing (keeps it constant)
  #
  # @return [Number] densityRatio
  getDensityRatio: -> @_densityRatio
