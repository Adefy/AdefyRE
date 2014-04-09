window.reutil = {}

window.reutil.rand = function(n) {
  return Math.floor(Math.random() * n);
}

window.reutil.sample = function(a) {
  return a[Math.floor(Math.random() * a.length)];
}