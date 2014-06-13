window.ENGINE_WIDTH = ENGINE_WIDTH = 400
window.ENGINE_HEIGHT = ENGINE_HEIGHT = 400
window.ENGINE_LOG_LEVEL = ENGINE_LOG_LEVEL = 1
window.ENGINE_ID = ENGINE_ID = "#are-parent"

initEngine = (done) ->
  window.AdefyRE.Engine().initialize ENGINE_WIDTH, ENGINE_HEIGHT, (engine) ->

    expect(engine).to.be.an.instanceof ARE
    done()

  , ENGINE_LOG_LEVEL, ENGINE_ID
