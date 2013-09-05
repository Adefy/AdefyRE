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
  constructor: (colOrR, g, b) ->
    colOrR = param.optional colOrR, 0
    g = param.optional g, 0
    b = param.optional b, 0

    if colOrR instanceof AWGLColor3
      @_r = colOrR.getR()
      @_g = colOrR.getG()
      @_b = colOrR.getB()
    else
      @setR colOrR
      @setG g
      @setB b

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
    c = Number(c)
    if c < 0 then c = 0
    if c > 255 then c = 255
    @_r = c

  # Set green component, takes a value between 0-255
  #
  # @param [Number] c
  setG: (c) ->
    c = Number(c)
    if c < 0 then c = 0
    if c > 255 then c = 255
    @_g = c

  # Set blue component, takes a value between 0-255
  #
  # @param [Number] c
  setB: (c) ->
    c = Number(c)
    if c < 0 then c = 0
    if c > 255 then c = 255
    @_b = c

  # Returns the value as a triple
  #
  # @return [String] triple in the form (r, g, b)
  toString: -> "(#{@_r}, #{@_g}, #{@_b})"
