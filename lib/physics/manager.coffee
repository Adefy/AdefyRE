###
# PhysicsManager is in charge of starting and communicating with the physics
# web worker.
###
class PhysicsManager

  constructor: (@_renderer, depPaths, cb) ->
    param.required _renderer
    param.required depPaths

    # Messages that are sent before our worker is initialised
    @_backlog = []

    dependencies = [
      raw: "cp = exports = {};"
    ,
      url: depPaths.chipmunk
    ,
      url: depPaths.physics_worker
    ]

    async.map dependencies, (dependency, depCB) ->
      return depCB(null, dependency.raw) if dependency.raw

      $.ajax
        url: dependency.url
        mimeType: "text"
        success:  (rawDep) ->
          depCB null, rawDep

    , (error, sources) =>
      @_initFromSources sources
      @_emptyBacklog()
      cb() if cb

  _initFromSources: (sources) ->
    return if !!@_worker

    data = new Blob [sources.join("\n\n")], type: "text/javascript"
    @_worker = new Worker (URL || (window.webkitURL)).createObjectURL data
    @_worker.postMessage ""
    @_connectWorkerListener()

  _emptyBacklog: ->
    return unless !!@_worker
    for item in @_backlog
      @sendMessage item.message, item.command

  ###
  # Broadcast a message to the physics manager; this gets passed through to the
  # underlying web worker.
  #
  # @param [Object] message
  # @param [String] command
  ###
  sendMessage: (message, command) ->
    if !!@_worker
      @_worker.postMessage
        message: message
        command: command
    else
      @_backlog.push
        message: message
        command: command

  _connectWorkerListener: ->

    # Use constant indexes to get a nice speed boost
    ID_INDEX = 0
    POS_INDEX = 1
    ROT_INDEX = 2

    # Keep data storage objects here so we can re-use them later
    data = {}
    dataPacket = {}
    actor = {}

    @_worker.onmessage = (e) =>
      data = e.data

      # Array updates are batch render updates, manually apply to speed it up
      if data.length

        # This is faster than a generic for-loop
        l = data.length

        while l--
          dataPacket = data[l]

          actor = @_renderer._actor_hash[dataPacket[ID_INDEX]]
          actor._position = dataPacket[POS_INDEX]
          actor._rotation = dataPacket[ROT_INDEX]
          actor._updateModelMatrix()
