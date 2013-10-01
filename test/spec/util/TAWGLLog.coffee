##
## Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved
##

describe "AWGLLog", ->

  it "should have a static logging function", ->
    expect(AWGLLog.w).to.exist

  it "should have a default log level of 4", ->
    expect(AWGLLog.level).to.equal 4

  it "should provide 5 default tags", ->
    expect(AWGLLog.tags.length).to.equal 5

  it "should provide an error function", ->
    expect(AWGLLog.error).to.exist

  it "should provide a warn function", ->
    expect(AWGLLog.warn).to.exist

  it "should provide a debug function", ->
    expect(AWGLLog.debug).to.exist

  it "should provide an info function", ->
    expect(AWGLLog.info).to.exist