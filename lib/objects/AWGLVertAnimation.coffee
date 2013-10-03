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
  # @example Example vertex set specifications
  #   ["+5", "-3", "3.53", ".", "."]
  #   applied to
  #   [20, 42, 23, 67, 34, 75, 96, 32, 76, 23]
  #   yields
  #   [25, 39, 3.53, 67, 34]
  #
  #   ["2", "|"]
  #   applied to
  #   [1, 1, 1, 1, 1, 1]
  #   yields
  #   [2, 1, 1, 1, 1, 1]
  #
  #   Values passed in as numbers (not strings) will be interpreted as absolute
  #   changes. If you need to set a negative value, use a number, not a string!
  #
  # @param [AWGLActor] actor the actor we apply the modifications to
  # @param [Object] options the options we apply
  # @option options [Number, Array<Number>] delays
  # @option options [Array, Array<Array>] deltas
  constructor: (@actor, @options) ->
    param.required @actor
    param.required @options
    param.required @options.delays
    param.required @options.deltas

    # Force array, length match
    if @options.delays not instanceof Array
      @options.delays = [ @options.delays ]

    if @options.deltas not instanceof Array
      @options.deltas = [ @options.deltas ]

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
  # @private
  _setTimeout: (deltaSet, delay) ->
    param.required deltaSet
    param.required delay

    setTimeout (=> @_applyDeltas deltaSet), delay

  # Applies the delta set to the actor
  #
  # @param [Array<String, Number>] deltaSet
  _applyDeltas: (deltaSet) ->
    param.required deltaSet

    finalVerts = @actor.getVertices()

    # Apply deltas.
    #
    #    N   - Absolute update
    #   "-N" - Negative change
    #   "+N" - Positive change
    #   "."  - No change
    #   "|"  - Finished, break
    for d, i in deltaSet
      if i >= finalVerts.length then val = undefined else val = finalVerts[i]

      if typeof d == "number" then val = d
      else if typeof d == "string"
        if val == undefined
          AWGLLog.warn "Vertex does not exist, yet delta is relative!"
          return

        if d.charAt(0) == "|" then break
        else if d.charAt(0) == "-" then val -= Number(d.slice(1))
        else if d.charAt(0) == "+" then val += Number(d.slice(1))
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

    for i in [0...@options.deltas.length]
      @_setTimeout @options.deltas[i], @options.delays[i]