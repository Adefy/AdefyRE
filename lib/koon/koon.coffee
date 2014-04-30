###
# Koon v0.0.1
###

class KoonNetworkMember

  constructor: (name) ->
    @_name = name or "GenericKoonNetworkMember"
    @_uuid = KoonNetworkMember.generateUUID()

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

      if c == x
        r.toString 16
      else
        (r & 0x3 | 0x8).toString 16

class Koon extends KoonNetworkMember

  constructor: (name) ->
    super(name or "GenericKoon")

    @_subscribers = []
    @_koons = []

  ###
  # Register a new subscriber. Expects the subscriber to have a receiveMessage
  # method.
  #
  # @param [Object] subscriber
  # @param [Regexp] regex
  # @return [Koon] self
  ###
  subscribe: (subscriber, regex) ->
    @_subscribers.push
      regex: regex
      receiver: (message, namespace) ->
        subscriber.receiveMessage message, namespace

  ###
  # Broadcast message to the koon. Message is sent out to all subscribers and
  # other koons.
  #
  # @param [Object] message message object as passed directly to listeners
  # @param [String] namespace optional, defaults to the wildcard namespace *
  ###
  broadcast: (message, namespace) ->
    namespace = "*" unless namespace

    for subscriber in @_subscribers
      if !!subscriber.regex.match namespace
        subscriber.receiver message, namespace

###
#
###
class KoonFlock extends KoonNetworkMember

  constructor: (name) ->
    super(name or "GenericKoonFlock")

    @_koons = []

  registerKoon: (koon) ->
