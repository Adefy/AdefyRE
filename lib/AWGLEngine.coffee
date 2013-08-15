# AWGLEngine
# @depend AWGLRenderer.coffee
# @depend util/AWGLLog.coffee
# @depend util/AWGLAjax.coffee
#
# Takes a path to a directory containing an Adefy ad and runs it
#
# Intended useage is from the Ad editor, but it doesn't expect anything from its
# environment besides WebGL support
#
# Creating a new instance of this engine will launch the ad directly, creating
# a renderer and loading up the scenes as required
#
# Requires the ajax library from https://code.google.com/p/microajax/ and
# expects the ajax object to be bound to the window as window.ajax
#
# Requires Underscore.js fromhttp://documentcloud.github.io/underscore
#
# Requires Box2dWeb https://box2dweb.googlecode.com/files/Box2dWeb-2.1a.3.zip
#
# AWGLLog is used for all logging throughout the application
class AWGLEngine

  # Privatized log to make it a static variable of sorts
  @_log: new AWGLLog()

  # @property [Object] Holds fetched package.json
  package: null

  # @property [Object] Initialized to a new instance of AWGLAjax
  ajax: null

  # Initialized after Ad package is downloaded and verified
  _renderer: null

  # Holds a handle on the render loop interval
  _renderIntervalId: null

  # Framerate for renderer, defaults to 60FPS
  _framerate: 1.0 / 60.0

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
  # @return [Boolean] success
  constructor: (@url, logLevel) ->

    log = AWGLEngine.getLog()

    # Ensure https://code.google.com/p/microajax/ is loaded
    if window.ajax is null or window.ajax is undefined
      log.error "Ajax library is not on the window object!"
      return false

    # Ensure Underscore.js is loaded
    if _ is null or _ is undefined
      log.error "Underscore.js is not present!"
      return false

    # Ensure Box2DWeb is loaded
    if Box2D is undefined or Box2D is null
      log.error "Box2DWeb is not present!"
      return false

    # Create an instance of AWGLAjax
    @ajax = new AWGLAjax

    # Store instance for callbacks
    me = @

    if logLevel != undefined then log.level = logLevel

    # [ASYNC] Grab the package.json
    @ajax.r "#{@url}/package.json", (res) ->
      log.info "...fetched package.json"
      me.package = JSON.parse res

      # [ASYNC] Package.json is valid, continue
      validStructure = me.verifyPackage me.package, (sourcesObj) ->

        log.info "...downloaded. Creating Renderer"
        me._renderer = new AWGLRenderer()
        me.startRendering()

      if validStructure
        log.info "package.json valid, downloading assets..."
      else
        log.error "Invalid package.json"
        return false

    log.info "Engine initialized, awaiting package.json..."

    true

  # Verifies the validity of the package.json file, ensuring we can actually
  # use it. Checks for existence of required fields, and if all is well
  # continues to check for files and pull them down. Once done, it calls
  # the cb with the data
  #
  # @param [Object] Object created from package.json
  # @param [Method] cb callback to provide data to
  # @return [Boolean] validity
  verifyPackage: (obj, cb) ->

    log = AWGLEngine.getLog()

    # Build definition of valid package.json
    validPackage =
      company: ""     # Owner
      apikey: ""      # APIKey
      load: ""        # Load function to prepare for scene execution
      scenes: {}      # Object containing numbered scenes

    # Ensure required fields are present
    for k of validPackage
      if obj[k] == undefined
        log.error "package.json invalid, missing key #{k}"
        return false

    # Ensure at least one scene is provided
    if obj.scenes.length == 0
      log.warning "package.json does not specify any scenes, can't continue"
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

  # Returns the static private AWGLLog instance
  #
  # @return [AWGLLog] log
  @getLog: -> @_log

  # Start render loop if it isn't already running
  startRendering: ->
    if @_renderIntervalId != null then return

    me = @
    AWGLEngine.getLog().info "Starting render loop"

    @_renderIntervalId = setInterval ->
      me._renderer.render()
    , @_framerate

  # Halt render loop if it's running
  stopRendering: ->
    if @_renderIntervalId == null then return
    AWGLEngine.getLog().info "Halting render loop"
    clearInterval @_renderIntervalId
    @_renderIntervalId = null
