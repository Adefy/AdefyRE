##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Top-level file, used by concat_in_order
#
# As part of the build process, grunt concats all of our coffee sources in a
# dependency-aware manner. Deps are described at the top of each file, with
# this essentially serving as the root node in the dep tree.
#
# @depend util/util_param.coffee
# @depend actors/rectangle_actor.coffee
# @depend actors/circle_actor.coffee
# @depend actors/polygon_actor.coffee
# @depend engine.coffee

AREVersion =
  MAJOR: 1
  MINOR: 0
  PATCH: 10
  BUILD: null
  STRING: "1.0.10"
