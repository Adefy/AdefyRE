describe "AWGLUtilParam", ->

  it "should be avaliable globally", ->
    expect(param).to.exist

  describe "required check", ->

    it "should throw an error when required parameter is not passed", ->
      expect(-> param.required undefined).to.throw Error
      expect(-> param.required "s").to.not.throw Error

    it "should not accept null parameters by default", ->
      expect(-> param.required null).to.throw Error

    it "should allow null parameters if asked to do so", ->
      expect(-> param.required null, [], true).to.not.throw Error

    it "should verify parameter against a list of valid parameters", ->
      expect(-> param.required "s", ["t", "s", "v", "b"]).to.not.throw Error
      expect(-> param.required "s", ["t", "v", "b"]).to.throw Error

  describe "optional check", ->

    it "should not throw an error when argument is undefined", ->
      expect(-> param.optional undefined).to.not.throw Error

    it "should set default value if argument is undefined", ->
      expect(param.optional(undefined, "cat")).to.equal "cat"

    it "should verify parameter against a list of valid parameters", ->
      expect(-> param.optional "s", "c", ["t", "s", "b"]).to.not.throw Error
      expect(-> param.optional "s", "c", ["t", "v", "b"]).to.throw Error