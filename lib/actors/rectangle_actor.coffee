##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# @depend raw_actor.coffee

# Simple rectangle actor; allows for creation using a width and height, and
# manipulation of that width/height
class ARERectangleActor extends ARERawActor

  ###
  # Sets us up with the supplied width and height, generating both our vertex
  # and UV sets.
  #
  # @param [Number] width
  # @param [Number] height
  ###
  constructor: (@width, @height) ->
    param.required width
    param.required height

    if width <= 0 then throw new Error "Invalid width: #{width}"
    if height <= 0 then throw new Error "Invalid height: #{height}"

    verts = @generateVertices()
    uvs = @generateUVs()

    super verts, uvs

  ###
  # Generate array of vertices using our dimensions
  #
  # @return [Array<Number>] vertices
  ###
  generateVertices: ->
    hW = @width  / 2
    hH = @height / 2

    [
      -hW, -hH
      -hW,  hH
       hW,  hH
       hW, -hH
      -hW, -hH
    ]

  ###
  # Generate array of UV coordinates
  #
  # @return [Array<Number>] uvs
  ###
  generateUVs: ->
    [
      0, 1,
      0, 0,
      1, 0,
      1, 1,
      0, 1
    ]

  ###
  # Get stored width
  #
  # @return [Number] width
  ###
  getWidth: -> @width

  ###
  # Get stored height
  #
  # @return [Number] height
  ###
  getHeight: -> @height

  ###
  # Set width, causes a vert refresh
  #
  # @param [Number] width
  ###
  setWidth: (@width) -> @updateVertBuffer @generateVertices()

  ###
  # Set height, causes a vert refresh
  #
  # @param [Number] height
  ###
  setHeight: (@height) -> @updateVertBuffer @generateVertices()
