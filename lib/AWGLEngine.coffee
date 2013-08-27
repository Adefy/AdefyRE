# AWGLEngine
#
# @depend AWGLRenderer.coffee
# @depend AWGLPhysics.coffee
# @depend util/AWGLLog.coffee
# @depend util/AWGLAjax.coffee
# @depend interface/AWGLInterface.coffee
#
# Takes a path to a directory containing an Adefy ad and runs it
#
# Intended useage is from the Ad editor, but it doesn't expect anything from
# its environment besides WebGL support
#
# Creating a new instance of this engine will launch the ad directly, creating
# a renderer and loading up the scenes as required
#
# Requires the ajax library from https://code.google.com/p/microajax/ and
# expects the ajax object to be bound to the window as window.ajax
#
# Requires Underscore.js fromhttp://documentcloud.github.io/underscore
#
# Requires Chipmunk-js https://github.com/josephg/Chipmunk-js
#
# AWGLLog is used for all logging throughout the application
class AWGLEngine

  # Constructor, takes a path to the root of the ad intended to be displayed
  # An attempt is made to load and parse a package.json
  #
  # Returns false if the ajax library is not loaded
  #
  # @Example Load from Adefy servers
  #   new AWGLEngine "https://static.adefy.eu/Y7eqYy6rTNDwBjwD/"
  #
  # @param [String] url ad location
  # @param [Number] logLevel level to start AWGLLog at, defaults to 4
  # @param [Method] cb callback to execute when finished initializing
  # @return [Boolean] success
  constructor: (@url, logLevel, cb) ->

    # Holds fetched package.json
    @package = null

    # Initialized to a new instance of AWGLAjax
    @ajax = null

    # Initialized after Ad package is downloaded and verified
    @_renderer = null

    # Holds a handle on the render loop interval
    @_renderIntervalId = null

    # Framerate for renderer, defaults to 60FPS
    @_framerate = 1.0 / 60.0

    # Defined if there was an error during initialization
    @initError = undefined

    # Ensure https://code.google.com/p/microajax/ is loaded
    if window.ajax is null or window.ajax is undefined
      AWGLLog.error "Ajax library is not present!"
      @initSuccess = "Ajax library is not present!"
      return

    # Ensure Underscore.js is loaded
    if window._ is null or window._ is undefined
      AWGLLog.error "Underscore.js is not present!"
      @initSuccess = "Underscore.js is not present!"
      return

    # Ensure Chipmunk-js is loaded
    if window.cp is undefined or window.cp is null
      AWGLLog.error "Chipmunk-js is not present!"
      @initSuccess = "Chipmunk-js is not present!"
      return

    # Create an instance of AWGLAjax
    @ajax = new AWGLAjax

    # Store instance for callbacks
    me = @

    if logLevel != undefined then AWGLLog.level = logLevel

    # [ASYNC] Grab the package.json
    @ajax.r "#{@url}/package.json", (res) ->
      AWGLLog.info "...fetched package.json"
      me.package = JSON.parse res

      # [ASYNC] Package.json is valid, continue
      validStructure = me.verifyPackage me.package, (sourcesObj) ->

        AWGLLog.info "...downloaded. Creating Renderer"
        me._renderer = new AWGLRenderer()

        ##
        # At this point, we have a renderer instance ready to go, and we can
        # load up the scenes one at a time and execute them. We create
        # an instance of AWGLInterface on the window, so our middleware
        # can interface with AWGL.
        #
        # Scenes create a window.currentScene object, which we run with
        # window.currentScene();
        ##

        me.startRendering()
        AWGLPhysics.startStepping()

        # Break out interface
        window.AdefyGLI = new AWGLInterface

        if cb != null and cb != undefined then cb()

      if validStructure
        AWGLLog.info "package.json valid, downloading assets..."
      else
        AWGLLog.error "Invalid package.json"
        @initSuccess = "Invalid package.json"
        return

    AWGLLog.info "Engine initialized, awaiting package.json..."

  # Verifies the validity of the package.json file, ensuring we can actually
  # use it. Checks for existence of required fields, and if all is well
  # continues to check for files and pull them down. Once done, it calls
  # the cb with the data
  #
  # @param [Object] Object created from package.json
  # @param [Method] cb callback to provide data to
  # @return [Boolean] validity
  verifyPackage: (obj, cb) ->


    # Build definition of valid package.json
    validPackage =
      company: ""     # Owner
      apikey: ""      # APIKey
      load: ""        # Load function to prepare for scene execution
      scenes: {}      # Object containing numbered scenes

    # Ensure required fields are present
    for k of validPackage
      if obj[k] == undefined
        AWGLLog.error "package.json invalid, missing key #{k}"
        return false

    # Ensure at least one scene is provided
    if obj.scenes.length == 0
      AWGLLog.warning ".json does not specify any scenes, can't continue"
      return false

    # Container for downloaded files
    packageFiles =
      load: null
      scenes: {}

    toDownload = 1 + _.size obj.scenes
    me = @

    _postAjax = (name, res) ->

      # Save result as needed
      if name == "load"
        packageFiles.load = res
      else
        packageFiles.scenes[name] = res

      # Call the cb if done
      toDownload--
      if toDownload == 0
        cb packageFiles

    _fetchScene = (name, path) ->

      # Perform ajax request
      me.ajax.r "#{me.url}#{path}", (res) ->
        _postAjax name, res

    # [ASYNC] Verify existence of the files
    # Start with the load function, then the scenes
    @ajax.r "#{@url}#{obj.load}", (res) -> _postAjax "load", res

    # Load up scenes, delegate to _fetchScene
    for s of obj.scenes
      _fetchScene s, obj.scenes[s]

    # Returns before files are downloaded, mearly to guarantee file validity
    true

  # Set framerate as an FPS figure
  # @param [Number] fps
  setFPS: (fps) -> @_framerate = 1.0 / fps

  # Start render loop if it isn't already running
  startRendering: ->
    if @_renderIntervalId != null then return

    me = @
    AWGLLog.info "Starting render loop"

    @_renderIntervalId = setInterval ->
      me._renderer.render()
    , @_framerate

  # Halt render loop if it's running
  stopRendering: ->
    if @_renderIntervalId == null then return
    AWGLLog.info "Halting render loop"
    clearInterval @_renderIntervalId
    @_renderIntervalId = null
