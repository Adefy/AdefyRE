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

  # Check if we know how to directly animate the property provided
  #
  # @param [String] property property name, parent name if composite
  # @return [Boolean] canAnimate
  canAnimate: (property) ->

    if property instanceof Array then property = property[0]

    if AWGLAnimationInterface._animationMap[property] == undefined
      return false
    true

  # Grab animation target for a property, if we support it. Null otherwise.
  #
  # @param [String] property property name, arent name if composite
  # @return [String] name
  getAnimationName: (property) ->
    if AWGLAnimationInterface._animationMap[property] == undefined
      return false
    else
      type = AWGLAnimationInterface._animationMap[property]

      if type == AWGLBezAnimation then return "bezier"
      else if type == AWGLPsyxAnimation then return "psyx"
      else if type == AWGLVertAnimation then return "vert"

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

  # Return bezier output for a specific set of animation options. Requires
  # a startVal on the options object!
  #
  # Result contains a "values" key, and a "stepTime" key
  #
  # @param [Object] options
  # @option options [Number] startVal
  # @option options [Number] endVal
  # @option options [Array<Object>] controlPoints
  # @option options [Number] duration
  # @option options [Number] fps framerate, defaults to 30
  # @return [Object] bezValues
  preCalculateBez: (options) ->
    param.required options.startVal
    param.required options.endVal
    param.required options.duration
    options.controlPoints = param.required options.controlPoints, []
    options.fps = param.required options.fps, 30

    new AWGLBezAnimation(null, options, true).preCalculate()