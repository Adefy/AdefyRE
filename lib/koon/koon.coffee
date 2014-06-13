###
# Koon v0.0.1
###

class KoonNetworkMember

  constructor: (name) ->
    @_name = name or "GenericKoonNetworkMember"
    @_uuid = KoonNetworkMember.generateUUID()
    @_subscribers = []

  ###
  # Returns a valid receiver for the specified subscriber. Expects the
  # subscriber to have a receiveMessage method.
  #
  # @param [Object] subscriber
  # @return [Method] receiver
  # @private
  ###
  _generateReceiver: (subscriber) ->
    (message, namespace) =>
      subscriber.receiveMessage message, namespace

  ###
  # Register a new subscriber. 
  #
  # @param [Object] subscriber
  # @param [String] namespace
  # @return [Koon] self
  ###
  subscribe: (subscriber, namespace) ->
    @_subscribers.push
      namespace: namespace or ""
      receiver: @_generateReceiver subscriber

  ###
  # Broadcast message to the koon. Message is sent out to all subscribers and
  # other koons.
  #
  # @param [Object] message message object as passed directly to listeners
  # @param [String] namespace optional, defaults to the wildcard namespace *
  ###
  broadcast: (message, namespace) ->
    # return unless typeof message == "object"
    namespace = namespace or ""

    return if @hasSent message
    message = @tagAsSent message

    #for subscriber in @_subscribers
      # if !!namespace.match subscriber.namespace
      #subscriber.receiver message, namespace

    # This is faster than a normal for loop
    l = @_subscribers.length
    while l--
      @_subscribers[l].receiver message, namespace

  ###
  # Get our UUID
  #
  # @return [String] uuid
  ###
  getId: ->
    @_uuid

  ###
  # Get our name
  #
  # @return [String] name
  ###
  getName: ->
    @_name

  ###
  # Returns an RFC4122 v4 compliant UUID
  #
  # StackOverflow link: http://goo.gl/z2RxK
  #
  # @return [String] uuid
  ###
  @generateUUID: ->
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace /[xy]/g, (c) ->
      r = Math.random() * 16 | 0

      if c == "x"
        r.toString 16
      else
        (r & 0x3 | 0x8).toString 16

  tagAsSent: (message) ->
    unless message._senders
      message._senders = [@_name]
    else
      message._senders.push @_name

    message

  hasSent: (message) ->
    if message and message._senders
      for sender in message._senders
        return true if sender == @_name

    false


class Koon extends KoonNetworkMember

  constructor: (name) ->
    super(name or "GenericKoon")

  receiveMessage: (message, namespace) ->
    console.log "<#{message._sender}> --> <#{@getName()}>  [#{namespace}] #{JSON.stringify message}"

  broadcast: (message, namespace) ->
    return unless typeof message == "object"

    message._sender = @_name
    super message, namespace

class KoonFlock extends KoonNetworkMember

  constructor: (name) ->
    super(name or "GenericKoonFlock")

  registerKoon: (koon, namespace) ->
    @subscribe koon, namespace
    koon.subscribe @

  receiveMessage: (message, namespace) ->
    @broadcast message, namespace

  ###
  # Returns a valid receiver for the specified koon.
  #
  # @param [Object] koon
  # @return [Method] receiver
  # @private
  ###
  _generateReceiver: (koon) ->
    (message, namespace) ->
      unless koon.hasSent message
        koon.receiveMessage message, namespace
