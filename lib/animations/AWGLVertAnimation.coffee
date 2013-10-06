##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# AWGLVertAnimation
#
# Class to handle actor vertices updates
class AWGLVertAnimation

  # Class to animate vertices using vertex delta sets. The delta sets describe
  # the change in vertice structure at a specific point in time.
  #
  # Note that vertex sets are stored flat, and deltas are interpreted the same
  # way. So deltas take the form of [deltaX1, deltaY1, deltaX2, deltaY2, ....]
  #
  # Vertices need to be passed in as deltas. Any vertices not currently present
  # in the actor (new vertices, index > actor.vertices.length) will be pushed
  # directly. If the new vertice set is smaller than that of the actor, the
  # difference will be dropped unless the ending vertice has a value of "|"
  #
  # Vertices with a value of "." will be left unchanged. Absolute values will
  # be set directly, whereas numbers prefixed with "-" or "+" will be offset
  # accordingly.
  #
  # Repeating series may also be passed in, signaling repetition with "...",
  # and ending delta parsing. As such, no unique deltas may exist after an
  # occurence of "..." is encountered! Repeating series also support partial
  # application (existing vert set length does not have to be divisible by
  # the repeat step)
  #
  # @example Example vertex set specifications
  #   ["+5", "-3", 3.53, 5, ".", "."]
  #   applied to
  #   [20, 42, 23, 67, 34, 75, 96, 32, 76, 23]
  #   yields
  #   [25, 39, 3.53, 5, 34, 75]
  #
  #   ["2", "|"]
  #   applied to
  #   [1, 1, 1, 1, 1, 1]
  #   yields
  #   [2, 1, 1, 1, 1, 1]
  #
  #   ["+1", ".", "..."]
  #   applies to
  #   [4, 4, 4, 4, 4, 4, 4, 4, 4]
  #   yields
  #   [5, 4, 5, 4, 5, 4, 5, 4, 5]
  #
  #   Values passed in as numbers (not strings) will be interpreted as absolute
  #   changes. If you need to set a negative value, use a number, not a string!
  #
  # @param [AWGLActor] actor the actor we apply the modifications to
  # @param [Object] options the options we apply
  # @option options [Number, Array<Number>] delays
  # @option options [Array, Array<Array>] deltas
  # @option options [Array<Number>] udata objects passed into step callback
  # @option options [Method] cbStart callback to call before animating
  # @option options [Method] cbStep callback to call on each delta application
  # @option options [Method] cbEnd callback to call after animating
  constructor: (@actor, @options) ->
    param.required @actor
    param.required @options
    param.required @options.delays
    param.required @options.deltas

    if @options.delays.length != @options.deltas.length
      AWGLLog.warn "Vert animation delay count != delta set count! Bailing."
      @_animated = true
      return

    # Guards against multiple exeuctions
    @_animated = false

  # Set the timeout for our _applyDeltas() method
  #
  # @param [Object] deltaSet set of deltas to apply to the actor
  # @param [Number] delay the delay in miliseconds to make the update
  # @param [Object] udata optional userdata to send to callback
  # @param [Boolean] last signals this is the last timeout
  # @private
  _setTimeout: (deltaSet, delay, udata, last) ->
    param.required deltaSet
    param.required delay
    udata = param.optional udata, null

    setTimeout (=>
      @_applyDeltas deltaSet, udata
      if last then if @options.cbEnd != undefined then @options.cbEnd()
    ), delay

  # Applies the delta set to the actor
  #
  # @param [Array<String, Number>] deltaSet
  # @param [Object] udata optional userdata to send to callback
  _applyDeltas: (deltaSet, udata) ->
    param.required deltaSet
    if @options.cbStep != undefined then @options.cbStep udata

    finalVerts = @actor.getVertices()

    # Check for repeat
    if deltaSet.join("_").indexOf("...") != -1
      repeat = true
    else repeat = false

    # Apply deltas.
    #
    #   "`N"  - Absolute update
    #   "-N"  - Negative change
    #   "+N"  - Positive change
    #   "."   - No change
    #   "|"   - Finished, break
    #   "..." - Repeat preceeding
    for i in [0...deltaSet.length]
      d = deltaSet[i]

      if i >= finalVerts.length

        # Break if repeating and we have surpassed the last vert
        if repeat then break

        val = undefined
      else val = finalVerts[i]

      if typeof d == "number" then val = d
      else if typeof d == "string"
        if val == undefined
          AWGLLog.warn "Vertex does not exist, yet delta is relative!"
          return

        if d.charAt(0) == "|" then break
        else if d.charAt(0) == "-" then val -= Number(d.slice(1))
        else if d.charAt(0) == "+" then val += Number(d.slice(1))
        else if d == "..." then i = 0
        else if d.charAt(0) != "."
          AWGLLog.warn "Unknown delta action, #{d}, can't apply deltas."
          return

      else
        AWGLLog.warn "Unknown delta type, can't apply deltas! #{d} #{typeof d}"
        return

      if i > finalVerts.length
        AWGLLog.warn "Vertex gap, can't push new vert! #{val}:#{d}:#{i}"
        return
      else if i == finalVerts.length
        finalVerts.push val
      else finalVerts[i] = val

    @actor.updateVertices finalVerts

  # Looks through all the options provided and sends them to the update
  # function so they are not lost when i updates
  animate: ->
    if @_animated then return else @_animated = true
    if @options.cbStart != undefined then @options.cbStart()

    for i in [0...@options.deltas.length]

      # Send proper user data if provided
      udata = null
      if @options.udata != undefined
        if @options.udata instanceof Array
          if i < @options.udata.length then udata = @options.udata[i]
        else udata = @options.udata

      if i == (@options.deltas.length - 1) then last = true else last = false
      @_setTimeout @options.deltas[i], @options.delays[i], udata, last