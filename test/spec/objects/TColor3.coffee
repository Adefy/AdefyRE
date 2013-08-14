describe "AWGLColor3", ->

  test = new AWGLColor3()

  it "should initialize to black", ->
    expect(test._r).to.equal 0
    expect(test._g).to.equal 0
    expect(test._b).to.equal 0

  it "should convert to string as (0, 0, 0)", ->
    expect(test.toString()).to.equal "(0, 0, 0)"

  it "should cap components between 0 and 255", ->

    test.setR 500
    test.setG -100

    expect(test._r).to.equal 255
    expect(test._g).to.equal 0

  it "should provide components as ints", ->

    test.setR 124
    test.setG 212
    test.setB 35

    expect(test.getR()).to.equal 124
    expect(test.getG()).to.equal 212
    expect(test.getB()).to.equal 35

  it "should provide components as floats", ->

    test.setR 100
    test.setG 200

    expect(test.getR true).to.be.above 0.39
    expect(test.getR true).to.be.below 0.40
    expect(test.getG true).to.be.above 0.78
    expect(test.getG true).to.be.below 0.79
