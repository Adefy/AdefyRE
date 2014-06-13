###
# Note that shops cannot be accessed directly, they can only be messaged!
###
class CBazar extends KoonFlock
  constructor: -> super "Bazar"

class BazarShop extends Koon

  constructor: (name, deps, readyCB) ->
    super name

    async.map deps, (dependency, cb) ->
      return cb(null, dependency.raw) if dependency.raw

      $.ajax
        url: dependency.url
        mimeType: "text"
        success:  (rawDep) ->
          cb null, rawDep

    , (error, sources) =>
      @_initFromSources sources
      @_registerWithBazar()

      readyCB() if readyCB

  _initFromSources: (sources) ->
    return if @_worker

    data = new Blob [sources.join("\n\n")], type: "text/javascript"
    @_worker = new Worker (URL || (window.webkitURL)).createObjectURL data
    @_connectWorkerListener()
    @_worker.postMessage ""

  _connectWorkerListener: ->
    @_worker.onmessage = (e) =>
      if e.data instanceof Array
        for message in e.data
          @broadcast message.message, message.namespace
      else
        @broadcast e.data.message, e.data.namespace

  _registerWithBazar: ->
    window.Bazar.registerKoon @

  receiveMessage: (message, namespace) ->

    # TODO: Cache messages received when worker not initialised
    return unless @_worker

    @_worker.postMessage
      message: message
      namespace: namespace

# Setup the global bazar instance
window.Bazar = new CBazar() unless window.Bazar
