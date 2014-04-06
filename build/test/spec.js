var e, webGL, _c;

describe("ARE Environment", function() {
  it("should provide chipmunk-js", function() {
    return expect(window.cp).to.exist;
  });
  return it("should provide underscore.js", function() {
    return expect(window._).to.exist;
  });
});

describe("TAREAjax", function() {
  var a;
  a = new AREAjax;
  it("should start with an empty queue", function() {
    expect(a.busy).to.be["false"];
    return expect(a.queue.length).to.equal(0);
  });
  it("should provide a request method", function() {
    return expect(a.r).to.exist;
  });
  return it("should allow for multiple requests", function(done) {
    var _count;
    _count = 0;
    a.r("localhost", function() {
      _count++;
      if (_count === 3) {
        return done();
      }
    });
    a.r("localhost", function() {
      _count++;
      if (_count === 3) {
        return done();
      }
    });
    return a.r("localhost", function() {
      _count++;
      if (_count === 3) {
        return done();
      }
    });
  });
});

describe("ARELog", function() {
  it("should have a static logging function", function() {
    return expect(ARELog.w).to.exist;
  });
  it("should have a default log level of 4", function() {
    return expect(ARELog.level).to.equal(4);
  });
  it("should provide 5 default tags", function() {
    return expect(ARELog.tags.length).to.equal(5);
  });
  it("should provide an error function", function() {
    return expect(ARELog.error).to.exist;
  });
  it("should provide a warn function", function() {
    return expect(ARELog.warn).to.exist;
  });
  it("should provide a debug function", function() {
    return expect(ARELog.debug).to.exist;
  });
  return it("should provide an info function", function() {
    return expect(ARELog.info).to.exist;
  });
});

describe("AREUtilParam", function() {
  it("should be avaliable globally", function() {
    return expect(param).to.exist;
  });
  describe("required check", function() {
    it("should throw an error when required parameter is not passed", function() {
      expect(function() {
        return param.required(void 0);
      }).to["throw"](Error);
      return expect(function() {
        return param.required("s");
      }).to.not["throw"](Error);
    });
    it("should not accept null parameters by default", function() {
      return expect(function() {
        return param.required(null);
      }).to["throw"](Error);
    });
    it("should allow null parameters if asked to do so", function() {
      return expect(function() {
        return param.required(null, [], true);
      }).to.not["throw"](Error);
    });
    return it("should verify parameter against a list of valid parameters", function() {
      expect(function() {
        return param.required("s", ["t", "s", "v", "b"]);
      }).to.not["throw"](Error);
      return expect(function() {
        return param.required("s", ["t", "v", "b"]);
      }).to["throw"](Error);
    });
  });
  return describe("optional check", function() {
    it("should not throw an error when argument is undefined", function() {
      return expect(function() {
        return param.optional(void 0);
      }).to.not["throw"](Error);
    });
    it("should set default value if argument is undefined", function() {
      return expect(param.optional(void 0, "cat")).to.equal("cat");
    });
    return it("should verify parameter against a list of valid parameters", function() {
      expect(function() {
        return param.optional("s", "c", ["t", "s", "b"]);
      }).to.not["throw"](Error);
      return expect(function() {
        return param.optional("s", "c", ["t", "v", "b"]);
      }).to["throw"](Error);
    });
  });
});

describe("AREEngine", function() {

  /*
    instance = new AREEngine
  
    validPackage =
      company: ""     # Owner
      apikey: ""      # APIKey
      load: ""        # Load function to prepare for scene execution
      scenes: {}      # Object containing numbered scenes
  
    describe "FPS property and methods", ->
  
      it "should default to 60FPS", ->
        expect(instance._framerate).to.equal 1.0 / 60.0
  
      it "should allow setting in FPS", ->
        instance.setFPS 30
        expect(instance._framerate).to.equal 1.0 / 30.0
  
    it "should verify a valid package.json", ->
  
      expect(instance.verifyPackage())
   */
});

