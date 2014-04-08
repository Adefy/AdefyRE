##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Chipmunk-js wrapper
class AREPhysics

  # @property [Number] velocity iterations
  @velIterations: 6

  # @property [Number] position iterations
  @posIterations: 2

  # @property [Number] time to step for
  @frameTime: 1.0 / 60.0

  # acting upwards
  @_gravity: new cp.v 0, -1
  # 0, 0 acting downwards
  #@_gravity: new cp.v 0, 1

  @_stepIntervalId: null
  @_world: null

  @_densityRatio: 1 / 10000

  @bodyCount: 0

  @benchmark: false

  # Constructor, should never be called
  # AREPhysics should only ever be accessed as static
  constructor: -> throw new Error "Physics constructor called"

  # Starts the world step loop if not already running
  @startStepping: ->

    if @_stepIntervalId != null then return

    @_world = new cp.Space
    @_world.gravity = @_gravity
    @_world.iterations = 60
    @_world.collisionSlop = 0.5
    @_world.sleepTimeThreshold = 0.5

    ARELog.info "Starting world update loop"

    avgStep = 0
    stepCount = 0

    @_stepIntervalId = setInterval =>
      start = Date.now()

      @_world.step @frameTime

      if @benchmark
        stepCount++
        avgStep = avgStep + ((Date.now() - start) / stepCount)

        if stepCount % 500 == 0
          console.log "Physics step time: #{avgStep.toFixed(2)}ms"

    , @frameTime

  # Halt the world step loop if running
  @stopStepping: ->
    if @_stepIntervalId == null then return
    ARELog.info "Halting world update loop"
    clearInterval @_stepIntervalId
    @_stepIntervalId = null
    @_world = null

  # Get the internal chipmunk world
  #
  # @return [Object] world
  @getWorld: -> @_world

  # Get object density ratio number thing (keeps it constant)
  #
  # @return [Number] densityRatio
  @getDensityRatio: -> @_densityRatio

  # Get gravity
  #
  # @return [cp.v] gravity
  @getGravity: -> @_gravity

  # Set gravity
  #
  # @param [cp.v] gravity
  @setGravity: (v) ->

    if v !instanceof cp.Vect
      throw new Error "You need to set space gravity using cp.v!"

    @_gravity = v

    if @_world != null and @_world != undefined
      @_world.gravity = v
