ARE_PHYSICS_UPDATE_PACKET = []

###
# Physics worker, implements a BazarShop and uses Koon for message passing
###
class AREPhysicsWorker extends Koon

  constructor: ->
    super "PhysicsWorker"

    @_shapes = []
    @_bodies = []

    @_initDefaults()
    @_setBazarNamespace /^physics\..*/

    @_createWorld()

  _initDefaults: ->
    @_benchmark = false
    @_stepIntervalId = null

    @_bodyCount = 0
    @_world = null

    @_densityRatio = 1 / 10000
    @_gravity = new cp.v 0, 9.8
    @_frameTime = 1.0 / 60.0
    @_posIterations = 4
    @_velIterations = 4

    @_PPM = 128

  _createWorld: ->
    @_world = new cp.Space
    @_world.gravity = @_gravity
    @_world.iterations = 30
    @_world.collisionSlop = 0.5
    @_world.sleepTimeThreshold = 0.5

  _setBazarNamespace: (match) ->
    postMessage
      namespace: "bazar.set_namespace"
      message: match

  ###
  # Converts screen coords to world coords
  #
  # @param [Vector] v vector in x, y form
  # @return [Vector] ret v in world coords
  ###
  screenToWorld: (v) ->
    ret = new cp.v
    ret.x = v.x / @_PPM
    ret.y = v.y / @_PPM
    ret

  ###
  # Converts world coords to screen coords
  #
  # @param [Vector] v vector in x, y form
  # @return [Vector] ret v in screen coords
  ###
  worldToScreen: (v) ->
    ret = new cp.v
    ret.x = v.x * @_PPM
    ret.y = v.y * @_PPM
    ret

  worldToScreenFast: (v) ->
    {
      x: v.x * @_PPM
      y: v.y * @_PPM
    }

  # Starts the world step loop if not already running
  startStepping: ->
    return if @_stepIntervalId

    avgStep = 0
    stepCount = 0

    stepTime = @_frameTime * 1000

    @_stepIntervalId = setInterval =>
      # start = Date.now() if @_benchmark

      @_world.step @_frameTime
      @_broadcastBodyPositions()

      ###
      # Benchmark code
      #
      #
      # return unless @_benchmark
      stepCount++

      avgStep = avgStep + ((Date.now() - start) / stepCount)

      if stepCount % 500 == 0
        console.log "Physics step time: #{avgStep.toFixed(2)}ms"
      ###

    , stepTime

  # Halt the world step loop if running
  stopStepping: ->
    return unless @_stepIntervalId

    clearInterval @_stepIntervalId
    @_stepIntervalId = null

  _broadcastBodyPositions: ->

    # We use the same array for pushing updates
    l = @_bodies.length
    
    while l--
      body = @_bodies[l]

      ARE_PHYSICS_UPDATE_PACKET[l] = [
        body.__are_id
        @worldToScreenFast body.getPos()
        body.a
      ]

    postMessage ARE_PHYSICS_UPDATE_PACKET

  receiveMessage: (message, namespace) ->
    return unless namespace
    command = namespace.split(".")

    switch command[1]
      when "ppm" then @_PPM = message.value

      when "benchmark" then switch command[2]
        when "set" then @benchmark = message.value
        when "enable" then @benchmark = true
        when "disable" then @benchmark = false

      when "disable" then @stopStepping()
      when "enable" then @startStepping()

      when "body" then switch command[2]
        when "create" then @createBody message
        when "remove" then @removeBody message

        when "set" then switch command[3]
          when "position" then @bodySetPosition message
          when "rotation" then @bodySetRotation message

      when "shape" then switch command[2]
        when "create" then @createShape message
        when "remove" then @removeShape message

        when "set" then switch command[3]
          when "layer" then @shapeSetLayer message

      when "gravity" then switch command[2]
        when "set" then @setGravity message

    # Super does logging for us
    # super message, namespace

  ###
  # Get body by id
  #
  # @param [Number] id
  # @return [Body] body
  ###
  findBody: (id) ->
    for body in @_bodies
      if body.__are_id == id
        return body

    null

  ###
  # Get shape by id
  #
  # @param [Number] id
  # @return [Shape] shape
  ###
  findShape: (id) ->
    for shape in @_shapes
      if shape.__are_id == id
        return shape

    null

  convertRawVertsToWorld: (vertices) ->
    for i in [0...vertices.length - 1] by 2
      vertices[i] /= @_PPM
      vertices[i + 1] /= @_PPM
    vertices

  removeBody: (message) ->
    return unless message.id != null and message.id != undefined
    id = message.id
    return unless (body = @findBody(id))
    @_world.removeBody body

  removeShape: (message) ->
    return unless message.id != null and message.id != undefined
    id = message.id
    return unless (shape = @findShape(id))
    @_world.removeShape shape

  createBody: (message) ->
    return unless (def = message.def)
    return if @findBody def.id

    vertices = @convertRawVertsToWorld def.vertices

    momentV = new cp.v def.momentV.x, def.momentV.y
    moment = cp.momentForPoly def.mass, vertices, momentV
    body = new cp.Body def.mass, moment

    @_world.addBody body

    body.__are_id = def.id
    body.setPos @screenToWorld(def.position) if def.position
    body.setAngle def.angle if def.angle

    @_bodies.push body

  createShape: (message) ->
    return unless (def = message.def)
    return if @findShape def.id

    shape = null
    body = null

    vertices = @convertRawVertsToWorld def.vertices

    if def.static
      body = @_world.staticBody
    else
      # Body must exist and be owned by the same object!
      body = @findBody def.id
      return unless body

    switch def.type
      when "Polygon"
        shape = new cp.PolyShape body, vertices, @screenToWorld def.position
      else
        return

    @_world.addShape shape

    shape.__are_id = def.id
    # shape.setLayers def.layer if def.layer
    shape.setFriction def.friction if def.friction
    shape.setElasticity def.elasticity if def.elasticity

    @_shapes.push shape

    # TODO: Confirm creation of shape

  bodySetPosition: (message) ->
    return unless (position = message.position)
    return unless (body = @findBody(message.id))

    body.setPos @screenToWorld position

  bodySetRotation: (message) ->
    return unless (rotation = message.rotation)
    return unless (body = @findBody(message.id))

    body.setAngle rotation

  shapeSetLayer: (message) ->
    return unless (layer = message.layer)
    return unless (shape = @findShape(message.id))

    shape.setLayers layer

  setGravity: (message) ->
    return unless (gravity = message.value)
    @_world.gravity = gravity

worker = new AREPhysicsWorker()
onmessage = (e) ->
  worker.receiveMessage e.data.message, e.data.namespace
