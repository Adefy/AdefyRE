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
    
    it "can be created via createPolygonActor()", ->
      POLY_ACTOR = iface.createPolygonActor RADIUS, SEGMENTS
      expect(POLY_ACTOR).to.not.be.null

      RAW_POLY_ACTOR = iface._findActor POLY_ACTOR

    it "radius can be manipulated and read", ->
      expect(iface.getPolygonActorRadius(POLY_ACTOR)).to.equal RADIUS

      iface.setPolygonActorRadius POLY_ACTOR, RADIUS * 2
      expect(iface.getPolygonActorRadius(POLY_ACTOR)).to.equal RADIUS * 2

    it "segment count can be manipulated and read", ->
      expect(iface.getPolygonActorSegments(POLY_ACTOR)).to.equal SEGMENTS

      iface.setPolygonActorSegments POLY_ACTOR, SEGMENTS * 2
      expect(iface.getPolygonActorSegments(POLY_ACTOR)).to.equal SEGMENTS * 2

  describe "Circle actor", ->

    RADIUS = 100
    
    it "can be created via createCircleActor()", ->
      CIRCLE_ACTOR = iface.createCircleActor RADIUS
      expect(CIRCLE_ACTOR).to.not.be.null

      RAW_CIRCLE_ACTOR = iface._findActor CIRCLE_ACTOR

    it "radius can be manipulated and read", ->
      expect(iface.getPolygonActorRadius(CIRCLE_ACTOR)).to.equal RADIUS

      iface.setPolygonActorRadius CIRCLE_ACTOR, RADIUS * 2
      expect(iface.getPolygonActorRadius(CIRCLE_ACTOR)).to.equal RADIUS * 2

  describe "Rectangle actor", ->

    WIDTH = 50
    HEIGHT = 75
    
    it "can be created via createRectangleActor()", ->
      RECT_ACTOR = iface.createRectangleActor WIDTH, HEIGHT
      expect(RECT_ACTOR).to.not.be.null

      RAW_RECT_ACTOR = iface._findActor RECT_ACTOR

    it "width can be manipulated and read", ->
      expect(iface.getRectangleActorWidth(RECT_ACTOR)).to.equal WIDTH

      iface.setRectangleActorWidth RECT_ACTOR, WIDTH * 2
      expect(iface.getRectangleActorWidth(RECT_ACTOR)).to.equal WIDTH * 2

    it "height can be manipulated and read", ->
      expect(iface.getRectangleActorHeight(RECT_ACTOR)).to.equal HEIGHT

      iface.setRectangleActorHeight RECT_ACTOR, HEIGHT * 2
      expect(iface.getRectangleActorHeight(RECT_ACTOR)).to.equal HEIGHT * 2

  describe "Actor basic manipulation methods", ->

    describe "Layer", ->
      it "provides get/setActorLayer", ->

        LAYER_1 = 50
        LAYER_2 = 1000

        perActor (actor, actor_raw) ->
          success iface.setActorLayer actor, LAYER_1
          expect(iface.getActorLayer(actor)).to.equal LAYER_1
          expect(actor_raw.getLayer()).to.equal LAYER_1

          success iface.setActorLayer actor, LAYER_2
          expect(iface.getActorLayer(actor)).to.equal LAYER_2
          expect(actor_raw.getLayer()).to.equal LAYER_2

    describe "Opacity", ->
      it "provides get/setActorOpacity", ->

        OPACITY_1 = 0.5
        OPACITY_2 = 0.8

        perActor (actor, actor_raw) ->
          success iface.setActorOpacity actor, OPACITY_1
          expect(iface.getActorOpacity(actor)).to.equal OPACITY_1
          expect(actor_raw.getOpacity()).to.equal OPACITY_1

          success iface.setActorOpacity actor, OPACITY_2
          expect(iface.getActorOpacity(actor)).to.equal OPACITY_2
          expect(actor_raw.getOpacity()).to.equal OPACITY_2

      it "caps opacity above/below 1.0/0.0", ->

        OPACITY_MIN = -2.0
        OPACITY_MAX = 1.4

        perActor (actor, actor_raw) ->
          success iface.setActorOpacity actor, OPACITY_MIN
          expect(iface.getActorOpacity(actor)).to.equal 0.0
          expect(actor_raw.getOpacity()).to.equal 0.0

          success iface.setActorOpacity actor, OPACITY_MAX
          expect(iface.getActorOpacity(actor)).to.equal 1.0
          expect(actor_raw.getOpacity()).to.equal 1.0

    describe "Visibility", ->
      it "defaults to true", ->

        perActor (actor, actor_raw) ->
          expect(actor_raw.getVisible()).to.be.true

      it "provides get/setActorVisible", ->

        perActor (actor, actor_raw) ->
          success iface.setActorVisible actor, false
          expect(iface.getActorVisible(actor)).to.be.false
          expect(actor_raw.getVisible()).to.be.false

    describe "Position & Rotation", ->
      it "provides get/setActorPosition", ->

        POSITION_1 = x: 100, y: -10000
        POSITION_2 = x: 500, y: 2000

        perActor (actor, actor_raw) ->
          success iface.setActorPosition actor, POSITION_1
          expect(iface.getActorPosition(actor)).to.equal POSITION_1
          expect(actor_raw.getPosition()).to.equal POSITION_1

          success iface.setActorPosition actor, POSITION_2
          expect(iface.getActorPosition(actor)).to.equal POSITION_2
          expect(actor_raw.getPosition()).to.equal POSITION_2

      it "provides get/setActorRotation", ->

        # Convert to fixed to deal with rounding issues
        ANGLE_1 = Number Math.PI.toFixed 4
        ANGLE_2 = Number (-Math.PI / 2).toFixed 4

        perActor (actor, actor_raw) ->
          success iface.setActorRotation actor, ANGLE_1
          expect(Number iface.getActorRotation(actor).toFixed(4)).to.equal ANGLE_1
          expect(Number actor_raw.getRotation().toFixed(4)).to.equal ANGLE_1

          success iface.setActorRotation actor, ANGLE_2
          expect(Number iface.getActorRotation(actor).toFixed(4)).to.equal ANGLE_2
          expect(Number actor_raw.getRotation().toFixed(4)).to.equal ANGLE_2

      it "allows rotation to be read/set in either degrees or radians", ->
        
        ANGLE_DEG = 180
        ANGLE_RAD = Number Math.PI.toFixed 4

        perActor (actor, actor_raw) ->
          success iface.setActorRotation actor, ANGLE_DEG, false
          expect(Number iface.getActorRotation(actor, true).toFixed(4)).to.equal ANGLE_RAD
          expect(Number actor_raw.getRotation().toFixed(3)).to.equal ANGLE_DEG

          success iface.setActorRotation actor, ANGLE_RAD, true
          expect(Number iface.getActorRotation(actor, false).toFixed(0)).to.equal ANGLE_DEG
          expect(Number actor_raw.getRotation().toFixed(3)).to.equal ANGLE_DEG

    describe "Color & Texture", ->
      
      it "provides get/setActorColor", ->

        COLOR_1 = r: 5, g: 25, b: 125
        COLOR_2 = r: 70, g: 140, b: 210

        perActor (actor, actor_raw) ->
          success iface.setActorColor actor, COLOR_1
          expect(iface.getActorColor(actor).r).to.equal COLOR_1.r
          expect(iface.getActorColor(actor).g).to.equal COLOR_1.g
          expect(iface.getActorColor(actor).b).to.equal COLOR_1.b
          expect(actor_raw.getColor().getR()).to.equal COLOR_1.r
          expect(actor_raw.getColor().getG()).to.equal COLOR_1.g
          expect(actor_raw.getColor().getB()).to.equal COLOR_1.b

          success iface.setActorColor actor, COLOR_2
          expect(iface.getActorColor(actor).r).to.equal COLOR_2.r
          expect(iface.getActorColor(actor).g).to.equal COLOR_2.g
          expect(iface.getActorColor(actor).b).to.equal COLOR_2.b
          expect(actor_raw.getColor().getR()).to.equal COLOR_2.r
          expect(actor_raw.getColor().getG()).to.equal COLOR_2.g
          expect(actor_raw.getColor().getB()).to.equal COLOR_2.b

      it "provides get/setActorTexture", ->

        TEXTURE_1 = "block1"
        TEXTURE_2 = "block2"

        TEXTURE_OBJ_1 = RENDERER_REF.getTexture TEXTURE_1
        TEXTURE_OBJ_2 = RENDERER_REF.getTexture TEXTURE_2

        perActor (actor, actor_raw) ->
          success iface.setActorTexture actor, TEXTURE_1
          expect(iface.getActorTexture(actor)).to.equal TEXTURE_1
          expect(actor_raw.getTexture()).to.equal TEXTURE_OBJ_1

          success iface.setActorTexture actor, TEXTURE_2
          expect(iface.getActorTexture(actor)).to.equal TEXTURE_2
          expect(actor_raw.getTexture()).to.equal TEXTURE_OBJ_2

      it "provides get/setActorTextureRepeat", ->

        REPEAT_1 = x: 2, y: 3.2
        REPEAT_2 = x: 0.24, y: 1000

        perActor (actor, actor_raw) ->
          success iface.setActorTextureRepeat actor, REPEAT_1
          expect(iface.getActorTextureRepeat(actor).x).to.equal REPEAT_1.x
          expect(iface.getActorTextureRepeat(actor).y).to.equal REPEAT_1.y
          expect(actor_raw.getTextureRepeat().x).to.equal REPEAT_1.x
          expect(actor_raw.getTextureRepeat().y).to.equal REPEAT_1.y

          success iface.setActorTextureRepeat actor, REPEAT_2
          expect(iface.getActorTextureRepeat(actor).x).to.equal REPEAT_2.x
          expect(iface.getActorTextureRepeat(actor).y).to.equal REPEAT_2.y
          expect(actor_raw.getTextureRepeat().x).to.equal REPEAT_2.x
          expect(actor_raw.getTextureRepeat().y).to.equal REPEAT_2.y

    describe "Vertices", ->
      
      it "provides get/setVertices", ->

      it "provides get/setPhysicsVertices", ->

  describe "Actor attachment methods", ->
    
  describe "Actor physics methods", ->
    
    it "provides get/setActorPhysicsLayer", ->
