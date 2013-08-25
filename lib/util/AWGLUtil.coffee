# Utility class, provides nice wrapper for otherwise global functions
class AWGLUtil

  # Provides a standard way to verify provided parameters
  #
  # @param [Object] value provided parameter to check
  # @param [Object] def default value to check against
  # @param [Boolean] required enforces parameter
  # @param [String] msg msg to throw, logged as warning if not required
  # @param [Boolean] nullAllowed if true, value may be null (default false)
  @param: (value, def, required, msg, nullAllowed) ->

    if value == undefined or (value is null and nullAllowed is true)
      if required
        throw new Error msg
      else
        # Log warning, set value to default
        AWGLLog.warn msg
        value = def

    value
