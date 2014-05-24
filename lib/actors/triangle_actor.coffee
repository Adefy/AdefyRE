# @depend raw_actor.coffee

# Simple rectangle actor; allows for creation using a base and height, and
# manipulation of that base/height
class ARETriangleActor extends ARERawActor

  ###
  # Sets us up with the supplied base and height, generating both our vertex
  # and UV sets.
  #
  # @param [ARERenderer] renderer
  # @param [Number] base
  # @param [Number] height
  ###
  constructor: (renderer, @base, @height) ->
    param.required base
    param.required height

    if base <= 0 then throw new Error "Invalid base: #{base}"
    if height <= 0 then throw new Error "Invalid height: #{height}"

    verts = @generateVertices()
    uvs = @generateUVs()

    super renderer, verts, uvs

  ###
  # Generate array of vertices using our dimensions
  #
  # @return [Array<Number>] vertices
  ###
  generateVertices: ->
    hB = @base  / 2
    hH = @height / 2

    [
      -hB, -hH
        0,  hH
       hB, -hH
      -hB, -hH
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
      1, 1
    ]

  ###
  # Get stored base
  #
  # @return [Number] base
  ###
  getBase: -> @base

  ###
  # Get stored height
  #
  # @return [Number] height
  ###
  getHeight: -> @height

  ###
  # Set base, causes a vert refresh
  #
  # @param [Number] base
  ###
  setBase: (@base) -> @updateVertices @generateVertices()

  ###
  # Set height, causes a vert refresh
  #
  # @param [Number] height
  ###
  setHeight: (@height) -> @updateVertices @generateVertices()
