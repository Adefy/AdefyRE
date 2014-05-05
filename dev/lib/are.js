var ARE;

ARE = {
  config: {
    deps: {
      physics: {
        chipmunk: "/components/chipmunk/cp.js",
        koon: "/lib/koon/koon.js",
        physics_worker: "/lib/physics/worker.js"
      }
    }
  },
  Version: {
    MAJOR: 1,
    MINOR: 1,
    PATCH: 2,
    BUILD: null,
    STRING: "1.1.2"
  }
};

window.AdefyGLI = window.AdefyRE = new AREInterface;
