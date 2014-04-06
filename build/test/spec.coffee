##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

describe "ARE Environment", ->

  it "should provide chipmunk-js", -> expect(window.cp).to.exist
  it "should provide underscore.js", -> expect(window._).to.exist

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

describe "TAREAjax", ->

  a = new AREAjax

  it "should start with an empty queue", ->
    expect(a.busy).to.be.false
    expect(a.queue.length).to.equal 0

  it "should provide a request method", ->
    expect(a.r).to.exist

  it "should allow for multiple requests", (done) ->
    _count = 0

    a.r "localhost", ->
      _count++
      if _count == 3 then done()

    a.r "localhost", ->
      _count++
      if _count == 3 then done()

    a.r "localhost", ->
      _count++
      if _count == 3 then done()
##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

describe "ARELog", ->

  it "should have a static logging function", ->
    expect(ARELog.w).to.exist

  it "should have a default log level of 4", ->
    expect(ARELog.level).to.equal 4

  it "should provide 5 default tags", ->
    expect(ARELog.tags.length).to.equal 5

  it "should provide an error function", ->
    expect(ARELog.error).to.exist

  it "should provide a warn function", ->
    expect(ARELog.warn).to.exist

  it "should provide a debug function", ->
    expect(ARELog.debug).to.exist

  it "should provide an info function", ->
    expect(ARELog.info).to.exist
##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

describe "AREUtilParam", ->

  it "should be avaliable globally", ->
    expect(param).to.exist

  describe "required check", ->

    it "should throw an error when required parameter is not passed", ->
      expect(-> param.required undefined).to.throw Error
      expect(-> param.required "s").to.not.throw Error

    it "should not accept null parameters by default", ->
      expect(-> param.required null).to.throw Error

    it "should allow null parameters if asked to do so", ->
      expect(-> param.required null, [], true).to.not.throw Error

    it "should verify parameter against a list of valid parameters", ->
      expect(-> param.required "s", ["t", "s", "v", "b"]).to.not.throw Error
      expect(-> param.required "s", ["t", "v", "b"]).to.throw Error

  describe "optional check", ->

    it "should not throw an error when argument is undefined", ->
      expect(-> param.optional undefined).to.not.throw Error

    it "should set default value if argument is undefined", ->
      expect(param.optional(undefined, "cat")).to.equal "cat"

    it "should verify parameter against a list of valid parameters", ->
      expect(-> param.optional "s", "c", ["t", "s", "b"]).to.not.throw Error
      expect(-> param.optional "s", "c", ["t", "v", "b"]).to.throw Error
##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

describe "AREEngine", ->

  # TODO: Structure tests so they follow each other, and create a proper
  # dev/-esque environment

  ###
    instance = new AREEngine

    validPackage =
      company: ""     # Owner
      apikey: ""      # APIKey
      load: ""        # Load function to prepare for scene execution
      scenes: {}      # Object containing numbered scenes

    describe "FPS property and methods", ->

      it "should default to 60FPS", ->
        expect(instance._framerate).to.equal 1.0 / 60.0

      it "should allow setting in FPS", ->
        instance.setFPS 30
        expect(instance._framerate).to.equal 1.0 / 30.0

    it "should verify a valid package.json", ->

      expect(instance.verifyPackage())
  ###

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

