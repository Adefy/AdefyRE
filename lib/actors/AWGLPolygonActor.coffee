##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# @depend AWGLRawActor.coffee

# Polygon Actor implementation; allows for the creation of polygons with
# arbitrary side counts, and for manipulation by radius and segment count
class AWGLPolygonActor extends AWGLRawActor

  # Sets us up with the supplied radius and segment count, generating our
  # vertex sets.
  #
  # NOTE: Texture support is not available! No UVs! ;(
  #
  # @param [Number] radius
  # @param [Number] segments
  constructor: (@radius, @segments) ->
    param.required radius

    ##
    ## NOTE: Things are a bit funky now. The Android engine doesn't implement
    ##       our vert generation, so AJS handles that for us. That means it
    ##       passes the verts in as the first parameter above, rendering
    ##       the segment count undefined.
    ##
    ##       So we need to check if we've been passed an array as the first
    ##       param. If so, segments are unecessary; otherwise, we require the
    ##       segment count, and generate our own verts
    ##

    if @radius instanceof Array

      @_verts = @radius
      @radius = null
      uvs = @generateUVs @_verts

      super @_verts, uvs
      @setPhysicsVertices @_verts

    else
      param.required segments

      if radius <= 0 then throw new Error "Invalid radius: #{radius}"
      if segments <= 2 then throw new ERror "Invalid segment count: #{segments}"

      verts = @generateVertices()
      psyxVerts = @generateVertices mode: "physics"
      uvs = @generateUVs verts

      super verts, uvs
      @setPhysicsVertices psyxVerts

    @setRenderMode 2

  # @private
  # Private method that rebuilds our vertex array.
  #
  # @param [Object] options optional generation options
  # @options options [Boolean] mode generation mode (normal, or for physics)
  generateVertices: (options) ->
    options = param.optional options, {}

    # Build vertices
    # Uses algo from http://slabode.exofire.net/circle_draw.shtml
    x = @radius
    y = 0
    theta = (2.0 * 3.1415926) / @segments
    tanFactor = Math.tan theta
    radFactor = Math.cos theta

    verts = []

    for i in [0...@segments]
      verts[i * 2] = x
      verts[(i * 2) + 1] = y

      tx = -y
      ty = x

      x += tx * tanFactor
      y += ty * tanFactor

      x *= radFactor
      y *= radFactor

    # Cap the shape
    verts.push verts[0]
    verts.push verts[1]

    # Reverse winding!
    _tv = []
    for i in [0...verts.length] by 2
      _tv.push verts[verts.length - 2 - i]
      _tv.push verts[verts.length - 1 - i]

    verts = _tv

    # NOTE: We need to prepend ourselves with (0, 0) for rendering, but pass
    #       the original vert array as our physical representation!
    if options.mode != "physics"
      verts.push 0
      verts.push 0

    verts

  # Generate UV array from a vertex set, using our current radius
  #
  # @return [Array<Number>] uvs
  generateUVs: (vertices) ->
    param.required vertices

    uvs = []
    for v in vertices
      uvs.push ((v / @radius) / 2) + 0.5

    uvs

  # Preforms a full vert refresh (vertices, physics vertics, and UVs)
  # @private
  fullVertRefresh: ->
    verts = @generateVertices()
    psyxVerts = @generateVertices mode: "physics"
    uvs = @generateUVs verts

    @updateVertices verts, uvs
    @setPhysicsVertices psyxVerts

  # Get stored radius
  #
  # @return [Number] radius
  getRadius: -> @radius

  # Get stored segment count
  #
  # @return [Number] segments
  getSegments: -> @segments

  # Set radius, causes a full vert refresh
  #
  # @param [Number] radius
  setRadius: (@radius) ->
    if radius <= 0 then throw new Error "Invalid radius: #{radius}"
    @fullVertRefresh()

  # Set segment count, causes a full vert refresh
  #
  # @param [Number] segments
  setSegments: (@segments) ->
    if segments <= 2 then throw new ERror "Invalid segment count: #{segments}"
    @fullVertRefresh()
