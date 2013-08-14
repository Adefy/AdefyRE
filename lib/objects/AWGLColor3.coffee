# Color class, holds r/g/b components
#
# Serves to provide a consistent structure for defining colors, and offers
# useful float to int (0.0-1.0 to 0-255) conversion functions
class AWGLColor3

  _r: 0
  _g: 0
  _b: 0

  # Sets component values and computes internal float/int values, uses
  # _getAsInt() internally
  #
  # @param [Number] r red component
  # @param [Number] g green component
  # @param [Number] b blue component
  constructor: (r, g, b) ->

    if r == undefined then r = 0
    if g == undefined then g = 0
    if b == undefined then b = 0

    @_r = @_getAsInt r
    @_g = @_getAsInt g
    @_b = @_getAsInt b

  # @private Returns c as a valid integer component in the range 0-255
  #
  # @param [Number] c component to translate
  # @return [Number] c component in range 0-255
  _getAsInt: (c) ->
    if c % 1 == 0 # Already int, ensure range
      if c > 255 then return 255
      if c < 0 then return 0
      return c
    else
      if c > 1.0 then return 255
      if c < 0.0 then return 0
      Math.floor c * 255 # Actual conversion

  # @private Returns c as a valid integer component in the range 0.0-1.0
  #
  # @param [Number] c component to translate
  # @return [Number] c component in range 0.0-1.0
  _getAsFloat: (c) ->
    if c % 1 != 0 # Already float, ensure range
      if c < 0.0 then return 0.0
      if c > 1.0 then return 1.0
      return c
    else
      if c > 255 then return 255
      if c < 0 then return 0
      return c / 255 # Actual conversion

  # Returns the red component as either an int or float
  #
  # @param [Boolean] float true if a float is requested
  # @return [Number] red
  getR: (asFloat) ->
    if float == undefined then return @_r
    return 255 / @_r

  # Returns the green component as either an int or float
  #
  # @param [Boolean] float true if a float is requested
  # @return [Number] green
  getG: (asFloat) ->
    if float == undefined then return @_g
    return 255 / @_g

  # Returns the blue component as either an int or float
  #
  # @param [Boolean] float true if a float is requested
  # @return [Number] blue
  getB: (asFloat) ->
    if float == undefined then return @_b
    return 255 / @_b

  # Set red component, takes a value between 0.0-1.0 or 0-255
  #
  # @param [Number] c
  setR: (c) ->
    @r = @_getAsInt c

  # Set green component, takes a value between 0.0-1.0 or 0-255
  #
  # @param [Number] c
  setG: (c) ->
    @g = @_getAsInt c

  # Set blue component, takes a value between 0.0-1.0 or 0-255
  #
  # @param [Number] c
  setB: (c) ->
    @b = @_getAsInt c

  # Returns the value as a triple
  #
  # @return [String] triple in the form (r, g, b)
  toString: -> "(#{@_r}, #{@_g}, #{@_b})"
