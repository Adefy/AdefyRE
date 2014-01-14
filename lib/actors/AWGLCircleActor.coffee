##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# @depend AWGLPolygonActor.coffee

# Circle helper, wraps the polygon actor and creates one with 32 sides. Allows
# for vertex manipulation by radius
class AWGLCircleActor extends AWGLPolygonActor

  # Sets us up with the supplied radius and segment count, generating our
  # vertex sets.
  #
  # NOTE: Texture support is not available! No UVs! ;(
  #
  # @param [Number] radius
  constructor: (@radius) ->

    super radius, 32

    # Clear out segment control
    delete @setSegments
    delete @getSegments
