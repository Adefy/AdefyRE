##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

describe "ARE Environment", ->

  it "should provide chipmunk-js", -> expect(window.cp).to.exist
  it "should provide underscore.js", -> expect(window._).to.exist
