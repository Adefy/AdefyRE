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
# Also requires Underscore.js fromhttp://documentcloud.github.io/underscore
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

        framerate = 1.0 / 60.0

        log.info "Jumping into loop! Good luck!"
        setInterval ->
          me._renderer.render()
        , framerate

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

  # Returns the static private AWGLLog instance
  #
  # @return [AWGLLog] log
  @getLog: -> @_log
