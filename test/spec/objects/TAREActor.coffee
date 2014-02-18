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