describe("ARERenderer", function() {
  var e, instance, webGL, _c;
  webGL = void 0;
  instance = new ARERenderer();
  it("should provide width/height getters", function() {
    expect(instance.getWidth()).to.equal(800);
    return expect(instance.getHeight()).to.equal(600);
  });
  it("should default to a context size of 800x600", function() {
    expect(instance._width).to.equal(800);
    return expect(instance._height).to.equal(600);
  });
  it("should provide incremental ids for actors", function() {
    var initial;
    initial = ARERenderer.getNextId();
    return expect(ARERenderer.getNextId()).to.be.gt(initial);
  });
  describe("coord conversion", function() {
    it("should use a PPM of 128", function() {
      expect(ARERenderer.getPPM()).to.equal(128);
      return expect(ARERenderer._PPM).to.equal(128);
    });
    return it("should convert between screen and world coordinates", function() {
      var screenVec, tVec, worldVec;
      tVec = new cp.v(10, 10);
      worldVec = ARERenderer.screenToWorld(tVec);
      screenVec = ARERenderer.worldToScreen(tVec);
      expect(worldVec.x).to.equal(10 / ARERenderer._PPM);
      expect(worldVec.y).to.equal(10 / ARERenderer._PPM);
      expect(screenVec.x).to.equal(10 * ARERenderer._PPM);
      return expect(screenVec.y).to.equal(10 * ARERenderer._PPM);
    });
  });
  try {
    _c = document.getElementById("are_canvas");
    webGL = _c.getContext("webgl") || _c.getContext("experimental-webgl");
  } catch (_error) {
    e = _error;
    console.log(e);
  }
  if (webGL === null || webGL === void 0) {
    return console.warn("WebGL not available, not executing all tests");
  } else {
    return describe("WebGL dependent functionality", function() {
      it("should initialize without error", function() {
        return expect(instance.initError).to.not.exist;
      });
      describe("clear color", function() {
        it("should default to black", function() {
          expect(instance._clearColor.getR(false)).to.equal(0);
          expect(instance._clearColor.getG(false)).to.equal(0);
          return expect(instance._clearColor.getB(false)).to.equal(0);
        });
        return it("should perform sanity checks on modification", function() {
          instance.setClearColor(1244, 2354, 35892);
          expect(instance._clearColor.getR(false)).to.equal(255);
          expect(instance._clearColor.getG(false)).to.equal(255);
          expect(instance._clearColor.getB(false)).to.equal(255);
          instance.setClearColor(124, 124, 124);
          expect(instance._clearColor.getR(false)).to.equal(124);
          expect(instance._clearColor.getG(false)).to.equal(124);
          return expect(instance._clearColor.getB(false)).to.equal(124);
        });
      });
      describe("gl context", function() {
        return it("should be created in the constructor", function() {
          return expect(ARERenderer._gl).to.exist;
        });
      });
      return describe("@actors", function() {
        it("should be static and initialize empty", function() {
          expect(ARERenderer.actors).to.be.an("array");
          return expect(ARERenderer.actors).to.be.empty;
        });
        return it("should be appended to when creating a new actor", function() {
          var newActor, verts;
          verts = [-50, -50, -50, 50, 50, 50, 50, -50, -50, -50];
          return newActor = new ARERawActor(verts);
        });
      });
    });
  }
});

