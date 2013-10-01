##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

describe "AWGLEngine", ->

  # TODO: Structure tests so they follow each other, and create a proper
  # dev/-esque environment

  ###
    instance = new AWGLEngine

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
