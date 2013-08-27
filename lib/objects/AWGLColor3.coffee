# Color class, holds r/g/b components
#
# Serves to provide a consistent structure for defining colors, and offers
# useful float to int (0.0-1.0 to 0-255) conversion functions
class AWGLColor3

  # Sets component values
  #
  # @param [Number] r red component
  # @param [Number] g green component
  # @param [Number] b blue component
  constructor: (r, g, b) ->

    # @todo Check to see if this is necessary
    if r == undefined then r = 0
    if g == undefined then g = 0
    if b == undefined then b = 0

    @_r = r
    @_g = g
    @_b = b

  # Returns the red component as either an int or float
  #
  # @param [Boolean] float true if a float is requested
  # @return [Number] red
  getR: (asFloat) ->
    if asFloat != true then return @_r
    @_r / 255

  # Returns the green component as either an int or float
  #
  # @param [Boolean] float true if a float is requested
  # @return [Number] green
  getG: (asFloat) ->
    if asFloat != true then return @_g
    @_g / 255

  # Returns the blue component as either an int or float
  #
  # @param [Boolean] float true if a float is requested
  # @return [Number] blue
  getB: (asFloat) ->
    if asFloat != true then return @_b
    @_b / 255

  # Set red component, takes a value between 0-255
  #
  # @param [Number] c
  setR: (c) ->
    if c < 0 then c = 0
    if c > 255 then c = 255
    @_r = c

  # Set green component, takes a value between 0-255
  #
  # @param [Number] c
  setG: (c) ->
    if c < 0 then c = 0
    if c > 255 then c = 255
    @_g = c

  # Set blue component, takes a value between 0-255
  #
  # @param [Number] c
  setB: (c) ->
    if c < 0 then c = 0
    if c > 255 then c = 255
    @_b = c

  # Returns the value as a triple
  #
  # @return [String] triple in the form (r, g, b)
  toString: -> "(#{@_r}, #{@_g}, #{@_b})"
