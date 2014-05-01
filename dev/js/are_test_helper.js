refreshRendererMode = function() {
  var modestr = "N/A";
  if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_WGL)
    modestr = "WebGL";
  else if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_CANVAS)
    modestr = "Canvas";

  document.getElementById("RendererMode").innerHTML = modestr;
}

refreshActorCount = function() {
  document.getElementById("ActorCount").innerHTML = ARERenderer.actors.length;
}

startActorCountInterval = function() {
  refreshActorCount();
  setInterval(function() {
    refreshActorCount();
  }, 500);
}
