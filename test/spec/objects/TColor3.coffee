describe "AWGLColor3", ->

  test = new AWGLColor3()

  it "should initialize to black", ->
    expect(test._r).to.equal 0
    expect(test._g).to.equal 0
    expect(test._b).to.equal 0

  it "should convert to string as (0, 0, 0)", ->
    expect(test.toString()).to.equal "(0, 0, 0)"
