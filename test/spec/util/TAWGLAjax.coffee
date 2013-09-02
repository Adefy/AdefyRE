describe "TAWGLAjax", ->

  a = new AWGLAjax

  it "should start with an empty queue", ->
    expect(a.busy).to.be.false
    expect(a.queue.length).to.equal 0

  it "should provide a request method", ->
    expect(a.r).to.exist

  it "should allow for multiple requests", (done) ->
    _count = 0

    a.r "localhost", ->
      _count++
      if _count == 3 then done()

    a.r "localhost", ->
      _count++
      if _count == 3 then done()

    a.r "localhost", ->
      _count++
      if _count == 3 then done()