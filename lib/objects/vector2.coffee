class AREVector2

  constructor: (x, y) ->
    @x ||= 0
    @y ||= 0

  ###
  # @param [Boolean] bipolar should randomization occur in all directions?
  # @return [AREVector2] randomizedVector
  ###
  random: (options) ->
    options ||= {}
    bipolar = !!options.bipolar
    seed = options.seed or Math.random() * 0xFFFF

    x = Math.random() * @x
    y = Math.random() * @y

    if bipolar
      x = -x if Math.random() < 0.5
      y = -y if Math.random() < 0.5

    new AREVector2 x, y

  ###
  # @param [AREVector2]
  # @return [AREVector2]
  ###
  add: (other) -> new AREVector2 @x + other.x, @y + other.y

  ###
  # @param [AREVector2]
  # @return [AREVector2]
  ###
  sub: (other) -> new AREVector2 @x - other.x, @y - other.y

  ###
  # @param [AREVector2]
  # @return [AREVector2]
  ###
  mul: (other) -> new AREVector2 @x * other.x, @y * other.y

  ###
  # @param [AREVector2]
  # @return [AREVector2]
  ###
  div: (other) -> new AREVector2 @x / other.x, @y / other.y

  ###
  # @return [AREVector2]
  ###
  floor: -> new AREVector2 Math.floor(@x), Math.floor(@y)

  ###
  # @return [AREVector2]
  ###
  ceil: -> new AREVector2 Math.ceil(@x), Math.ceil(@y)

  ###
  # @return [AREVector2]
  ###
  @zero: -> new AREVector2 0, 0
