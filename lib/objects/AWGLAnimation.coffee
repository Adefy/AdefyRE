# AWGLAnimation
#
# Class to handle animations
class AWGLAnimation

  constructor: (@actor, startPos, endPos, degree, ctrlPoints, duration) ->
    param.required @actor

    @bezOpt = {}
    @bezOpt.startPos = param.required startPos
    @bezOpt.endPos = param.required endPos
    @bezOpt.degree = param.required degree, [0, 1, 2]
    param.required duration

    if degree > 0
      param.required ctrlPoints

      if degree == 1
        param.required ctrlPoints[0].x
        param.required ctrlPoints[0].y

      if degree == 2
        param.required ctrlPoints[1].x
        param.required ctrlPoints[1].y

    # calculate how much to increment t based on duration
    # this could be me misunderstanding something-> to be checked
    @incr = 1/(duration * 1000/16.667)

    @temp = 0
    @_intervalID = null

    @bezOpt.ctrl = ctrlPoints

  update: (t) ->
    param.required t

    if @temp + @incr <= 1.0
      @temp += @incr
    else
      t = 1
      clearInterval @_intervalID

    # If buffering is enabled, buffer!
    # if @_buffer
    #  if @_bufferData[String(t)] != undefined
    #    return @_bufferData[String(t)]

    # Throw an error if t is out of bounds. We could just cap it, but it should
    # never be provided out of bounds. If it is, something is wrong with the
    # code calling us
    if t > 1 or t < 0
      clearInterval @_intervalID
      throw new Error "t out of bounds! #{t}"

    # 0th degree, linear interpolation
    if @bezOpt.degree == 0

      val =
        x: @bezOpt.startPos.x + ((@bezOpt.endPos.x \
          - @bezOpt.startPos.x) * t)
        y: @bezOpt.startPos.y + ((@bezOpt.endPos.y \
          - @bezOpt.startPos.y) * t)

      # Buffer if requested
      #if @_buffer then @_bufferData[String(t)] = val

    # 1st degree, quadratic
    else if @bezOpt.degree == 1

      # Speed things up by pre-calculating some elements
      _Mt = 1 - t
      _Mt2 = _Mt * _Mt
      _t2 = t * t

      # [x, y] = [(1 - t)^2]P0 + 2(1 - t)tP1 + (t^2)P2
      val =
        x: (_Mt2 * @bezOpt.startPos.x) + \
        (2 * _Mt * t * @bezOpt.ctrl[0].x) \
        + _t2 * @bezOpt.endPos.x
        y: (_Mt2 * @bezOpt.startPos.y) + \
        (2 * _Mt * t * @bezOpt.ctrl[0].y) \
        + _t2 * @bezOpt.endPos.y

      # Buffer if requested
      # if @_buffer then @_bufferData[String(t)] = val

    # 2nd degree, cubic
    else if @bezOpt.degree == 2

      # As above, minimal optimization
      _Mt = 1 - t
      _Mt2 = _Mt * _Mt
      _Mt3 = _Mt2 * _Mt
      _t2 = t * t
      _t3 = _t2 * t

      # [x, y] = [(1 - t)^3]P0 + 3[(1 - t)^2]P1 + 3(1 - t)(t^2)P2 + (t^3)P3
      val =
        x: (_Mt3 * @bezOpt.startPos.x) + (3 * _Mt2 * t * @bezOpt.ctrl[0].x) \
           + (3 * _Mt * _t2 + @bezOpt.ctrl[1].x) + (_t3 * @bezOpt.endPos.x)
        y: (_Mt3 * @bezOpt.startPos.y) + (3 * _Mt2 * t * @bezOpt.ctrl[0].y) \
           + (3 * _Mt * _t2 + @bezOpt.ctrl[1].y) + (_t3 * @bezOpt.endPos.y)

      # Buffer if requested
      # if @_buffer then @_bufferData[String(t)] = val

    else
      clearInterval @_intervalID
      throw new Error "Invalid degree, can't evaluate (#{@bezOpt.degree})"

    @actor.setPosition val

  animate: ->
    me = @

    @_intervalID = setInterval ->
      me.update me.temp
    , 16.667
