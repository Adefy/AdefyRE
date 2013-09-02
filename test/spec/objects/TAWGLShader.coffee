#  This fails in phantomjs, and wgl dependent tests don't execute
try
  _c = document.getElementById "awgl_canvas"
  webGL = _c.getContext("webgl") || _c.getContext("experimental-webgl")
catch e
  console.log e

if webGL == null or webGL == undefined
  console.warn "WebGL not available, not executing AWGLShader tests"
else

  if AWGLRenderer._gl == undefined or AWGLRenderer._gl == null
    throw new Error "AWGLRenderer tests have to run before AWGLShader tests!"

  describe "AWGLShader", ->

    it "should require vert and frag sources, along with a gl context", ->
      expect(-> new AWGLShader).to.throw Error
      expect(-> new AWGLShader "").to.throw Error
      expect(-> new AWGLShader "", "").to.throw Error

    _test = null

    it "should properly compile a proper shader", ->

      vertSrc = "" +
        "attribute vec2 Position;" +
        "uniform mat4 Projection;" +
        "uniform mat4 ModelView;" +
        "void main() {" +
        "  mat4 mvp = Projection * ModelView;" +
        "  gl_Position = mvp * vec4(Position, 1, 1);" +
        "}\n"

      fragSrc = "" +
        "precision mediump float;" +
        "uniform vec4 Color;" +
        "void main() {" +
        "  gl_FragColor = Color;" +
        "}\n"

      _test = new AWGLShader vertSrc, fragSrc, AWGLRenderer._gl, true

      expect(_test.errors.length).to.equal 0

    it "should allow one to fetch the internal shader program", ->
      expect(_test.getProgram).to.exist

    it "should allow one to fetch generated handles", ->
      expect(_test.getHandles).to.exist

    it "should not provide any handles by default", ->
      expect(_test.getHandles()).to.equal.null

    it "should enumerate program properties and handles", ->
      expect(_test.generateHandles()).to.equal true

    it "should provide valid handles", ->

      _h = _test.getHandles()

      expect(_h["Position"]).to.exist
      expect(_h["Position"]).to.not.equal -1

      expect(_h["Projection"]).to.exist
      expect(_h["Projection"]).to.not.equal -1

      expect(_h["ModelView"]).to.exist
      expect(_h["ModelView"]).to.not.equal -1

      expect(_h["Color"]).to.exist
      expect(_h["Color"]).to.not.equal -1