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
