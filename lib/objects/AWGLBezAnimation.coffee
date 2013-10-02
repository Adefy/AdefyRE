##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# AWGLBezAnimation
#
# Class to handle bezier animations
# It can animate the Color, Rotation and Position properties,
# each component only individually for the composite properties!
class AWGLBezAnimation

  # For all animateable properties the options param passes in the end value,
  # an array of [time, value] control points, the duration of the animation
  # and the property to be affected by these options.
  #
  # Properties are named by keys (rotation, position, color), with composite
  # values supplied as an array of the property name, and the composite name.
  #
  # i.e. ["position", "x"]
  # @param [AWGLActor] actor represents the actor we animate
  # @param [Object] options represents the options used to animate
  # @option options [Object] endVal
  # @option options [Array<Object>] controlPoints
  # @option options [Number] duration
  # @option options [String, Array] property
  # @option options [Number] start optional, negative means start immediately
  # @option options [Number] fps framerate, defaults to 30
  constructor: (@actor, options) ->
    param.required @actor
    param.required options
    param.required options.duration
    param.required options.property
    param.required options.controlPoints
    param.required options.endVal
    @_fps = param.optional options.fps, 30
    options.start = param.optional options.start, 0

    # In bezOpt we will keep all the info we need for the Bezier function
    # which means degree, starting value, final value and the position of
    # the control points provided
    @bezOpt = {}

    if options.controlPoints.length > 0
      @bezOpt.degree = options.controlPoints.length
      if @bezOpt.degree > 0
        param.required options.controlPoints[0].x
        param.required options.controlPoints[0].y
        if degree == 2
          param.required options.controlPoints[1].x
          param.required options.controlPoints[1].y
      @bezOpt.ctrl = options.controlPoints
    else @bezOpt.degree = 0

    @bezOpt.property = param.required options.property

    # Getting our starting value based on our animated property
    if @bezOpt.property == "rotation"
      @bezOpt.startPos = @actor.getRotation()

    if @bezOpt.property[0] == "position"
      if @bezOpt.property[1] == "x"
        @bezOpt.startPos = @actor.getPosition().x
      else if @bezOpt.property[1] == "y"
        @bezOpt.startPos = @actor.getPosition().y

    if @bezOpt.property[0] == "color"
      if @bezOpt.property[1] == "r"
        @bezOpt.startPos = @actor.getColor().getR()
      else if @bezOpt.property[1] == "g"
        @bezOpt.startPos = @actor.getColor().getG()
      else if @bezOpt.property[1] == "b"
        @bezOpt.startPos = @actor.getColor().getB()

    @bezOpt.endPos = param.required options.endVal
    # How much we increment t by in our calls based on duration
    @incr = 1/(options.duration * 1000/16.667)

    @temp = 0
    @_intervalID = null

    # Start animation now, or schedule start in the future if desired
    if options.start < 0 then @animate()
    else if options.start > 0 then setTimeout (=> @animate()), options.start

  # Updates the animation for a certain value t, between 0 and 1
  #
  # @param [Number] t animation state, 0.0-1.0
  # @private
  _update: (t) ->
    param.required t

    # If our next step goes higher than 1.0, we set t to last step
    if @temp + @incr <= 1.0 then @temp += @incr
    else
      t = 1
      clearInterval @_intervalID

    # Throw an error if t is out of bounds. We could just cap it, but it should
    # never be provided out of bounds. If it is, something is wrong with the
    # code calling us
    if t > 1 or t < 0
      clearInterval @_intervalID
      throw new Error "t out of bounds! #{t}"

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
      clearInterval @_intervalID
      throw new Error "Invalid degree, can't evaluate (#{@bezOpt.degree})"

    # Applying the calculated value for the chosen property
    if @bezOpt.property == "rotation" then @actor.setRotation val

    if @bezOpt.property[0] == "position"
      if @bezOpt.property[1] == "x"
        pos = new cp.v val, @actor.getPosition().y
        @actor.setPosition pos
      else if @bezOpt.property[1] == "y"
        pos = new cp.v @actor.getPosition().x, val
        @actor.setPosition pos

    if @bezOpt.property[0] == "color"
      if @bezOpt.property[1] == "r"
        _r = val
        _g = @actor.getColor().getG()
        _b = @actor.getColor().getB()
        @actor.setColor _r, _g, _b
      else if @bezOpt.property[1] == "g"
        _r = @actor.getColor().getR()
        _g = val
        _b = @actor.getColor().getB()
        @actor.setColor _r, _g, _b
      else if @bezOpt.property[1] == "b"
        _r = @actor.getColor().getR()
        _g = @actor.getColor().getG()
        _b = val
        @actor.setColor _r, _g, _b

  # Called after construction of the animation object
  # to actually begin the animation
  animate: -> @_intervalID = setInterval (=> @_update @temp), 1 / @_fps
