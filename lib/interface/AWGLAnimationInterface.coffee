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
  # An optional 'start' parameter can be passed in on the 'options' object,
  # signifying when to initiate the animation. (< 0) means now, (> 0) after
  # 'start' ms, and 0 as default no auto start
  #
  # @param [Number] actorID id of actor to animate, as per AWGLActorInterface
  # @param [Array, String] property property, possibly composite (array)
  # @param [Object] options options to pass to animation, varies by property
  animate: (actorID, property, options) ->
    param.required actorID
    param.required property
    param.required options
    options.start = param.optional options.start, 0

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
    _spawnAnim = (_n, _a, _o) ->
      if AWGLAnimationInterface._animationMap[_n] == AWGLBezAnimation
        new AWGLBezAnimation(_a, _o).animate()
      else if AWGLAnimationInterface._animationMap[_n] == AWGLPsyxAnimation
        new AWGLPsyxAnimation(_a, _o).animate()
      else if AWGLAnimationInterface._animationMap[_n] == AWGLVertAnimation
        new AWGLVertAnimation(_a, _o).animate()
      else AWGLLog.warn "Unrecognized property: #{_n}"

    if options.start > 0
      setTimeout (-> _spawnAnim name, actor, options), options.start
    else _spawnAnim name, actor, options