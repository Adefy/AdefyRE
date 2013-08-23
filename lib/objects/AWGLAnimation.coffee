# AWGLAnimation
#
# Class to handle animations
class AWGLAnimation

  _endPostion: null
  _updateFreq: 0

  #Constructor should never be called, AWGLAnimation only used as static
  constructor: -> throw new Error "AWGLAnimation constructor called"

  #Pass the Actor instance, two X, Y end coordinates and
  #the update frequency in frames
  #
  #@param [Actor] actor Actor instance to animate
  #@param [Number] endX X coordinated when animation finished
  #@param [Number] endY Y coordinated when animation finished
  #@param [Number] updateFreq update once every updateFreq frames

  animate: (actor, endX, endY, updateFreq) ->

    @_endPostion = new cp.v endX, endY
    @_updateFreq = updateFreq * (1.0/60.0) * 1000

    _updateCoord: ->
      if actor.getPosition == @_endPostion
        if @_intervalID != null
          clearInterval @_intervalID
          @_intervalID = null
      else
        actor.setPosition actor.getPosition + 1

    @_intervalID = setInterval _updateCoord(actor), @_updateFreq