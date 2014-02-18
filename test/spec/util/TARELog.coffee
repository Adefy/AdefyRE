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