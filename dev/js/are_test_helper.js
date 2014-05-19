refreshRendererMode = function() {
  var modestr = "N/A";
  if (window.renderer.isWGLRendererActive())
    modestr = "WebGL";
  else if(window.renderer.isCanvasRendererActive())
    modestr = "Canvas";

  document.getElementById("RendererMode").innerHTML = modestr;
}

refreshActorCount = function() {
  document.getElementById("ActorCount").innerHTML = window.renderer._actors.length;
}

startActorCountInterval = function() {
  refreshActorCount();
  setInterval(function() {
    refreshActorCount();
  }, 500);
}
