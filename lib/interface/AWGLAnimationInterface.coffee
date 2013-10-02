##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Animation interface class
class AWGLAnimationInterface

  # A map of properties and their animations. Note that the editor uses this
  # same map to properly format animation exports!
  #
  # @private
  @_animationMap:

    # AWGLBezAnimation
    "position": AWGLBezAnimation
    "color": AWGLBezAnimation
    "rotation": AWGLBezAnimation

    # AWGLPsyxAnimation
    "mass": AWGLPsyxAnimation
    "friction": AWGLPsyxAnimation
    "elasticity": AWGLPsyxAnimation
    "physics": AWGLPsyxAnimation

    # AWGLVertAnimation
    "vertices": AWGLVertAnimation

  # Top-level animate method for AWGL, creates specific animations internally
  # depending on the requirements of the input. Fails with null if the property
  # is not recognized.
  #
  # @param [Number] actorID id of actor to animate, as per AWGLActorInterface
  # @param [Array, String] property property, possibly composite (array)
  # @param [Object] options options to pass to animation, varies by property
  #
  # @return [Object] animation created animation
  animate: (actorID, property, options) ->
    param.required actorID
    param.required property
    param.required options

    actor = null

    for a in AWGLRenderer.actors
      if a.getId() == actorID
        actor = a
        break

    if actor == null
      throw new Error "Actor not found, can't animate! #{actorId}"

    # Grab true property name
    if property instanceof Array then name = property[0] else name = property

    if options.property == undefined then options.property = property

    # Build animation according to mapping
    if AWGLAnimationInterface._animationMap[name] == AWGLBezAnimation
      anim = new AWGLBezAnimation actor, options
    else if AWGLAnimationInterface._animationMap[name] == AWGLPsyxAnimation
      anim = new AWGLPsyxAnimation actor, options
    else if AWGLAnimationInterface._animationMap[name] == AWGLVertAnimation
      anim = new AWGLVertAnimation actor, option
    else
      AWGLLog.warn "Unrecognized property: #{name}"
      anim = null

    anim