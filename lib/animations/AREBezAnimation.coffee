##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# AREBezAnimation
#
# Class to handle bezier animations
# It can animate the Color, Rotation and Position properties,
# each component only individually for the composite properties!
class AREBezAnimation

  ###
  # For all animateable properties the options param passes in the end value,
  # an array of [time, value] control points, the duration of the animation
  # and the property to be affected by these options.
  #
  # Properties are named by keys (rotation, position, color), with composite
  # values supplied as an array of the property name, and the composite name.
  #
  # i.e. ["position", "x"]
  # @param [ARERawActor] actor represents the actor we animate
  # @param [Object] options represents the options used to animate
  # @option options [Number] endVal
  # @option options [Array<Object>] controlPoints
  # @option options [Number] duration
  # @option options [String, Array] property
  # @option options [Number] fps framerate, defaults to 30
  # @option options [Method] cbStart callback to call before animating
  # @option options [Method] cbEnd callback to call after animating
  # @option options [Method] cbStep callback to call after each update
  # @param [Boolean] dryRun sets up for preCalculate only! Actor optional.
  ###
  constructor: (@actor, options, dryRun) ->
    dryRun = param.optional dryRun, false
    @options = param.required options
    @_duration = param.required options.duration
    param.required options.endVal
    @_property = param.required options.property
    options.controlPoints = param.optional options.controlPoints, []
    @_fps = param.optional options.fps, 30

    if dryRun
      param.optional @actor
      param.required options.startVal
    else param.required @actor

    # Guards against multiple exeuctions
    @_animated = false

    # In bezOpt we will keep all the info we need for the Bezier function
    # which means degree, starting value, final value and the position of
    # the control points provided
    @bezOpt = {}

    if options.controlPoints.length > 0
      @bezOpt.degree = options.controlPoints.length
      if @bezOpt.degree > 0
        param.required options.controlPoints[0].x
        param.required options.controlPoints[0].y
        if @bezOpt.degree == 2
          param.required options.controlPoints[1].x
          param.required options.controlPoints[1].y
      @bezOpt.ctrl = options.controlPoints
    else @bezOpt.degree = 0

    @bezOpt.endPos = param.required options.endVal
    @tIncr = 1 / (@_duration * (@_fps / 1000))

    if dryRun then @bezOpt.startPos = options.startVal
    else

      # Getting our starting value based on our animated property
      if @_property == "rotation"
        @bezOpt.startPos = @actor.getRotation()

      if @_property[0] == "position"
        if @_property[1] == "x"
          @bezOpt.startPos = @actor.getPosition().x
        else if @_property[1] == "y"
          @bezOpt.startPos = @actor.getPosition().y

      if @_property[0] == "color"
        if @_property[1] == "r"
          @bezOpt.startPos = @actor.getColor().getR()
        else if @_property[1] == "g"
          @bezOpt.startPos = @actor.getColor().getG()
        else if @_property[1] == "b"
          @bezOpt.startPos = @actor.getColor().getB()

  ###
  # Updates the animation for a certain value t, between 0 and 1
  #
  # @param [Number] t animation state, 0.0-1.0
  # @param [Boolean] apply applies the updated value, defaults to true
  #
  # @return [Number] val new value
  # @private
  ###
  _update: (t, apply) ->
    param.required t
    apply = param.optional apply, true

    # Throw an error if t is out of bounds. We could just cap it, but it should
    # never be provided out of bounds. If it is, something is wrong with the
    # code calling us
    if t > 1 or t < 0 then throw new Error "t out of bounds! #{t}"

    # 0th degree, linear interpolation
    if @bezOpt.degree == 0
      val = @bezOpt.startPos + ((@bezOpt.endPos - @bezOpt.startPos) * t)

    # 1st degree, quadratic
    else if @bezOpt.degree == 1

      # Speed things up by pre-calculating some elements
      _Mt = 1 - t
      _Mt2 = _Mt * _Mt
      _t2 = t * t

      # [x, y] = [(1 - t)^2]P0 + 2(1 - t)tP1 + (t^2)P2
      val = (_Mt2 * @bezOpt.startPos) + \
            (2 * _Mt * t * @bezOpt.ctrl[0].y) \
            + _t2 * @bezOpt.endPos

    # 2nd degree, cubic
    else if @bezOpt.degree == 2

      # As above, minimal optimization
      _Mt = 1 - t
      _Mt2 = _Mt * _Mt
      _Mt3 = _Mt2 * _Mt
      _t2 = t * t
      _t3 = _t2 * t

      # [x, y] = [(1 - t)^3]P0 + 3[(1 - t)^2]P1 + 3(1 - t)(t^2)P2 + (t^3)P3
      val = (_Mt3 * @bezOpt.startPos) + (3 * _Mt2 * t * @bezOpt.ctrl[0].y) \
           + (3 * _Mt * _t2 * @bezOpt.ctrl[1].y) + (_t3 * @bezOpt.endPos)

    else
      throw new Error "Invalid degree, can't evaluate (#{@bezOpt.degree})"

    # Applying the calculated value for the chosen property, and call cbStep if
    # provided
    if apply
      @_applyValue val
      if @options.cbStep != undefined then @options.cbStep val

    val

  ###
  # Calculate value for each step, return an object with "values" and
  # "stepTime" keys
  #
  # @return [Object] bezValues
  ###
  preCalculate: ->
    t = 0
    bezValues = { stepTime: @_duration * @tIncr }
    bezValues.values = []

    while t <= 1.0
      t += @tIncr

      # Round last t
      if t > 1 and t < (1 + @tIncr) then t = 1 else if t > 1 then break

      bezValues.values.push @_update t, false

    bezValues

  ###
  # Apply value to our actor
  #
  # @param [Number] val
  # @private
  ###
  _applyValue: (val) ->
    if @_property == "rotation" then @actor.setRotation val

    if @_property[0] == "position"
      if @_property[1] == "x"
        pos = new cp.v val, @actor.getPosition().y
        @actor.setPosition pos
      else if @_property[1] == "y"
        pos = new cp.v @actor.getPosition().x, val
        @actor.setPosition pos

    if @_property[0] == "color"
      if @_property[1] == "r"
        _r = val
        _g = @actor.getColor().getG()
        _b = @actor.getColor().getB()
        @actor.setColor _r, _g, _b
      else if @_property[1] == "g"
        _r = @actor.getColor().getR()
        _g = val
        _b = @actor.getColor().getB()
        @actor.setColor _r, _g, _b
      else if @_property[1] == "b"
        _r = @actor.getColor().getR()
        _g = @actor.getColor().getG()
        _b = val
        @actor.setColor _r, _g, _b

  ###
  # Called after construction of the animation object
  # to actually begin the animation
  ###
  animate: ->
    if @_animated then return else @_animated = true
    if @options.cbStart != undefined then @options.cbStart()

    t = -@tIncr

    @_intervalID = setInterval =>
      t += @tIncr

      if t > 1
        clearInterval @_intervalID
        if @options.cbEnd != undefined then @options.cbEnd()
      else
        @_update t
        if @options.cbStep != undefined then @options.cbStep()

    , 1000 / @_fps