describe "ARERenderer", ->

  webGL = undefined
  instance = new ARERenderer()

  it "should provide width/height getters", ->
    expect(instance.getWidth()).to.equal 800
    expect(instance.getHeight()).to.equal 600

  it "should default to a context size of 800x600", ->
    expect(instance._width).to.equal 800
    expect(instance._height).to.equal 600

  it "should provide incremental ids for actors", ->
    initial = ARERenderer.getNextId()
    expect(ARERenderer.getNextId()).to.be.gt initial

  describe "coord conversion", ->

    # This is purely here to catch any changes to the PPM, we might break
    # it out in future versions
    it "should use a PPM of 128", ->
      expect(ARERenderer.getPPM()).to.equal 128
      expect(ARERenderer._PPM).to.equal 128

    it "should convert between screen and world coordinates", ->

      tVec = new cp.v 10, 10
      worldVec = ARERenderer.screenToWorld tVec
      screenVec = ARERenderer.worldToScreen tVec

      expect(worldVec.x).to.equal (10 / ARERenderer._PPM)
      expect(worldVec.y).to.equal (10 / ARERenderer._PPM)

      expect(screenVec.x).to.equal (10 * ARERenderer._PPM)
      expect(screenVec.y).to.equal (10 * ARERenderer._PPM)

  #  This fails in phantomjs, and wgl dependent tests don't execute
  try
    _c = document.getElementById "are_canvas"
    webGL = _c.getContext("webgl") || _c.getContext("experimental-webgl")
  catch e
    console.log e

  if webGL == null or webGL == undefined
    console.warn "WebGL not available, not executing all tests"
  else

    describe "WebGL dependent functionality", ->

      it "should initialize without error", ->
        expect(instance.initError).to.not.exist

      describe "clear color", ->

        it "should default to black", ->
          expect(instance._clearColor.getR false).to.equal 0
          expect(instance._clearColor.getG false).to.equal 0
          expect(instance._clearColor.getB false).to.equal 0

        it "should perform sanity checks on modification", ->
          instance.setClearColor 1244, 2354, 35892
          expect(instance._clearColor.getR false).to.equal 255
          expect(instance._clearColor.getG false).to.equal 255
          expect(instance._clearColor.getB false).to.equal 255

          instance.setClearColor 124, 124, 124
          expect(instance._clearColor.getR false).to.equal 124
          expect(instance._clearColor.getG false).to.equal 124
          expect(instance._clearColor.getB false).to.equal 124

      describe "gl context", ->

        it "should be created in the constructor", ->
          expect(ARERenderer._gl).to.exist

      describe "@actors", ->

        it "should be static and initialize empty", ->
          expect(ARERenderer.actors).to.be.an "array"
          expect(ARERenderer.actors).to.be.empty

        it "should be appended to when creating a new actor", ->

          verts = [
            -50, -50,
            -50,  50,
             50,  50,
             50, -50,
            -50, -50
          ]

          newActor = new ARERawActor verts

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

describe "AREPhysics", ->

  psyx = AREPhysics

  it "should not allow instantiation", ->
    expect(-> new AREPhysics).to.throw Error

  it "should some values set by default", ->
    expect(psyx.velIterations).to.exist
    expect(psyx.posIterations).to.exist
    expect(psyx.frameTime).to.exist
    expect(psyx._densityRatio).to.exist
    expect(psyx._gravity).to.exist

    expect(psyx.bodyCount).to.equal 0

  it "should not initialize with a world", ->
    expect(psyx._world).to.not.exist
    expect(psyx._stepIntervalId).to.not.exist

  it "should allow one to retrieve internal density ration", ->
    expect(psyx.getDensityRatio()).to.be.above 0

  it "should not return a valid world without stepping", ->
    expect(psyx.getWorld()).to.not.exist

  it "should allow for gravity setting regardless of world state", ->
    psyx.setGravity new cp.v -5.05, 0
    expect(psyx.getGravity().x).to.equal -5.05

  it "should allow the world to start stepping", ->
    psyx.startStepping()
    expect(psyx.getWorld()).to.exist
    expect(psyx._stepIntervalId).to.exist

  it "should allow the world to stop stepping", ->
    psyx.stopStepping()
    expect(psyx.getWorld()).to.not.exist
    expect(psyx._stepIntervalId).to.not.exist

  it "should preserve gravity across world changes", ->
    expect(psyx.getGravity().x).to.equal -5.05

  it "should not accept invalid gravity parameter", ->
    expect(-> psyx.setGravity(35)).to.throw Error
##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

#  This fails in phantomjs, and wgl dependent tests don't execute
try
  _c = document.getElementById "are_canvas"
  webGL = _c.getContext("webgl") || _c.getContext("experimental-webgl")
catch e
  console.log e

if webGL == null or webGL == undefined
  console.warn "WebGL not available, not executing AREInterface tests"
