# Animation interface class
class AREAnimationInterface

  # A map of properties and their animations. Note that the editor uses this
  # same map to properly format animation exports!
  #
  # @private
  @_animationMap:

    # AREBezAnimation
    "position": AREBezAnimation
    "color": AREBezAnimation
    "rotation": AREBezAnimation

    # AREPsyxAnimation
    "mass": AREPsyxAnimation
    "friction": AREPsyxAnimation
    "elasticity": AREPsyxAnimation
    "physics": AREPsyxAnimation

    # AREVertAnimation
    "vertices": AREVertAnimation

  constructor: (masterInterface) ->

  # Set the target ARE instance
  setEngine: (engine) ->
    @_renderer = engine.getRenderer()

  # Check if we know how to directly animate the property provided
  #
  # @param [String] property property name, parent name if composite
  # @return [Boolean] canAnimate
  canAnimate: (property) ->
    !!AREAnimationInterface._animationMap[property]

  # Grab animation target for a property, if we support it. Null otherwise.
  #
  # @param [String] property property name, arent name if composite
  # @return [String] name
  getAnimationName: (property) ->
    if !AREAnimationInterface._animationMap[property]
      return false
    else
      switch AREAnimationInterface._animationMap[property]
        when AREBezAnimation then return "bezier"
        when AREPsyxAnimation then return "psyx"
        when AREVertAnimation then return "vert"
        else return false

  # Top-level animate method for ARE, creates specific animations internally
  # depending on the requirements of the input. Fails with null if the property
  # is not recognized.
  #
  # An optional 'start' parameter can be passed in on the 'options' object,
  # signifying when to initiate the animation. (< 0) means now, (> 0) after
  # 'start' ms, and 0 as default no auto start
  #
  # Options and property are passed in as JSON strings
  #
  # @param [Number] actorID id of actor to animate, as per AREActorInterface
  # @param [String] property property array, second element is component
  # @param [String] options options to pass to animation, varies by property
  animate: (actorID, property, options) ->
    property = JSON.parse param.required property
    options = JSON.parse param.required options
    options.start ||= 0

    actor = null

    for a in @_renderer.actors
      if a.getId() == actorID
        actor = a
        break

    if actor == null
      throw new Error "Actor not found, can't animate! #{actorId}"

    # Grab true property name
    name = property[0]

    if options.property == undefined then options.property = property

    # Build animation according to mapping
    _spawnAnim = (_n, _a, _o) ->
      if AREAnimationInterface._animationMap[_n] == AREBezAnimation
        new AREBezAnimation(_a, _o).animate()
      else if AREAnimationInterface._animationMap[_n] == AREPsyxAnimation
        new AREPsyxAnimation(_a, _o).animate()
      else if AREAnimationInterface._animationMap[_n] == AREVertAnimation
        new AREVertAnimation(_a, _o).animate()
      else ARELog.warn "Unrecognized property: #{_n}"

    if options.start > 0
      setTimeout (-> _spawnAnim name, actor, options), options.start
    else _spawnAnim name, actor, options

  # Return bezier output for a specific set of animation options. Requires
  # a startVal on the options object!
  #
  # Result contains a "values" key, and a "stepTime" key
  #
  # Note that both the options object and the returned object are JSON strings
  #
  # @param [String] options
  # @option options [Number] startVal
  # @option options [Number] endVal
  # @option options [Array<Object>] controlPoints
  # @option options [Number] duration
  # @option options [Number] fps framerate, defaults to 30
  # @return [String] bezValues
  preCalculateBez: (options) ->
    options = JSON.parse param.required options
    options.controlPoints ||= 0
    options.fps ||= 30

    ret = new AREBezAnimation(null, options, true).preCalculate()
    JSON.stringify ret