describe("AREPhysics", function() {
  var psyx;
  psyx = AREPhysics;
  it("should not allow instantiation", function() {
    return expect(function() {
      return new AREPhysics;
    }).to["throw"](Error);
  });
  it("should some values set by default", function() {
    expect(psyx.velIterations).to.exist;
    expect(psyx.posIterations).to.exist;
    expect(psyx.frameTime).to.exist;
    expect(psyx._densityRatio).to.exist;
    expect(psyx._gravity).to.exist;
    return expect(psyx.bodyCount).to.equal(0);
  });
  it("should not initialize with a world", function() {
    expect(psyx._world).to.not.exist;
    return expect(psyx._stepIntervalId).to.not.exist;
  });
  it("should allow one to retrieve internal density ration", function() {
    return expect(psyx.getDensityRatio()).to.be.above(0);
  });
  it("should not return a valid world without stepping", function() {
    return expect(psyx.getWorld()).to.not.exist;
  });
  it("should allow for gravity setting regardless of world state", function() {
    psyx.setGravity(new cp.v(-5.05, 0));
    return expect(psyx.getGravity().x).to.equal(-5.05);
  });
  it("should allow the world to start stepping", function() {
    psyx.startStepping();
    expect(psyx.getWorld()).to.exist;
    return expect(psyx._stepIntervalId).to.exist;
  });
  it("should allow the world to stop stepping", function() {
    psyx.stopStepping();
    expect(psyx.getWorld()).to.not.exist;
    return expect(psyx._stepIntervalId).to.not.exist;
  });
  it("should preserve gravity across world changes", function() {
    return expect(psyx.getGravity().x).to.equal(-5.05);
  });
  return it("should not accept invalid gravity parameter", function() {
    return expect(function() {
      return psyx.setGravity(35);
    }).to["throw"](Error);
  });
});

try {
  _c = document.getElementById("are_canvas");
  webGL = _c.getContext("webgl") || _c.getContext("experimental-webgl");
} catch (_error) {
  e = _error;
  console.log(e);
}

if (webGL === null || webGL === void 0) {
  console.warn("WebGL not available, not executing AREInterface tests");
} else {
  if (ARERenderer._gl === void 0 || ARERenderer._gl === null) {
    throw new Error("ARERenderer tests must run before AREInterface tests!");
  }
  describe("AREInterface", function() {
    var _i;
    _i = new AREInterface;
    it("should provide an actors interface", function() {
      return expect(_i.Actors()).to.exist;
    });
    return describe("AREActorInterface", function() {
      var _actor, _ai, _verts;
      _actor = null;
      _ai = _i.Actors();
      _verts = [-50, -50, -50, 50, 50, 50, 50, -50, -50, -50];
      it("should only allow us to create actors with a JSON array of verts", function() {
        expect(function() {
          return _ai.createActor(_verts);
        }).to["throw"](Error);
        return expect(function() {
          return _ai.createActor(JSON.stringify(_verts));
        }).to.not["throw"](Error);
      });
      it("should allow us to create an actor, and provide us wtih the id", function() {
        _verts = JSON.stringify(_verts);
        expect(function() {
          return _actor = _ai.createActor(_verts);
        }).to.not["throw"](Error);
        return expect(typeof _actor).to.equal("number");
      });
      it("should allow us to set the actors' position", function() {
        return expect(function() {
          return _ai.setActorPosition(0, 4.64, _actor);
        }).to.not["throw"](Error);
      });
      it("should allow us to get the actors' position as a JSON string", function() {
        return expect(typeof (_ai.getActorPosition(_actor))).to.equal("string");
      });
      it("should return a valid JSON position", function() {
        expect(function() {
          return JSON.parse(_ai.getActorPosition(_actor));
        }).to.not["throw"](Error);
        return expect(JSON.parse(_ai.getActorPosition(_actor)).y).to.equal(4.64);
      });
      it("should allow us to set the actors' rotation", function() {
        return expect(function() {
          return _ai.setActorRotation(121, _actor);
        }).to.not["throw"](Error);
      });
      it("should allow us to get the actors' rotation", function() {
        expect(Math.round(_ai.getActorRotation(_actor))).to.equal(121);
        expect(_ai.getActorRotation(_actor, true)).below(2.112);
        return expect(_ai.getActorRotation(_actor, true)).above(2.111);
      });
      return it("should allow us to get and set rotation in radians and degrees", function() {
        _ai.setActorRotation(1.2434, _actor, true);
        expect(_ai.getActorRotation(_actor, true)).above(1.24);
        expect(_ai.getActorRotation(_actor, true)).below(1.25);
        expect(_ai.getActorRotation(_actor)).above(71);
        return expect(_ai.getActorRotation(_actor)).below(72);
      });
    });
  });
}

