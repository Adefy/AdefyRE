##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

describe "AWGL Environment", ->

  before ->
    # Set up loglevel
    AWGLEngine.level = 4

  it "should provide chipmunk-js", -> expect(window.cp).to.exist
  it "should provide underscore.js", -> expect(window._).to.exist
  it "should provide microajax", -> expect(window.microAjax).to.exist

  describe "AWGLEngine._log", ->

    it "should exist", ->
      expect(AWGLEngine).to.exist

    it "should have a log level of 4", ->
      expect(AWGLEngine.level).to.equal 4