else

  if ARERenderer._gl == undefined or ARERenderer._gl == null
    throw new Error "ARERenderer tests must run before AREInterface tests!"

  describe "AREInterface", ->

    _i = new AREInterface

    it "should provide an actors interface", ->
      expect(_i.Actors()).to.exist

    describe "AREActorInterface", ->

      _actor = null
      _ai = _i.Actors()
      _verts = [
        -50, -50,
        -50,  50,
         50,  50,
         50, -50,
        -50, -50
      ]

      it "should only allow us to create actors with a JSON array of verts", ->
        expect(-> _ai.createActor _verts).to.throw Error
        expect(-> _ai.createActor JSON.stringify(_verts)).to.not.throw Error

      it "should allow us to create an actor, and provide us wtih the id", ->
        _verts = JSON.stringify _verts
        expect(-> _actor = _ai.createActor(_verts)).to.not.throw Error
        expect(typeof _actor).to.equal "number"

      it "should allow us to set the actors' position", ->
        expect(-> _ai.setActorPosition 0, 4.64, _actor).to.not.throw Error

      it "should allow us to get the actors' position as a JSON string", ->
        expect(typeof (_ai.getActorPosition _actor)).to.equal "string"

      it "should return a valid JSON position", ->
        expect(-> JSON.parse(_ai.getActorPosition _actor)).to.not.throw Error
        expect(JSON.parse(_ai.getActorPosition _actor).y).to.equal 4.64

      it "should allow us to set the actors' rotation", ->
        expect(-> _ai.setActorRotation 121, _actor).to.not.throw Error

      it "should allow us to get the actors' rotation", ->
        expect(Math.round(_ai.getActorRotation _actor)).to.equal 121
        expect(_ai.getActorRotation _actor, true).below 2.112
        expect(_ai.getActorRotation _actor, true).above 2.111

      it "should allow us to get and set rotation in radians and degrees", ->
        _ai.setActorRotation 1.2434, _actor, true
        expect(_ai.getActorRotation _actor, true).above 1.24
        expect(_ai.getActorRotation _actor, true).below 1.25
        expect(_ai.getActorRotation _actor).above 71
        expect(_ai.getActorRotation _actor).below 72

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

#  This fails in phantomjs, and wgl dependent tests don't execute
try
  _c = document.getElementById "are_canvas"
  webGL = _c.getContext("webgl") || _c.getContext("experimental-webgl")
catch e
  console.log e

if webGL == null or webGL == undefined
  console.warn "WebGL not available, not executing ARERawActor tests"
else

  if ARERenderer._gl == undefined or ARERenderer._gl == null
    throw new Error "ARERenderer tests have to run before ARERawActor tests!"

  describe "ARERawActor", ->

    _actor = null
    _verts = [
      -50, -50,
      -50,  50,
       50,  50,
       50, -50,
      -50, -50
    ]

    describe "instantiation", ->

      it "should require vertices to be created", ->
        expect(-> new ARERawActor).to.throw Error

      it "should require at least 6 vertices to be created", ->
        expect(-> new ARERawActor [0, 0, 0, 0, 0]).to.throw Error
        expect(-> _actor = new ARERawActor _verts).to.not.throw Error

      it "should instantiate with a unique id", ->
        _t = new ARERawActor _verts
        expect(_t.getId()).to.not.equal _actor.getId()

    describe "accessors", ->

      it "should expose its id", -> expect(_actor.getId).to.exist
      it "should expose its position", -> expect(_actor.getPosition).to.exist
      it "should expose its rotation", -> expect(_actor.getRotation).to.exist
      it "should expose its color", -> expect(_actor.getColor).to.exist

      it "should allow us to set its position", ->
        expect(_actor.setPosition).to.exist

      it "should allow us to set its rotation", ->
        expect(_actor.setRotation).to.exist

      it "should allow us to set its color", ->
        expect(_actor.setColor).to.exist

      # Just for kicks
      it "should not allow us to set its id", ->
        expect(_actor.setId).to.not.exist
        expect(_actor.setID).to.not.exist
        expect(_actor.setid).to.not.exist

    describe "physics body", ->

      AREPhysics.stopStepping()

      it "should provide default physics body values", ->
        expect(ARERawActor.defaultFriction).to.exist
        expect(ARERawActor.defaultMass).to.exist
        expect(ARERawActor.defaultElasticity).to.exist

      it "should not instantiate with a physics body", ->
        expect(_actor._body).to.not.exist

      it "should allow us to create a physics body with default properties", ->
        AREPhysics.startStepping()
        expect(-> _actor.createPhysicsBody(10)).to.not.throw Error

      it "should start stepping the world if it isn't already doing so", ->
        expect(AREPhysics.getWorld()).to.exist

      it "should store created body", ->
        expect(_actor._body).to.exist

      it "should allow us to destroy its physics body", ->
        expect(-> _actor.destroyPhysicsBody()).to.not.throw Error
        expect(_actor._body).to.not.exist

      it "should stop the world from stepping if no bodies exist", ->
        expect()

      it "should allow us to create a static body, and save only the shape", ->
        expect(-> _actor.createPhysicsBody()).to.not.throw Error
        expect(_actor._body).to.not.exist
        expect(_actor._shape).to.exist

    describe "draw routine", ->

      it "should allow itself to be drawn", ->
        expect(-> _actor.draw ARERenderer._gl).to.not.throw Error

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

