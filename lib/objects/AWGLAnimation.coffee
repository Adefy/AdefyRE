# AWGLAnimation
#
# Class to handle animations
class AWGLAnimation

  _endPostion: null
  _updateFreq: 0

  # Constructor should never be called, AWGLAnimation only used as static
  constructor: -> throw new Error "AWGLAnimation constructor called"

  # Pass the Actor instance, two X, Y end coordinates and
  # the update frequency in frames and the mode
  #
  # @param [Actor] actor Actor instance to animate
  # @param [Number] endX X coordinated when animation finished
  # @param [Number] endY Y coordinated when animation finished
  # @param [Number] updateFreq update once every updateFreq frames
  # @param [String] mode string for predefined animation pattern
  animate: (actor, endX, endY, updateFreq, mode) ->
    actor = param.required actor
    endX = param.required endX
    endY = param.required endY
    updateFreq = param.required updateFreq
    mode = param.required mode

    @_endPostion = new cp.v endX, endY
    @_updateFreq = updateFreq * (1.0/60.0) * 1000

    # Check if we need to add or substract when we move the actor
    if actor.getPosition().x > endX then _moveX = -1
    else  _moveX = 1

    if actor.getPosition().y > endY then _moveY = -1
    else  _moveY = 1

    # Diagonal movement means we refresh X and Y at the same time
    _diagonal: ->
      actor.setPosition x, actor.getPosition().x + _moveX
      actor.setPosition y, actor.getPosition().y + _moveY

    # Horizontal movement means we refresh X until end point then Y
    _horizontal: ->
      if actor.getPosition().x != endX
        actor.setPosition x, actor.getPosition().x + _moveX
      else
        actor.setPosition y, actor.getPosition().y + _moveY

    # Vertical movement means we refresh Y until end point then X
    _vertical: ->
      if actor.getPosition().y != endY
        actor.setPosition y, actor.getPosition().y + _moveY
      else
        actor.setPosition x, actor.getPosition().x + _moveX

    _updateCoord: ->
      if actor.getPosition == @_endPostion
        if @_intervalID != null
          clearInterval @_intervalID
          @_intervalID = null
      else
        if mode == "diagonal" then _diagonal()
        if mode == "horizontal" then _horizontal()
        if mode == "vertical" then _vertical()

    @_intervalID = setInterval _updateCoord(actor), @_updateFreq