try {
  _c = document.getElementById("are_canvas");
  webGL = _c.getContext("webgl") || _c.getContext("experimental-webgl");
} catch (_error) {
  e = _error;
  console.log(e);
}

if (webGL === null || webGL === void 0) {
  console.warn("WebGL not available, not executing ARERawActor tests");
} else {
  if (ARERenderer._gl === void 0 || ARERenderer._gl === null) {
    throw new Error("ARERenderer tests have to run before ARERawActor tests!");
  }
  describe("ARERawActor", function() {
    var _actor, _verts;
    _actor = null;
    _verts = [-50, -50, -50, 50, 50, 50, 50, -50, -50, -50];
    describe("instantiation", function() {
      it("should require vertices to be created", function() {
        return expect(function() {
          return new ARERawActor;
        }).to["throw"](Error);
      });
      it("should require at least 6 vertices to be created", function() {
        expect(function() {
          return new ARERawActor([0, 0, 0, 0, 0]);
        }).to["throw"](Error);
        return expect(function() {
          return _actor = new ARERawActor(_verts);
        }).to.not["throw"](Error);
      });
      return it("should instantiate with a unique id", function() {
        var _t;
        _t = new ARERawActor(_verts);
        return expect(_t.getId()).to.not.equal(_actor.getId());
      });
    });
    describe("accessors", function() {
      it("should expose its id", function() {
        return expect(_actor.getId).to.exist;
      });
      it("should expose its position", function() {
        return expect(_actor.getPosition).to.exist;
      });
      it("should expose its rotation", function() {
        return expect(_actor.getRotation).to.exist;
      });
      it("should expose its color", function() {
        return expect(_actor.getColor).to.exist;
      });
      it("should allow us to set its position", function() {
        return expect(_actor.setPosition).to.exist;
      });
      it("should allow us to set its rotation", function() {
        return expect(_actor.setRotation).to.exist;
      });
      it("should allow us to set its color", function() {
        return expect(_actor.setColor).to.exist;
      });
      return it("should not allow us to set its id", function() {
        expect(_actor.setId).to.not.exist;
        expect(_actor.setID).to.not.exist;
        return expect(_actor.setid).to.not.exist;
      });
    });
    describe("physics body", function() {
      AREPhysics.stopStepping();
      it("should provide default physics body values", function() {
        expect(ARERawActor.defaultFriction).to.exist;
        expect(ARERawActor.defaultMass).to.exist;
        return expect(ARERawActor.defaultElasticity).to.exist;
      });
      it("should not instantiate with a physics body", function() {
        return expect(_actor._body).to.not.exist;
      });
      it("should allow us to create a physics body with default properties", function() {
        AREPhysics.startStepping();
        return expect(function() {
          return _actor.createPhysicsBody(10);
        }).to.not["throw"](Error);
      });
      it("should start stepping the world if it isn't already doing so", function() {
        return expect(AREPhysics.getWorld()).to.exist;
      });
      it("should store created body", function() {
        return expect(_actor._body).to.exist;
      });
      it("should allow us to destroy its physics body", function() {
        expect(function() {
          return _actor.destroyPhysicsBody();
        }).to.not["throw"](Error);
        return expect(_actor._body).to.not.exist;
      });
      it("should stop the world from stepping if no bodies exist", function() {
        return expect();
      });
      return it("should allow us to create a static body, and save only the shape", function() {
        expect(function() {
          return _actor.createPhysicsBody();
        }).to.not["throw"](Error);
        expect(_actor._body).to.not.exist;
        return expect(_actor._shape).to.exist;
      });
    });
    return describe("draw routine", function() {
      return it("should allow itself to be drawn", function() {
        return expect(function() {
          return _actor.draw(ARERenderer._gl);
        }).to.not["throw"](Error);
      });
    });
  });
}

