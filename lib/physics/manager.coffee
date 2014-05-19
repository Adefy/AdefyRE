class PhysicsManager extends BazarShop

  constructor: (@_renderer, depPaths) ->
    param.required _renderer
    param.required depPaths

    super "PhysicsManager", [
      raw: "cp = exports = {};"
    ,
      url: depPaths.chipmunk
    ,
      url: depPaths.koon
    ,
      url: depPaths.physics_worker
    ]

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
      else
        @broadcast e.data.message, e.data.namespace
