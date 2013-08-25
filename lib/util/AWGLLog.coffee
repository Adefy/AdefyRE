# Tiny logging class for AWGL, created to be able to selectively
# silence all logging in production, or by level. Also supports tags
# similar to the 'spew' npm module
#
# There are 4 default levels, with 0 always turning off all logging
#
# 1 - Error
# 2 - Warning
# 3 - Debug
# 4 - Info
class AWGLLog

  # @property [Array<String>] tags, editable by the user
  @tags: [
    "",
    "[Error]> ",
    "[Warning]> ",
    "[Debug]> ",
    "[Info]> "
  ]

  # @property [Number] logging level
  level: 4

  # Generic logging function
  #
  # @param [Number] level logging level to log on
  # @param [String] str log message
  @w: (level, str) ->

    # Return early if not at a suiteable level, or level is 0
    if level > @level or level == 0 or @level == 0 then return

    # Specialized console output
    if level == 1 and console.error != undefined
      console.error "#{@tags[level]}#{str}"
      return
    else if level == 2 and console.warn != undefined
      console.warn "#{@tags[level]}#{str}"
      return
    else if level == 3 and console.debug != undefined
      console.debug "#{@tags[level]}#{str}"
      return
    else if level == 4 and console.info != undefined
      console.info "#{@tags[level]}#{str}"
      return

    if level > 4 and @tags[level] != undefined
      console.log "#{@tags[level]}#{str}"
    else
      console.log str
    return

  # Specialized, sets level to error directly
  #
  # @param [String] str log message
  @error: (str) -> @w 1, str

  # Specialized, sets level to warning directly
  #
  # @param [String] str log message
  @warn: (str) -> @w 2, str

  # Specialized, sets level to debug directly
  #
  # @param [String] str log message
  @debug: (str) -> @w 3, str

  # Specialized, sets level to info directly
  #
  # @param [String] str log message
  @info: (str) -> @w 4, str
