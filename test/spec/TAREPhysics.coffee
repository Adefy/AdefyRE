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