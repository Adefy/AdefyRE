##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Top-level file, used by concat_in_order
#
# As part of the build process, grunt concats all of our coffee sources in a
# dependency-aware manner. Deps are described at the top of each file, with
# this essentially serving as the root node in the dep tree.
#
# @depend koon/koon.coffee
# @depend bazar/bazar.coffee
# @depend util/util_param.coffee
# @depend actors/rectangle_actor.coffee
# @depend actors/circle_actor.coffee
# @depend actors/polygon_actor.coffee
# @depend actors/triangle_actor.coffee
# @depend engine.coffee

ARE =
  config:
    deps:
      physics:
        chipmunk: "/components/chipmunk/cp.js"
        koon: "/lib/koon/koon.js"
        physics_worker: "/lib/physics/worker.js"

  Version:
    MAJOR: 1
    MINOR: 1
    PATCH: 2
    BUILD: null
    STRING: "1.1.2"

# Break out an interface. Use responsibly.
# All we need, is the awesome
window.AdefyGLI = window.AdefyRE = new AREInterface