describe "Engine interface", ->

  iface = window.AdefyRE.Engine()
  ENGINE_REF = null
  RENDERER_REF = null

  # We initialise the engine in the before hook
  before (done) ->
    initEngine ->

      ENGINE_REF = iface._engine
      RENDERER_REF = iface._renderer

      done()

  it "exists", ->
    expect(iface).to.exist

  # Called in the before hook
  describe "NON-NRAID: initialize()", ->

    it "starts rendering", ->
      expect(ENGINE_REF.isRendering()).to.be.true

    it "forwards proper dimensions", ->
      expect(ENGINE_REF.getWidth()).to.equal ENGINE_WIDTH
      expect(ENGINE_REF.getHeight()).to.equal ENGINE_HEIGHT

    it "sets the correct log level", ->
      expect(ARELog.level).to.equal ENGINE_LOG_LEVEL

  describe "NON-NRAID: getRenderMode()", ->
    it "returns the active render mode", ->

      renderMode = iface.getRendererMode()      
      canvasMode = renderMode == ARERenderer.RENDER_MODE_CANVAS
      webglMode = renderMode == ARERenderer.RENDER_MODE_WGL

      assert canvasMode || webglMode, "Render mode is Canvas or WebGL"

      expect(renderMode).to.equal RENDERER_REF.getActiveRendererMode()

  describe "set/getClearColor()", ->

    CLEAR_R = 255
    CLEAR_G = 10
    CLEAR_B = 74

    it "sets the renderer clear color", ->

      iface.setClearColor
        r: CLEAR_R
        g: CLEAR_G
        b: CLEAR_B

      clearCol = RENDERER_REF.getClearColor()

      expect(clearCol.getR()).to.equal CLEAR_R
      expect(clearCol.getG()).to.equal CLEAR_G
      expect(clearCol.getB()).to.equal CLEAR_B

    it "gets the renderer clear color", ->
      
      clearCol = iface.getClearColor()

      expect(clearCol.r).to.equal CLEAR_R
      expect(clearCol.g).to.equal CLEAR_G
      expect(clearCol.b).to.equal CLEAR_B

  describe "set/getLogLevel", ->

    LOG_LEVEL = Math.floor(Math.random() * 5)

    it "sets the engine log level", ->

      iface.setLogLevel LOG_LEVEL
      expect(ARELog.level).to.equal LOG_LEVEL

    it "caps the log level internally", ->

      iface.setLogLevel 12
      expect(ARELog.level).to.equal 4

      iface.setLogLevel -4
      expect(ARELog.level).to.equal 0

    it "rejects NAN levels", ->

      iface.setLogLevel 3
      expect(ARELog.level).to.equal 3

      iface.setLogLevel "bob"
      expect(ARELog.level).to.equal 3

    it "rounds float levels", ->

      iface.setLogLevel 1.4
      expect(ARELog.level).to.equal 1
      
      iface.setLogLevel 1.7
      expect(ARELog.level).to.equal 2

    it "fetches the log level", ->
      
      iface.setLogLevel 4
      expect(iface.getLogLevel()).to.equal 4

  describe "set/getCameraPosition()", ->

    POSITION = x: 10, y: 50

    it "sets the camera position", ->

      iface.setCameraPosition POSITION

      # Notice we fetch it from the renderer
      cameraPosition = RENDERER_REF.getCameraPosition()
      expect(cameraPosition.x).to.equal POSITION.x
      expect(cameraPosition.y).to.equal POSITION.y

    it "gets the camera position", ->
      
      iface.setCameraPosition POSITION

      cameraPosition = iface.getCameraPosition()
      expect(cameraPosition.x).to.equal POSITION.x
      expect(cameraPosition.y).to.equal POSITION.y

  describe "Manifest handling", ->

    MANIFEST =
      version: "1.0.0"
      meta: "Wazuuupppp"
      textures: [
        name: "block1"
        file: "/images/block_0000.png"
      ,
        name: "block2"
        file: "/images/block_0001.png"
      ,
        name: "block3"
        file: "/images/block_0002.png"
      ]

    TEXTURE =
        name: "block4"
        file: "/images/block_0003.png"

    describe "NON-NRAID: loadManifest()", ->

      it "parses and loads the manifest", (done) ->

        iface.loadManifest MANIFEST, ->
          done()

      it "saves the meta data", ->
        expect(iface.getMetaData()).to.equal MANIFEST.meta

      it "loads the provided textures", ->
        expect(RENDERER_REF.hasTexture("block1")).to.be.true
        expect(RENDERER_REF.hasTexture("block2")).to.be.true
        expect(RENDERER_REF.hasTexture("block3")).to.be.true

    describe "NON-NRAID: loadTexture()", ->

      it "Loads a single texture definition", (done) ->

        iface.loadTexture TEXTURE, ->
          expect(RENDERER_REF.hasTexture("block4")).to.be.true
          done()

    describe "getTextureSize()", ->
    
      it "returns the size of a specified texture", ->

        size = iface.getTextureSize "block1"

        expect(size.w).to.equal 96
        expect(size.h).to.equal 96
        
