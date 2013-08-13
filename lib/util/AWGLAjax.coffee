# AJAX utility class, wrapper around microAjax that adds queueing
class AWGLAjax

  # @property queue array, holds objects containing urls and cbs
  queue: []

  # @property true if currently processing a request
  busy: false

  # Request method, either passes through directly to microAjax or
  # queues the request
  #
  # @param [String] url
  # @param [Method] cb
  # @return [Boolean] executed false if queued
  r: (url, cb) ->

    me = @

    # If busy, directly enqueue
    if @busy
      @queue.push
        url: url
        cb: cb
      return false

    # Pass directly to _callMjax
    if @queue.length == 0
      @busy = true
      @_callMjax url, cb
      return true

    # Reaching this point means the queue is not empty, but we are not busy
    # either. This should never happen, but just in case...
    throw "[AWGLAjax] Queue length non-zero and busy flag not set!"

  # Internal function that actually calls microAjax
  # Passes the url, and calls the cb() inside an own callback, after
  # recursing if necessary
  #
  # @param [String] url
  # @param [Method] cb
  _callMjax: (url, cb) ->

    me = @

    # Call mjax
    window.microAjax url, (res) ->

      # If the queue is not empty, recurse back to _callMjax with next request
      if me.queue.length > 0
        next = me.queue.pop()
        me._callMjax next.url, next.cb
      else
        # No requests left, set busy to false
        me.busy = false

      # Pass result to intended callback
      cb res