try {
  _c = document.getElementById("are_canvas");
  webGL = _c.getContext("webgl") || _c.getContext("experimental-webgl");
} catch (_error) {
  e = _error;
  console.log(e);
}

if (webGL === null || webGL === void 0) {
  console.warn("WebGL not available, not executing AREShader tests");
} else {
  if (ARERenderer._gl === void 0 || ARERenderer._gl === null) {
    throw new Error("ARERenderer tests have to run before AREShader tests!");
  }
  describe("AREShader", function() {
    var _test;
    it("should require vert and frag sources, along with a gl context", function() {
      expect(function() {
        return new AREShader;
      }).to["throw"](Error);
      expect(function() {
        return new AREShader("");
      }).to["throw"](Error);
      return expect(function() {
        return new AREShader("", "");
      }).to["throw"](Error);
    });
    _test = null;
    it("should properly compile a proper shader", function() {
      var fragSrc, vertSrc;
      vertSrc = "" + "attribute vec2 Position;" + "uniform mat4 Projection;" + "uniform mat4 ModelView;" + "void main() {" + "  mat4 mvp = Projection * ModelView;" + "  gl_Position = mvp * vec4(Position, 1, 1);" + "}\n";
      fragSrc = "" + "precision mediump float;" + "uniform vec4 Color;" + "void main() {" + "  gl_FragColor = Color;" + "}\n";
      _test = new AREShader(vertSrc, fragSrc, ARERenderer._gl, true);
      return expect(_test.errors.length).to.equal(0);
    });
    it("should allow one to fetch the internal shader program", function() {
      return expect(_test.getProgram).to.exist;
    });
    it("should allow one to fetch generated handles", function() {
      return expect(_test.getHandles).to.exist;
    });
    it("should not provide any handles by default", function() {
      return expect(_test.getHandles()).to.equal["null"];
    });
    it("should enumerate program properties and handles", function() {
      return expect(_test.generateHandles()).to.equal(true);
    });
    return it("should provide valid handles", function() {
      var _h;
      _h = _test.getHandles();
      expect(_h["Position"]).to.exist;
      expect(_h["Position"]).to.not.equal(-1);
      expect(_h["Projection"]).to.exist;
      expect(_h["Projection"]).to.not.equal(-1);
      expect(_h["ModelView"]).to.exist;
      expect(_h["ModelView"]).to.not.equal(-1);
      expect(_h["Color"]).to.exist;
      return expect(_h["Color"]).to.not.equal(-1);
    });
  });
}

describe("AREColor3", function() {
  var test;
  test = new AREColor3();
  it("should initialize to black", function() {
    expect(test._r).to.equal(0);
    expect(test._g).to.equal(0);
    return expect(test._b).to.equal(0);
  });
  it("should convert to string as (0, 0, 0)", function() {
    return expect(test.toString()).to.equal("(0, 0, 0)");
  });
  it("should cap components between 0 and 255", function() {
    test.setR(500);
    test.setG(-100);
    expect(test._r).to.equal(255);
    return expect(test._g).to.equal(0);
  });
  it("should provide components as ints", function() {
    test.setR(124);
    test.setG(212);
    test.setB(35);
    expect(test.getR()).to.equal(124);
    expect(test.getG()).to.equal(212);
    return expect(test.getB()).to.equal(35);
  });
  return it("should provide components as floats", function() {
    test.setR(100);
    test.setG(200);
    expect(test.getR(true)).to.be.above(0.39);
    expect(test.getR(true)).to.be.below(0.40);
    expect(test.getG(true)).to.be.above(0.78);
    return expect(test.getG(true)).to.be.below(0.79);
  });
});