#  This fails in phantomjs, and wgl dependent tests don't execute
try
  _c = document.getElementById "are_canvas"
  webGL = _c.getContext("webgl") || _c.getContext("experimental-webgl")
catch e
  console.log e

if webGL == null or webGL == undefined
  console.warn "WebGL not available, not executing AREShader tests"
else

  if ARERenderer._gl == undefined or ARERenderer._gl == null
    throw new Error "ARERenderer tests have to run before AREShader tests!"

  describe "AREShader", ->

    it "should require vert and frag sources, along with a gl context", ->
      expect(-> new AREShader).to.throw Error
      expect(-> new AREShader "").to.throw Error
      expect(-> new AREShader "", "").to.throw Error

    _test = null

    it "should properly compile a proper shader", ->

      vertSrc = "" +
        "attribute vec2 Position;" +
        "uniform mat4 Projection;" +
        "uniform mat4 ModelView;" +
        "void main() {" +
        "  mat4 mvp = Projection * ModelView;" +
        "  gl_Position = mvp * vec4(Position, 1, 1);" +
        "}\n"

      fragSrc = "" +
        "precision mediump float;" +
        "uniform vec4 Color;" +
        "void main() {" +
        "  gl_FragColor = Color;" +
        "}\n"

      _test = new AREShader vertSrc, fragSrc, ARERenderer._gl, true

      expect(_test.errors.length).to.equal 0

    it "should allow one to fetch the internal shader program", ->
      expect(_test.getProgram).to.exist

    it "should allow one to fetch generated handles", ->
      expect(_test.getHandles).to.exist

    it "should not provide any handles by default", ->
      expect(_test.getHandles()).to.equal.null

    it "should enumerate program properties and handles", ->
      expect(_test.generateHandles()).to.equal true

    it "should provide valid handles", ->

      _h = _test.getHandles()

      expect(_h["Position"]).to.exist
      expect(_h["Position"]).to.not.equal -1

      expect(_h["Projection"]).to.exist
      expect(_h["Projection"]).to.not.equal -1

      expect(_h["ModelView"]).to.exist
      expect(_h["ModelView"]).to.not.equal -1

      expect(_h["Color"]).to.exist
      expect(_h["Color"]).to.not.equal -1
##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

describe "AREColor3", ->

  test = new AREColor3()

  it "should initialize to black", ->
    expect(test._r).to.equal 0
    expect(test._g).to.equal 0
    expect(test._b).to.equal 0

  it "should convert to string as (0, 0, 0)", ->
    expect(test.toString()).to.equal "(0, 0, 0)"

  it "should cap components between 0 and 255", ->

    test.setR 500
    test.setG -100

    expect(test._r).to.equal 255
    expect(test._g).to.equal 0

  it "should provide components as ints", ->

    test.setR 124
    test.setG 212
    test.setB 35

    expect(test.getR()).to.equal 124
    expect(test.getG()).to.equal 212
    expect(test.getB()).to.equal 35

  it "should provide components as floats", ->

    test.setR 100
    test.setG 200

    expect(test.getR true).to.be.above 0.39
    expect(test.getR true).to.be.below 0.40
    expect(test.getG true).to.be.above 0.78
    expect(test.getG true).to.be.below 0.79

##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

# Same concept as ARE.coffee, lets us concat the tests in order for compiling
#
# @depend spec/TAREEnv.coffee
#
# @depend spec/util/TAREAjax.coffee
# @depend spec/util/TARELog.coffee
# @depend spec/util/TAREUtilParam.coffee
#
# @depend spec/TAREEngine.coffee
# @depend spec/TARERenderer.coffee
# @depend spec/TAREPhysics.coffee
# @depend spec/TAREInterface.coffee
#
# @depend spec/objects/TAREActor.coffee
# @depend spec/objects/TAREShader.coffee
# @depend spec/objects/TAREColor3.coffee
