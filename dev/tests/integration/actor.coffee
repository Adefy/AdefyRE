describe "Actor interface", ->

  iface = window.AdefyRE.Actors()
  ENGINE_REF = null
  RENDERER_REF = null

  # We initialise the engine in the before hook
  beforeEach (done) ->
    initEngine ->

      ENGINE_REF = iface._engine
      RENDERER_REF = iface._renderer

      done()

  POLY_ACTOR = null
  CIRCLE_ACTOR = null
  RECT_ACTOR = null
  RAW_ACTOR = null

  RAW_POLY_ACTOR = null
  RAW_CIRCLE_ACTOR = null
  RAW_RECT_ACTOR = null
  RAW_RAW_ACTOR = null

  success = (res) -> expect(res).to.be.true
  perActor = (cb) ->
    cb POLY_ACTOR, RAW_POLY_ACTOR if RAW_POLY_ACTOR
    cb CIRCLE_ACTOR, RAW_CIRCLE_ACTOR if RAW_CIRCLE_ACTOR
    cb RECT_ACTOR, RAW_RECT_ACTOR if RAW_RECT_ACTOR
    cb RAW_ACTOR, RAW_RAW_ACTOR if RAW_RAW_ACTOR

  describe "Polygon actor", ->

    RADIUS = 100
    SEGMENTS = 8
    
    it "can be created via create2DPolygon()", ->
      POLY_ACTOR = iface.create2DPolygon RADIUS, SEGMENTS
      expect(POLY_ACTOR).to.not.be.null

      RAW_POLY_ACTOR = iface._findActor POLY_ACTOR

    it "radius can be manipulated and read", ->
      expect(iface.getPolygonRadius(POLY_ACTOR)).to.equal RADIUS

      iface.setPolygonRadius POLY_ACTOR, RADIUS * 2
      expect(iface.getPolygonRadius(POLY_ACTOR)).to.equal RADIUS * 2

    it "segment count can be manipulated and read", ->
      expect(iface.getPolygonSegments(POLY_ACTOR)).to.equal SEGMENTS

      iface.setPolygonSegments POLY_ACTOR, SEGMENTS * 2
      expect(iface.getPolygonSegments(POLY_ACTOR)).to.equal SEGMENTS * 2

  describe "Circle actor", ->

    RADIUS = 100
    
    it "can be created via create2DCircle()", ->
      CIRCLE_ACTOR = iface.create2DCircle RADIUS
      expect(CIRCLE_ACTOR).to.not.be.null

      RAW_CIRCLE_ACTOR = iface._findActor CIRCLE_ACTOR

    it "radius can be manipulated and read", ->
      expect(iface.getPolygonRadius(CIRCLE_ACTOR)).to.equal RADIUS

      iface.setPolygonRadius CIRCLE_ACTOR, RADIUS * 2
      expect(iface.getPolygonRadius(CIRCLE_ACTOR)).to.equal RADIUS * 2

  describe "Rectangle actor", ->

    WIDTH = 50
    HEIGHT = 75
    
    it "can be created via create2DRectangle()", ->
      RECT_ACTOR = iface.create2DRectangle WIDTH, HEIGHT
      expect(RECT_ACTOR).to.not.be.null

      RAW_RECT_ACTOR = iface._findActor RECT_ACTOR

    it "width can be manipulated and read", ->
      expect(iface.getRectangleWidth(RECT_ACTOR)).to.equal WIDTH

      iface.setRectangleWidth RECT_ACTOR, WIDTH * 2
      expect(iface.getRectangleWidth(RECT_ACTOR)).to.equal WIDTH * 2

    it "height can be manipulated and read", ->
      expect(iface.getRectangleHeight(RECT_ACTOR)).to.equal HEIGHT

      iface.setRectangleHeight RECT_ACTOR, HEIGHT * 2
      expect(iface.getRectangleHeight(RECT_ACTOR)).to.equal HEIGHT * 2

  describe "Actor basic manipulation methods", ->

    describe "Layer", ->
      it "provides get/setLayer", ->

        LAYER_1 = 50
        LAYER_2 = 1000

        perActor (actor, actor_raw) ->
          success iface.setLayer actor, LAYER_1
          expect(iface.getLayer(actor)).to.equal LAYER_1
          expect(actor_raw.getLayer()).to.equal LAYER_1

          success iface.setLayer actor, LAYER_2
          expect(iface.getLayer(actor)).to.equal LAYER_2
          expect(actor_raw.getLayer()).to.equal LAYER_2

    describe "Opacity", ->
      it "provides get/setOpacity", ->

        OPACITY_1 = 0.5
        OPACITY_2 = 0.8

        perActor (actor, actor_raw) ->
          success iface.setOpacity actor, OPACITY_1
          expect(iface.getOpacity(actor)).to.equal OPACITY_1
          expect(actor_raw.getOpacity()).to.equal OPACITY_1

          success iface.setOpacity actor, OPACITY_2
          expect(iface.getOpacity(actor)).to.equal OPACITY_2
          expect(actor_raw.getOpacity()).to.equal OPACITY_2

      it "caps opacity above/below 1.0/0.0", ->

        OPACITY_MIN = -2.0
        OPACITY_MAX = 1.4

        perActor (actor, actor_raw) ->
          success iface.setOpacity actor, OPACITY_MIN
          expect(iface.getOpacity(actor)).to.equal 0.0
          expect(actor_raw.getOpacity()).to.equal 0.0

          success iface.setOpacity actor, OPACITY_MAX
          expect(iface.getOpacity(actor)).to.equal 1.0
          expect(actor_raw.getOpacity()).to.equal 1.0

    describe "Visibility", ->
      it "defaults to true", ->

        perActor (actor, actor_raw) ->
          expect(actor_raw.getVisible()).to.be.true

      it "provides is/setVisible", ->

        perActor (actor, actor_raw) ->
          success iface.setVisible actor, false
          expect(iface.isVisible(actor)).to.be.false
          expect(actor_raw.getVisible()).to.be.false

    describe "Position & Rotation", ->
      it "provides get/setPosition", ->

        POSITION_1 = x: 100, y: -10000
        POSITION_2 = x: 500, y: 2000

        perActor (actor, actor_raw) ->
          success iface.setPosition actor, POSITION_1
          expect(iface.getPosition(actor)).to.equal POSITION_1
          expect(actor_raw.getPosition()).to.equal POSITION_1

          success iface.setPosition actor, POSITION_2
          expect(iface.getPosition(actor)).to.equal POSITION_2
          expect(actor_raw.getPosition()).to.equal POSITION_2

      it "provides get/setRotation", ->

        # Convert to fixed to deal with rounding issues
        ANGLE_1 = Number Math.PI.toFixed 4
        ANGLE_2 = Number (-Math.PI / 2).toFixed 4

        perActor (actor, actor_raw) ->
          success iface.setRotation actor, ANGLE_1
          expect(Number iface.getRotation(actor).toFixed(4)).to.equal ANGLE_1
          expect(Number actor_raw.getRotation().toFixed(4)).to.equal ANGLE_1

          success iface.setRotation actor, ANGLE_2
          expect(Number iface.getRotation(actor).toFixed(4)).to.equal ANGLE_2
          expect(Number actor_raw.getRotation().toFixed(4)).to.equal ANGLE_2

      it "allows rotation to be read/set in either degrees or radians", ->
        
        ANGLE_DEG = 180
        ANGLE_RAD = Number Math.PI.toFixed 4

        perActor (actor, actor_raw) ->
          success iface.setRotation actor, ANGLE_DEG, false
          expect(Number iface.getRotation(actor, true).toFixed(4)).to.equal ANGLE_RAD
          expect(Number actor_raw.getRotation().toFixed(3)).to.equal ANGLE_DEG

          success iface.setRotation actor, ANGLE_RAD, true
          expect(Number iface.getRotation(actor, false).toFixed(0)).to.equal ANGLE_DEG
          expect(Number actor_raw.getRotation().toFixed(3)).to.equal ANGLE_DEG

    describe "Color & Texture", ->
      
      it "provides get/setColor", ->

        COLOR_1 = r: 5, g: 25, b: 125
        COLOR_2 = r: 70, g: 140, b: 210

        perActor (actor, actor_raw) ->
          success iface.setColor actor, COLOR_1
          expect(iface.getColor(actor).r).to.equal COLOR_1.r
          expect(iface.getColor(actor).g).to.equal COLOR_1.g
          expect(iface.getColor(actor).b).to.equal COLOR_1.b
          expect(actor_raw.getColor().getR()).to.equal COLOR_1.r
          expect(actor_raw.getColor().getG()).to.equal COLOR_1.g
          expect(actor_raw.getColor().getB()).to.equal COLOR_1.b

          success iface.setColor actor, COLOR_2
          expect(iface.getColor(actor).r).to.equal COLOR_2.r
          expect(iface.getColor(actor).g).to.equal COLOR_2.g
          expect(iface.getColor(actor).b).to.equal COLOR_2.b
          expect(actor_raw.getColor().getR()).to.equal COLOR_2.r
          expect(actor_raw.getColor().getG()).to.equal COLOR_2.g
          expect(actor_raw.getColor().getB()).to.equal COLOR_2.b

      it "provides get/setTexture", ->

        TEXTURE_1 = "block1"
        TEXTURE_2 = "block2"

        TEXTURE_OBJ_1 = RENDERER_REF.getTexture TEXTURE_1
        TEXTURE_OBJ_2 = RENDERER_REF.getTexture TEXTURE_2

        perActor (actor, actor_raw) ->
          success iface.setTexture actor, TEXTURE_1
          expect(iface.getTexture(actor)).to.equal TEXTURE_1
          expect(actor_raw.getTexture()).to.equal TEXTURE_OBJ_1

          success iface.setTexture actor, TEXTURE_2
          expect(iface.getTexture(actor)).to.equal TEXTURE_2
          expect(actor_raw.getTexture()).to.equal TEXTURE_OBJ_2

      it "provides get/setTextureRepeat", ->

        REPEAT_1 = x: 2, y: 3.2
        REPEAT_2 = x: 0.24, y: 1000

        perActor (actor, actor_raw) ->
          success iface.setTextureRepeat actor, REPEAT_1
          expect(iface.getTextureRepeat(actor).x).to.equal REPEAT_1.x
          expect(iface.getTextureRepeat(actor).y).to.equal REPEAT_1.y
          expect(actor_raw.getTextureRepeat().x).to.equal REPEAT_1.x
          expect(actor_raw.getTextureRepeat().y).to.equal REPEAT_1.y

          success iface.setTextureRepeat actor, REPEAT_2
          expect(iface.getTextureRepeat(actor).x).to.equal REPEAT_2.x
          expect(iface.getTextureRepeat(actor).y).to.equal REPEAT_2.y
          expect(actor_raw.getTextureRepeat().x).to.equal REPEAT_2.x
          expect(actor_raw.getTextureRepeat().y).to.equal REPEAT_2.y

    describe "Vertices", ->
      
      it "provides get/setVertices", ->

      it "provides get/setPhysicsVertices", ->

  describe "Actor attachment methods", ->
    
  describe "Actor physics methods", ->
    
    it "provides get/setActorPhysicsLayer", ->
