#  This fails in phantomjs, and wgl dependent tests don't execute
try
  _c = document.getElementById "awgl_canvas"
  webGL = _c.getContext("webgl") || _c.getContext("experimental-webgl")
catch e
  console.log e

if webGL == null or webGL == undefined
  console.warn "WebGL not available, not executing AWGLInterface tests"
else

  if AWGLRenderer._gl == undefined or AWGLRenderer._gl == null
    throw new Error "AWGLRenderer tests must run before AWGLInterface tests!"

  describe "AWGLInterface", ->

    _i = new AWGLInterface

    it "should provide an actors interface", ->
      expect(_i.Actors()).to.exist

    describe "AWGLActorInterface", ->

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