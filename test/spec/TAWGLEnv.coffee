describe "AWGL Environment", ->

  before ->
    # Set up loglevel
    AWGLEngine._log.level = 4

  it "should provide chipmunk-js", -> expect(window.cp).to.exist
  it "should provide underscore.js", -> expect(window._).to.exist
  it "should provide microajax", -> expect(window.microAjax).to.exist

  describe "AWGLEngine._log", ->

    it "should exist", ->
      expect(AWGLEngine._log).to.exist

    it "should have a log level of 4", ->
      expect(AWGLEngine._log.level).to.equal 4
