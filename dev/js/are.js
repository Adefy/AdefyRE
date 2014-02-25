var AREActorInterface, AREAnimationInterface, AREBezAnimation, ARECircleActor, AREColor3, AREEngine, AREEngineInterface, AREInterface, ARELog, AREPhysics, AREPolygonActor, AREPsyxAnimation, ARERawActor, ARERectangleActor, ARERenderer, AREShader, AREUtilParam, AREVertAnimation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AREUtilParam = (function() {
  function AREUtilParam() {}

  AREUtilParam.required = function(p, valid, canBeNull) {
    var isValid, v, _i, _len;
    if (p === null && canBeNull !== true) {
      p = void 0;
    }
    if (p === void 0) {
      throw new Error("Required argument missing!");
    }
    if (valid instanceof Array) {
      if (valid.length > 0) {
        isValid = false;
        for (_i = 0, _len = valid.length; _i < _len; _i++) {
          v = valid[_i];
          if (p === v) {
            isValid = true;
            break;
          }
        }
        if (!isValid) {
          throw new Error("Required argument is not of a valid value!");
        }
      }
    }
    return p;
  };

  AREUtilParam.optional = function(p, def, valid, canBeNull) {
    var isValid, v, _i, _len;
    if (p === null && canBeNull !== true) {
      p = void 0;
    }
    if (p === void 0) {
      p = def;
    }
    if (valid instanceof Array) {
      if (valid.length > 0) {
        isValid = false;
        for (_i = 0, _len = valid.length; _i < _len; _i++) {
          v = valid[_i];
          if (p === v) {
            isValid = true;
            break;
          }
        }
        if (!isValid) {
          throw new Error("Required argument is not of a valid value!");
        }
      }
    }
    return p;
  };

  return AREUtilParam;

})();

if (window.param === void 0) {
  window.param = AREUtilParam;
}

ARERawActor = (function() {
  ARERawActor.defaultFriction = 0.3;

  ARERawActor.defaultMass = 10;

  ARERawActor.defaultElasticity = 0.2;

  ARERawActor._nullV = new cp.v(0, 0);

  function ARERawActor(verts, texverts) {
    param.required(verts);
    texverts = param.optional(texverts, null);
    this._initializeValues();
    this._registerWithRenderer();
    this.updateVertices(verts, texverts);
    this.setColor(new AREColor3(255, 255, 255));
    this.clearTexture();
  }

  ARERawActor.prototype._registerWithRenderer = function() {
    this._id = ARERenderer.getNextId();
    return ARERenderer.addActor(this);
  };

  ARERawActor.prototype._initializeValues = function() {
    if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_WGL) {
      this._gl = ARERenderer._gl;
      if (this._gl === void 0 || this._gl === null) {
        throw new Error("GL context is required for actor initialization!");
      }
    }
    this._rotV = new Vector3([0, 0, 1]);
    this._transV = new Vector3([0, 0, 1]);
    this._modelM = new Matrix4();
    this._color = null;
    this._stroke_color = null;
    this._colArray = null;
    this.lit = false;
    this.visible = true;
    this.layer = 0;
    this._physicsLayer = ~0;
    this._id = -1;
    this._position = new cp.v(0, 0);
    this._rotation = 0;
    this._size = {
      x: 0,
      y: 0
    };
    this._shape = null;
    this._body = null;
    this._friction = null;
    this._mass = null;
    this._elasticity = null;
    this._vertices = [];
    this._psyxVertices = [];
    this._texVerts = [];
    this._origTexVerts = [];
    this._vertBuffer = null;
    this._vertBufferFloats = null;
    this._sh_modelview = null;
    this._sh_position = null;
    this._sh_color = null;
    this._renderMode = 2;
    this._attachedTexture = null;
    return this.attachedTextureAnchor = {
      x: 0,
      y: 0,
      angle: 0
    };
  };

  ARERawActor.prototype.destroy = function() {
    var space;
    space = AREPhysics.getWorld();
    if (this._body) {
      space.removeBody(this._body);
    }
    if (this._shape) {
      return space.removeShape(this._shape);
    }
  };

  ARERawActor.prototype.getMaterial = function() {
    return this._material;
  };

  ARERawActor.prototype.setLayer = function(layer) {
    this.layer = param.required(layer);
    ARERenderer.removeActor(this);
    return ARERenderer.addActor(this);
  };

  ARERawActor.prototype.setTexture = function(name) {
    param.required(name);
    if (!ARERenderer.hasTexture(name)) {
      throw new Error("No such texture loaded: " + name);
      return;
    }
    this._texture = ARERenderer.getTexture(name);
    this.setShader(ARERenderer.getMe().getTextureShader());
    this._material = "texture";
    return this;
  };

  ARERawActor.prototype.clearTexture = function() {
    this._texture = void 0;
    this.setShader(ARERenderer.getMe().getDefaultShader());
    return this._material = "flat";
  };

  ARERawActor.prototype.getTexture = function() {
    return this._texture;
  };

  ARERawActor.prototype.setShader = function(shader) {
    var handles;
    if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_WGL) {
      param.required(shader);
      if (shader.getProgram() === null) {
        throw new Error("Shader has to be built before it can be used!");
      }
      if (shader.getHandles() === null) {
        shader.generateHandles();
      }
      handles = shader.getHandles();
      this._sh_modelview = handles["ModelView"];
      this._sh_position = handles["Position"];
      this._sh_color = handles["Color"];
      this._sh_texture = handles["aTexCoord"];
      return this._sh_sampler = handles["uSampler"];
    } else {

    }
  };

  ARERawActor.prototype.createPhysicsBody = function(_mass, _friction, _elasticity) {
    var a, i, moment, origVerts, pos, space, vertIndex, verts, x, y, _i, _ref;
    this._mass = _mass;
    this._friction = _friction;
    this._elasticity = _elasticity;
    if (AREPhysics.getWorld() === null || AREPhysics.getWorld() === void 0) {
      AREPhysics.startStepping();
    }
    if (this._shape === !null) {
      return;
    }
    if (AREPhysics.bodyCount === 0) {
      AREPhysics.startStepping();
    }
    AREPhysics.bodyCount++;
    if (this._mass === void 0 || this._mass === null) {
      this._mass = 0;
    }
    if (this._mass < 0) {
      this._mass = 0;
    }
    if (this._friction === void 0) {
      this._friction = ARERawActor.defaultFriction;
    } else if (this._friction < 0) {
      this._friction = 0;
    }
    if (this._elasticity === void 0) {
      this._elasticity = ARERawActor.defaultElasticity;
    } else if (this._elasticity < 0) {
      this._elasticity = 0;
    }
    verts = [];
    vertIndex = 0;
    origVerts = null;
    if (this._psyxVertices.length > 6) {
      origVerts = this._psyxVertices;
    } else {
      origVerts = this._vertices;
    }
    for (i = _i = 0, _ref = origVerts.length - 1; _i < _ref; i = _i += 2) {
      verts.push(origVerts[i] / ARERenderer.getPPM());
      verts.push(origVerts[i + 1] / ARERenderer.getPPM());
      if (this._mass === 0) {
        x = verts[verts.length - 2];
        y = verts[verts.length - 1];
        a = this._rotation;
        verts[verts.length - 2] = x * Math.cos(a) - (y * Math.sin(a));
        verts[verts.length - 1] = x * Math.sin(a) + (y * Math.cos(a));
      }
    }
    space = AREPhysics.getWorld();
    pos = ARERenderer.screenToWorld(this._position);
    if (this._mass === 0) {
      this._shape = space.addShape(new cp.PolyShape(space.staticBody, verts, pos));
      this._shape.setLayers(this._physicsLayer);
      this._body = null;
    } else {
      moment = cp.momentForPoly(this._mass, verts, ARERawActor._nullV);
      this._body = space.addBody(new cp.Body(this._mass, moment));
      this._body.setPos(pos);
      this._body.setAngle(this._rotation);
      this._shape = new cp.PolyShape(this._body, verts, ARERawActor._nullV);
      this._shape = space.addShape(this._shape);
      this._shape.setLayers(this._physicsLayer);
    }
    this._shape.setFriction(this._friction);
    return this._shape.setElasticity(this._elasticity);
  };

  ARERawActor.prototype.destroyPhysicsBody = function() {
    if (AREPhysics.bodyCount === 0) {
      return;
    }
    if (this._shape === null) {
      return;
    }
    AREPhysics.bodyCount--;
    AREPhysics.getWorld().removeShape(this._shape);
    if (this._body) {
      AREPhysics.getWorld().removeBody(this._body);
    }
    this._shape = null;
    this._body = null;
    if (AREPhysics.bodyCount === 0) {
      return AREPhysics.stopStepping();
    } else if (AREPhysics.bodyCount < 0) {
      throw new Error("Body count is negative!");
    }
  };

  ARERawActor.prototype.setPhysicsLayer = function(layer) {
    this._physicsLayer = 1 << param.required(layer, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    if (this._shape !== null) {
      return this._shape.setLayers(this._physicsLayer);
    }
  };

  ARERawActor.prototype.updateVertices = function(vertices, texverts) {
    var newTexVerts, newVertices;
    newVertices = param.optional(vertices, this._vertices);
    newTexVerts = param.optional(texverts, this._texVerts);
    if (newVertices.length < 6) {
      throw new Error("At least 3 vertices make up an actor");
    }
    if (newTexVerts !== this._texVerts) {
      if (newVertices !== this._vertices) {
        if (newVertices.length !== newTexVerts.length) {
          throw new Error("Vert and UV count must match!");
        }
      } else {
        if (this._vertices.length !== newTexVerts.length) {
          throw new Error("Vert and UV count must match!");
        }
      }
    }
    if (newVertices !== this._vertices) {
      this.updateVertBuffer(newVertices);
    }
    if (newTexVerts !== this._texVerts) {
      return this.updateUVBuffer(newTexVerts);
    }
  };

  ARERawActor.prototype.updateVertBuffer = function(_vertices) {
    var i, mnx, mny, mxx, mxy, _i, _ref;
    this._vertices = _vertices;
    this._vertBufferFloats = new Float32Array(this._vertices);
    if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_WGL) {
      this._vertBuffer = this._gl.createBuffer();
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertBufferFloats, this._gl.STATIC_DRAW);
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    }
    mnx = 0;
    mny = 0;
    mxx = 0;
    mxy = 0;
    for (i = _i = 1, _ref = this._vertices.length / 2; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
      if (this._vertices[i * 2] < mnx) {
        mnx = this._vertices[i * 2];
      }
      if (mxx < this._vertices[i * 2]) {
        mxx = this._vertices[i * 2];
      }
      if (this._vertices[i * 2 + 1] < mny) {
        mny = this._vertices[i * 2 + 1];
      }
      if (mxy < this._vertices[i * 2 + 1]) {
        mxy = this._vertices[i * 2 + 1];
      }
    }
    this._size.x = mxx - mnx;
    return this._size.y = mxy - mny;
  };

  ARERawActor.prototype.updateUVBuffer = function(_texVerts) {
    this._texVerts = _texVerts;
    this._origTexVerts = this._texVerts;
    this._texVBufferFloats = new Float32Array(this._texVerts);
    if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_WGL) {
      this._texBuffer = this._gl.createBuffer();
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._texBuffer);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, this._texVBufferFloats, this._gl.STATIC_DRAW);
      return this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    }
  };

  ARERawActor.prototype.setTextureRepeat = function(x, y) {
    var i, uvs, _i, _ref;
    param.required(x);
    y = param.optional(y, 1);
    uvs = [];
    for (i = _i = 0, _ref = this._origTexVerts.length; _i < _ref; i = _i += 2) {
      uvs.push(this._origTexVerts[i] * y);
      uvs.push(this._origTexVerts[i + 1] * x);
    }
    this.updateUVBuffer(uvs);
    return this;
  };

  ARERawActor.prototype.setPhysicsVertices = function(verts) {
    this._psyxVertices = param.required(verts);
    if (this._body !== null) {
      this.destroyPhysicsBody();
      return this.createPhysicsBody(this._mass, this._friction, this._elasticity);
    }
  };

  ARERawActor.prototype.attachTexture = function(texture, width, height, offx, offy, angle) {
    param.required(texture);
    param.required(width);
    param.required(height);
    this.attachedTextureAnchor.x = param.optional(offx, 0);
    this.attachedTextureAnchor.y = param.optional(offy, 0);
    this.attachedTextureAnchor.angle = param.optional(angle, 0);
    if (!ARERenderer.hasTexture(texture)) {
      throw new Error("No such texture loaded: " + texture);
      return;
    }
    if (this._attachedTexture !== null) {
      this.removeAttachment();
    }
    this._attachedTexture = new ARERectangleActor(width, height);
    this._attachedTexture.setTexture(texture);
    return this._attachedTexture;
  };

  ARERawActor.prototype.removeAttachment = function() {
    var a, i, _i, _len, _ref;
    if (this._attachedTexture === null) {
      return false;
    }
    _ref = ARERenderer.actors;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      a = _ref[i];
      if (a.getId() === this._attachedTexture.getId()) {
        a.destroyPhysicsBody();
        ARERenderer.actors.splice(i, 1);
        this._attachedTexture = null;
        return true;
      }
    }
    return false;
  };

  ARERawActor.prototype.setAttachmentVisibility = function(visible) {
    param.required(visible);
    if (this._attachedTexture === null) {
      return false;
    }
    this._attachedTexture.visible = visible;
    return true;
  };

  ARERawActor.prototype.hasAttachment = function() {
    return this._attachedTexture !== null;
  };

  ARERawActor.prototype.getAttachment = function() {
    return this._attachedTexture;
  };

  ARERawActor.prototype.updateAttachment = function() {
    var a, pos, rot;
    if (this.hasAttachment() && this.getAttachment().visible) {
      this.updatePosition();
      pos = this.getPosition();
      rot = this.getRotation();
      pos.x += this.attachedTextureAnchor.x;
      pos.y += this.attachedTextureAnchor.y;
      rot += this.attachedTextureAnchor.angle;
      a = this.getAttachment();
      this.setPosition(pos);
      this.setRotation(rot);
      return a;
    }
    return this;
  };

  ARERawActor.prototype.updatePosition = function() {
    if (this._body !== null) {
      this._position = ARERenderer.worldToScreen(this._body.getPos());
      return this._rotation = this._body.a;
    }
  };

  ARERawActor.prototype.wglUpdateTexture = function(gl) {
    if (this._material === "texture") {
      gl.bindBuffer(gl.ARRAY_BUFFER, this._texBuffer);
      gl.vertexAttribPointer(this._sh_texture, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this._texture);
      return gl.uniform1i(this._sh_sampler, 0);
    }
  };

  ARERawActor.prototype.wglDraw = function(gl) {
    var flatMV;
    param.required(gl);
    if (!this.visible) {
      return;
    }
    this.updatePosition();
    this._modelM = new Matrix4();
    this._transV.elements[0] = this._position.x - ARERenderer.camPos.x;
    this._transV.elements[1] = this._position.y - ARERenderer.camPos.y;
    this._modelM.translate(this._transV);
    this._modelM.rotate(this._rotation, this._rotV);
    flatMV = this._modelM.flatten();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertBuffer);
    gl.vertexAttribPointer(this._sh_position, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f(this._sh_color, this._colArray[0], this._colArray[1], this._colArray[2], 1);
    gl.uniformMatrix4fv(this._sh_modelview, false, flatMV);
    this.wglUpdateTexture(gl);
    if (this._renderMode === 1) {
      return gl.drawArrays(gl.LINE_LOOP, 0, this._vertices.length / 2);
    } else if (this._renderMode === 2) {
      return gl.drawArrays(gl.TRIANGLE_FAN, 0, this._vertices.length / 2);
    } else if (this._renderMode === 3) {
      return gl.drawArrays(gl.TRIANGLE_STRIP, 0, this._vertices.length / 2);
    } else {
      throw new Error("Invalid render mode! " + this._renderMode);
    }
  };

  ARERawActor.prototype.cvUpdateTexture = function(context) {
    var b, g, r;
    if (this._material === "texture") {

    } else {
      if (this._stroke_color) {
        r = this._stroke_color.getR();
        g = this._stroke_color.getG();
        b = this._stroke_color.getB();
        context.strokeStyle = "rgb(" + r + "," + g + "," + b + ")";
      } else {
        context.strokeStyle = "#FFF";
      }
      if (this._color) {
        r = this._color.getR();
        g = this._color.getG();
        b = this._color.getB();
        return context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
      } else {
        return context.fillStyle = "#FFF";
      }
    }
  };

  ARERawActor.prototype.cvDraw = function(context) {
    var i, x, y, _i, _ref;
    param.required(context);
    if (!this.visible) {
      return;
    }
    this.updatePosition();
    this._transV.elements[0] = this._position.x - ARERenderer.camPos.x;
    this._transV.elements[1] = this._position.y - ARERenderer.camPos.y;
    x = this._transV.elements[0];
    y = this._transV.elements[1];
    context.translate(x, y);
    context.beginPath();
    context.rotate(this._rotation);
    context.moveTo(this._vertices[0], this._vertices[1]);
    for (i = _i = 1, _ref = this._vertices.length / 2; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
      context.lineTo(this._vertices[i * 2], this._vertices[i * 2 + 1]);
    }
    context.closePath();
    this.cvUpdateTexture(context);
    if (this._renderMode === 1) {
      return context.stroke();
    } else if (this._renderMode === 2) {
      if (this._material === "texture") {
        context.clip();
        return context.drawImage(this._texture, -this._size.x / 2, -this._size.y / 2, this._size.x, this._size.y);
      } else {
        return context.fill();
      }
    } else if (this._renderMode === 3) {
      if (this._material === "texture") {
        context.clip();
        context.drawImage(this._texture, -this._size.x / 2, -this._size.y / 2, this._size.x, this._size.y);
      } else {
        context.fill();
      }
      return context.stroke();
    } else {
      throw new Error("Invalid render mode! " + this._renderMode);
    }
  };

  ARERawActor.prototype.nullDraw = function(context) {
    param.required(context);
    if (!this.visible) {
      return;
    }
    return this.updatePosition();
  };

  ARERawActor.prototype.setRenderMode = function(mode) {
    return this._renderMode = param.required(mode, [1, 2, 3]);
  };

  ARERawActor.prototype.setPosition = function(position) {
    param.required(position);
    if (this._shape === null) {
      if (position instanceof cp.v) {
        this._position = position;
      } else {
        this._position = new cp.v(Number(position.x), Number(position.y));
      }
    } else if (this._body !== null) {
      this._body.setPos(ARERenderer.screenToWorld(position));
    }
    return this;
  };

  ARERawActor.prototype.setRotation = function(rotation, radians) {
    param.required(rotation);
    radians = param.optional(radians, false);
    if (radians === false) {
      rotation = Number(rotation) * 0.0174532925;
    }
    this._rotation = rotation;
    if (this._body !== null) {
      this._body.SetAngle(this._rotation);
    } else if (this._shape !== null) {
      this.destroyPhysicsBody();
      this.createPhysicsBody(this._mass, this._friction, this._elasticity);
    }
    return this;
  };

  ARERawActor.prototype.getPosition = function() {
    return this._position;
  };

  ARERawActor.prototype.getRotation = function(radians) {
    radians = param.optional(radians, false);
    if (radians === false) {
      return this._rotation * 57.2957795;
    } else {
      return this._rotation;
    }
  };

  ARERawActor.prototype.getVertices = function() {
    return this._vertices;
  };

  ARERawActor.prototype.getId = function() {
    return this._id;
  };

  ARERawActor.prototype.getColor = function() {
    return new AREColor3(this._color);
  };

  ARERawActor.prototype.setColor = function(colOrR, g, b) {
    param.required(colOrR);
    if (this._color === void 0 || this._color === null) {
      this._color = new AREColor3;
    }
    if (colOrR instanceof AREColor3) {
      this._color = colOrR;
      this._colArray = [colOrR.getR(true), colOrR.getG(true), colOrR.getB(true)];
    } else {
      param.required(g);
      param.required(b);
      this._color.setR(Number(colOrR));
      this._color.setG(Number(g));
      this._color.setB(Number(b));
      this._colArray = [this._color.getR(true), this._color.getG(true), this._color.getB(true)];
    }
    return this;
  };

  return ARERawActor;

})();

ARERectangleActor = (function(_super) {
  __extends(ARERectangleActor, _super);

  function ARERectangleActor(width, height) {
    var uvs, verts;
    this.width = width;
    this.height = height;
    param.required(width);
    param.required(height);
    if (width <= 0) {
      throw new Error("Invalid width: " + width);
    }
    if (height <= 0) {
      throw new Error("Invalid width: " + height);
    }
    verts = this.generateVertices();
    uvs = this.generateUVs();
    ARERectangleActor.__super__.constructor.call(this, verts, uvs);
  }

  ARERectangleActor.prototype.generateVertices = function() {
    var hH, hW;
    hW = this.width / 2;
    hH = this.height / 2;
    return [-hW, -hH, -hW, hH, hW, hH, hW, -hH, -hW, -hH];
  };

  ARERectangleActor.prototype.generateUVs = function() {
    return [0, 1, 0, 0, 1, 0, 1, 1, 0, 1];
  };

  ARERectangleActor.prototype.getWidth = function() {
    return this.width;
  };

  ARERectangleActor.prototype.getHeight = function() {
    return this.height;
  };

  ARERectangleActor.prototype.setWidth = function(width) {
    this.width = width;
    return this.updateVertBuffer(this.generateVertices());
  };

  ARERectangleActor.prototype.setHeight = function(height) {
    this.height = height;
    return this.updateVertBuffer(this.generateVertices());
  };

  return ARERectangleActor;

})(ARERawActor);

AREPolygonActor = (function(_super) {
  __extends(AREPolygonActor, _super);

  function AREPolygonActor(radius, segments) {
    var psyxVerts, uvs, verts;
    this.radius = radius;
    this.segments = segments;
    param.required(radius);
    if (this.radius instanceof Array) {
      this._verts = this.radius;
      this.radius = null;
      uvs = this.generateUVs(this._verts);
      AREPolygonActor.__super__.constructor.call(this, this._verts, uvs);
      this.setPhysicsVertices(this._verts);
    } else {
      param.required(segments);
      if (radius <= 0) {
        throw new Error("Invalid radius: " + radius);
      }
      if (segments <= 2) {
        throw new ERror("Invalid segment count: " + segments);
      }
      verts = this.generateVertices();
      psyxVerts = this.generateVertices({
        mode: "physics"
      });
      uvs = this.generateUVs(verts);
      AREPolygonActor.__super__.constructor.call(this, verts, uvs);
      this.setPhysicsVertices(psyxVerts);
    }
    this.setRenderMode(2);
  }

  AREPolygonActor.prototype.generateVertices = function(options) {
    var i, radFactor, tanFactor, theta, tx, ty, verts, x, y, _i, _j, _ref, _ref1, _tv;
    options = param.optional(options, {});
    x = this.radius;
    y = 0;
    theta = (2.0 * 3.1415926) / this.segments;
    tanFactor = Math.tan(theta);
    radFactor = Math.cos(theta);
    verts = [];
    for (i = _i = 0, _ref = this.segments; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      verts[i * 2] = x;
      verts[(i * 2) + 1] = y;
      tx = -y;
      ty = x;
      x += tx * tanFactor;
      y += ty * tanFactor;
      x *= radFactor;
      y *= radFactor;
    }
    verts.push(verts[0]);
    verts.push(verts[1]);
    _tv = [];
    for (i = _j = 0, _ref1 = verts.length; _j < _ref1; i = _j += 2) {
      _tv.push(verts[verts.length - 2 - i]);
      _tv.push(verts[verts.length - 1 - i]);
    }
    verts = _tv;
    if (options.mode !== "physics") {
      verts.push(0);
      verts.push(0);
    }
    return verts;
  };

  AREPolygonActor.prototype.generateUVs = function(vertices) {
    var uvs, v, _i, _len;
    param.required(vertices);
    uvs = [];
    for (_i = 0, _len = vertices.length; _i < _len; _i++) {
      v = vertices[_i];
      uvs.push(((v / this.radius) / 2) + 0.5);
    }
    return uvs;
  };

  AREPolygonActor.prototype.fullVertRefresh = function() {
    var psyxVerts, uvs, verts;
    verts = this.generateVertices();
    psyxVerts = this.generateVertices({
      mode: "physics"
    });
    uvs = this.generateUVs(verts);
    this.updateVertices(verts, uvs);
    return this.setPhysicsVertices(psyxVerts);
  };

  AREPolygonActor.prototype.getRadius = function() {
    return this.radius;
  };

  AREPolygonActor.prototype.getSegments = function() {
    return this.segments;
  };

  AREPolygonActor.prototype.setRadius = function(radius) {
    this.radius = radius;
    if (radius <= 0) {
      throw new Error("Invalid radius: " + radius);
    }
    return this.fullVertRefresh();
  };

  AREPolygonActor.prototype.setSegments = function(segments) {
    this.segments = segments;
    if (segments <= 2) {
      throw new ERror("Invalid segment count: " + segments);
    }
    return this.fullVertRefresh();
  };

  return AREPolygonActor;

})(ARERawActor);

ARECircleActor = (function(_super) {
  __extends(ARECircleActor, _super);

  function ARECircleActor(radius) {
    this.radius = radius;
    ARECircleActor.__super__.constructor.call(this, radius, 32);
    delete this.setSegments;
    delete this.getSegments;
  }

  return ARECircleActor;

})(AREPolygonActor);

AREColor3 = (function() {
  function AREColor3(colOrR, g, b) {
    colOrR = param.optional(colOrR, 0);
    g = param.optional(g, 0);
    b = param.optional(b, 0);
    if (colOrR instanceof AREColor3) {
      this._r = colOrR.getR();
      this._g = colOrR.getG();
      this._b = colOrR.getB();
    } else {
      this.setR(colOrR);
      this.setG(g);
      this.setB(b);
    }
  }

  AREColor3.prototype.getR = function(asFloat) {
    if (asFloat !== true) {
      return this._r;
    }
    return this._r / 255;
  };

  AREColor3.prototype.getG = function(asFloat) {
    if (asFloat !== true) {
      return this._g;
    }
    return this._g / 255;
  };

  AREColor3.prototype.getB = function(asFloat) {
    if (asFloat !== true) {
      return this._b;
    }
    return this._b / 255;
  };

  AREColor3.prototype.setR = function(c) {
    c = Number(c);
    if (c < 0) {
      c = 0;
    }
    if (c > 255) {
      c = 255;
    }
    return this._r = c;
  };

  AREColor3.prototype.setG = function(c) {
    c = Number(c);
    if (c < 0) {
      c = 0;
    }
    if (c > 255) {
      c = 255;
    }
    return this._g = c;
  };

  AREColor3.prototype.setB = function(c) {
    c = Number(c);
    if (c < 0) {
      c = 0;
    }
    if (c > 255) {
      c = 255;
    }
    return this._b = c;
  };

  AREColor3.prototype.toString = function() {
    return "(" + this._r + ", " + this._g + ", " + this._b + ")";
  };

  return AREColor3;

})();

AREShader = (function() {
  function AREShader(_vertSrc, _fragSrc, _gl, build) {
    var _success;
    this._vertSrc = _vertSrc;
    this._fragSrc = _fragSrc;
    this._gl = _gl;
    param.required(this._vertSrc);
    param.required(this._fragSrc);
    param.required(this._gl);
    build = param.optional(build, false);
    this.errors = [];
    this._prog = null;
    this._vertShader = null;
    this._fragShader = null;
    this._handles = null;
    if (build === true) {
      _success = this.build(this._gl);
      if (_success === false) {
        throw new Error("Failed to build shader! " + (JSON.stringify(this.errors)));
      }
    }
  }

  AREShader.prototype.build = function(_gl) {
    var gl;
    this._gl = _gl;
    param.required(this._gl);
    gl = this._gl;
    this.errors = [];
    if (gl === void 0 || gl === null) {
      throw new Error("Need a valid gl object to build a shader!");
    }
    this._vertShader = gl.createShader(gl.VERTEX_SHADER);
    this._fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(this._vertShader, this._vertSrc);
    gl.shaderSource(this._fragShader, this._fragSrc);
    gl.compileShader(this._vertShader);
    gl.compileShader(this._fragShader);
    if (!gl.getShaderParameter(this._vertShader, gl.COMPILE_STATUS)) {
      this.errors.push(gl.getShaderInfoLog(this._vertShader));
    }
    if (!gl.getShaderParameter(this._fragShader, gl.COMPILE_STATUS)) {
      this.errors.push(gl.getShaderInfoLog(this._fragShader));
    }
    this._prog = gl.createProgram();
    gl.attachShader(this._prog, this._vertShader);
    gl.attachShader(this._prog, this._fragShader);
    gl.linkProgram(this._prog);
    if (!gl.getProgramParameter(this._prog, gl.LINK_STATUS)) {
      this.errors.push("Failed to link!");
    }
    if (this.errors.length > 0) {
      return false;
    }
    return true;
  };

  AREShader.prototype.generateHandles = function() {
    var h, l, src, _i, _j, _len, _len1, _makeHandle, _ref;
    if (this._prog === null) {
      AREEngine.getLog().error("Build program before generating handles");
      return false;
    }
    if (this._handles !== null) {
      AREEngine.getLog().warn("Refusing to re-generate handles!");
      return false;
    }
    this._handles = {};
    _makeHandle = function(l, type, me) {
      var name, ret;
      l = l.split(" ");
      name = l[l.length - 1].replace(";", "");
      if (type === 1) {
        ret = {
          n: name,
          h: me._gl.getUniformLocation(me._prog, name)
        };
        if (typeof ret.h !== "object") {
          throw new Error("Failed to get handle for uniform " + name + " [" + ret.h + "]");
        }
        return ret;
      } else if (type === 2) {
        ret = {
          n: name,
          h: me._gl.getAttribLocation(me._prog, name)
        };
        return ret;
      }
      throw new Error("Type not 1 or 2, WTF, internal error");
    };
    _ref = [this._vertSrc, this._fragSrc];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      src = _ref[_i];
      src = src.split(";");
      for (_j = 0, _len1 = src.length; _j < _len1; _j++) {
        l = src[_j];
        if (l.indexOf("main()") !== -1) {
          break;
        } else if (l.indexOf("attribute") !== -1) {
          h = _makeHandle(l, 2, this);
          this._handles[h.n] = h.h;
        } else if (l.indexOf("uniform") !== -1) {
          h = _makeHandle(l, 1, this);
          this._handles[h.n] = h.h;
        }
      }
    }
    return true;
  };

  AREShader.prototype.getHandles = function() {
    return this._handles;
  };

  AREShader.prototype.getProgram = function() {
    return this._prog;
  };

  return AREShader;

})();

ARERenderer = (function() {
  ARERenderer._nextID = 0;

  ARERenderer._gl = null;

  ARERenderer._PPM = 128;

  ARERenderer.getPPM = function() {
    return ARERenderer._PPM;
  };

  ARERenderer.getMPP = function() {
    return 1.0 / ARERenderer._PPM;
  };

  ARERenderer.screenToWorld = function(v) {
    var ret;
    ret = new cp.v;
    ret.x = v.x / ARERenderer._PPM;
    ret.y = v.y / ARERenderer._PPM;
    return ret;
  };

  ARERenderer.worldToScreen = function(v) {
    var ret;
    ret = new cp.v;
    ret.x = v.x * ARERenderer._PPM;
    ret.y = v.y * ARERenderer._PPM;
    return ret;
  };

  ARERenderer.actors = [];

  ARERenderer.textures = [];

  ARERenderer.me = null;

  ARERenderer._currentMaterial = "none";

  ARERenderer.camPos = {
    x: 0,
    y: 0
  };

  ARERenderer.RENDERER_MODE_NULL = 0;

  ARERenderer.RENDERER_MODE_CANVAS = 1;

  ARERenderer.RENDERER_MODE_WGL = 2;

  ARERenderer.rendererMode = ARERenderer.RENDERER_MODE_WGL;

  ARERenderer.activeRendererMode = null;

  function ARERenderer(canvasId, _width, _height) {
    var _createCanvas;
    this._width = _width;
    this._height = _height;
    canvasId = param.optional(canvasId, "");
    this._defaultShader = null;
    this._canvas = null;
    this._ctx = null;
    this._pickRenderRequested = false;
    this._pickRenderBuff = null;
    this._pickRenderCB = null;
    this.initError = void 0;
    if (canvasId.length === 0) {
      canvasId = void 0;
    }
    if (ARERenderer.me !== null) {
      throw new Error("Only one instance of ARERenderer can be created!");
    } else {
      ARERenderer.me = this;
    }
    this._width = param.optional(this._width, 800);
    this._height = param.optional(this._height, 600);
    if (this._width <= 1 || this._height <= 1) {
      throw new Error("Canvas must be at least 2x2 in size");
    }
    _createCanvas = function(parent, id, w, h) {
      var _c;
      _c = ARERenderer.me._canvas = document.createElement("canvas");
      _c.width = w;
      _c.height = h;
      _c.id = "are_canvas";
      if (parent === "body") {
        return document.getElementsByTagName(parent)[0].appendChild(_c);
      } else {
        return document.getElementById(parent).appendChild(_c);
      }
    };
    if (canvasId === void 0 || canvasId === null) {
      _createCanvas("body", "are_canvas", this._width, this._height);
      ARELog.info("Creating canvas #are_canvas [" + this._width + "x" + this._height + "]");
      this._canvas = document.getElementById("are_canvas");
    } else {
      this._canvas = document.getElementById(canvasId);
      if (this._canvas === null) {
        _createCanvas("body", canvasId, this._width, this._height);
        ARELog.info("Creating canvas #" + canvasId + " [" + this._width + "x" + this._height + "]");
        this._canvas = document.getElementById(canvasId);
      } else {
        if (this._canvas.nodeName.toLowerCase() === "canvas") {
          ARELog.warn("Canvas exists, ignoring supplied dimensions");
          this._width = this._canvas.width;
          this._height = this._canvas.height;
          ARELog.info("Using canvas #" + canvasId + " [" + this._width + "x" + this._height + "]");
        } else {
          _createCanvas(canvasId, "are_canvas", this._width, this._height);
          ARELog.info("Creating canvas #are_canvas [" + this._width + "x" + this._height + "]");
        }
      }
    }
    if (this._canvas === null) {
      return ARELog.error("Canvas does not exist!");
    }
    switch (ARERenderer.rendererMode) {
      case ARERenderer.RENDERER_MODE_NULL:
        this.initializeNullContext();
        break;
      case ARERenderer.RENDERER_MODE_CANVAS:
        this.initializeCanvasContext();
        break;
      case ARERenderer.RENDERER_MODE_WGL:
        if (!this.initializeWGLContext(this._canvas)) {
          ARELog.info("Falling back on regular canvas renderer");
          this.initializeCanvasContext();
        }
        break;
      default:
        ARELog.error("Invalid Renderer " + ARERenderer.rendererMode);
    }
    ARELog.info("Using the " + ARERenderer.activeRendererMode + " renderer mode");
    this.switchMaterial("flat");
    this.setClearColor(0, 0, 0);
  }

  ARERenderer.prototype.initializeWGLContext = function(canvas) {
    var fragSrc_Solid, fragSrc_Tex, fragSrc_Wire, gl, vertSrc_Solid, vertSrc_Tex, vertSrc_Wire;
    gl = canvas.getContext("webgl", {
      antialias: true
    });
    if (gl === null) {
      ARELog.warn("Continuing with experimental webgl support");
      gl = canvas.getContext("experimental-webgl");
    }
    if (gl === null) {
      alert("Your browser does not support WebGL! Adefy ads won't render ;(");
      this.initError = "Your browser does not support WebGL!";
      return false;
    }
    ARERenderer._gl = gl;
    ARELog.info("Created WebGL context");
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    ARELog.info("Renderer initialized");
    vertSrc_Wire = "attribute vec2 Position;\n\nuniform mat4 Projection;\nuniform mat4 ModelView;\n\nvoid main() {\n  gl_Position = Projection * ModelView * vec4(Position, 1, 1);\n}";
    fragSrc_Wire = "#ifdef GL_ES\nprecision mediump float;\n#endif\nvoid main() {\n  gl_FragColor = vec4(0.4, 0.4, 0.4, 1.0);\n}";
    vertSrc_Solid = "attribute vec2 Position;\n\nuniform mat4 Projection;\nuniform mat4 ModelView;\n\nvoid main() {\n  gl_Position = Projection * ModelView * vec4(Position, 1, 1);\n}\n";
    fragSrc_Solid = "precision mediump float;\nuniform vec4 Color;\n\nvoid main() {\n  gl_FragColor = Color;\n}";
    vertSrc_Tex = "attribute vec2 Position;\nattribute vec2 aTexCoord;\n\nuniform mat4 Projection;\nuniform mat4 ModelView;\n\nvarying highp vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = Projection * ModelView * vec4(Position, 1, 1);\n  vTexCoord = aTexCoord;\n}";
    fragSrc_Tex = "precision highp float;\n\nvarying highp vec2 vTexCoord;\nuniform sampler2D uSampler;\n\nvoid main() {\n  gl_FragColor = texture2D(uSampler, vTexCoord);\n}";
    this._defaultShader = new AREShader(vertSrc_Solid, fragSrc_Solid, gl, true);
    this._defaultShader.generateHandles();
    this._wireShader = new AREShader(vertSrc_Wire, fragSrc_Wire, gl, true);
    this._wireShader.generateHandles();
    this._texShader = new AREShader(vertSrc_Tex, fragSrc_Tex, gl, true);
    this._texShader.generateHandles();
    ARELog.info("Initialized shaders");
    ARELog.info("ARE WGL initialized");
    ARERenderer.activeRendererMode = ARERenderer.RENDERER_MODE_WGL;
    return true;
  };

  ARERenderer.prototype.initializeCanvasContext = function() {
    this._ctx = this._canvas.getContext("2d");
    ARELog.info("ARE CTX initialized");
    ARERenderer.activeRendererMode = ARERenderer.RENDERER_MODE_CANVAS;
    return true;
  };

  ARERenderer.prototype.initializeNullContext = function() {
    this._ctx = this._canvas.getContext("2d");
    ARELog.info("ARE Null initialized");
    ARERenderer.activeRendererMode = ARERenderer.RENDERER_MODE_NULL;
    return true;
  };

  ARERenderer.getMe = function() {
    return ARERenderer.me;
  };

  ARERenderer.prototype.getDefaultShader = function() {
    return this._defaultShader;
  };

  ARERenderer.prototype.getWireShader = function() {
    return this._wireShader;
  };

  ARERenderer.prototype.getTextureShader = function() {
    return this._texShader;
  };

  ARERenderer.prototype.getCanvas = function() {
    return this._canvas;
  };

  ARERenderer.prototype.getContext = function() {
    return this._ctx;
  };

  ARERenderer.getGL = function() {
    return ARERenderer._gl;
  };

  ARERenderer.prototype.getWidth = function() {
    return this._width;
  };

  ARERenderer.prototype.getHeight = function() {
    return this._height;
  };

  ARERenderer.prototype.getClearColor = function() {
    return this._clearColor;
  };

  ARERenderer.prototype.setClearColor = function(colOrR, g, b) {
    if (this._clearColor === void 0) {
      this._clearColor = new AREColor3;
    }
    if (colOrR instanceof AREColor3) {
      this._clearColor = colOrR;
    } else {
      if (colOrR === void 0 || colOrR === null) {
        colOrR = 0;
      }
      if (g === void 0 || g === null) {
        g = 0;
      }
      if (b === void 0 || b === null) {
        b = 0;
      }
      this._clearColor.setR(colOrR);
      this._clearColor.setG(g);
      this._clearColor.setB(b);
    }
    colOrR = this._clearColor.getR(true);
    g = this._clearColor.getG(true);
    b = this._clearColor.getB(true);
    if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_WGL) {
      if (ARERenderer._gl !== null && ARERenderer._gl !== void 0) {
        return ARERenderer._gl.clearColor(colOrR, g, b, 1.0);
      } else {
        return ARELog.error("Can't set clear color, ARERenderer._gl not valid!");
      }
    }
  };

  ARERenderer.prototype.requestPickingRender = function(buffer, cb) {
    param.required(buffer);
    param.required(cb);
    if (this._pickRenderRequested) {
      ARELog.warn("Pick render already requested! No request queue");
      return;
    }
    this._pickRenderBuff = buffer;
    this._pickRenderCB = cb;
    return this._pickRenderRequested = true;
  };

  ARERenderer.prototype.wglRender = function() {
    var a, gl, _i, _id, _idSector, _len, _ref, _savedColor;
    gl = ARERenderer._gl;
    if (gl === void 0 || gl === null) {
      return;
    }
    if (this._pickRenderRequested) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._pickRenderBuff);
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    _ref = ARERenderer.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (this._pickRenderRequested) {
        _savedColor = a.getColor();
        _id = a.getId() - (Math.floor(a.getId() / 255) * 255);
        _idSector = Math.floor(a.getId() / 255);
        this.switchMaterial("flat");
        a.setColor(_id, _idSector, 248);
        a.wglDraw(gl);
        a.setColor(_savedColor);
      } else {
        a = a.updateAttachment();
        if (a.getMaterial() !== ARERenderer._currentMaterial) {
          this.switchMaterial(a.getMaterial());
        }
        a.wglDraw(gl);
      }
    }
    if (this._pickRenderRequested) {
      this._pickRenderCB();
      this._pickRenderRequested = false;
      this._pickRenderBuff = null;
      this._pickRenderCB = null;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return this.render();
    }
  };

  ARERenderer.prototype.cvRender = function() {
    var a, ctx, _i, _id, _idSector, _len, _ref, _savedColor;
    ctx = this._ctx;
    if (ctx === void 0 || ctx === null) {
      return;
    }
    if (this._clearColor) {
      ctx.fillStyle = "rgb(" + this._clearColor + ")";
      ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    } else {
      ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
    ctx.save();
    ctx.translate(0, this._canvas.height);
    ctx.scale(1, -1);
    _ref = ARERenderer.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      ctx.save();
      if (this._pickRenderRequested) {
        _savedColor = a.getColor();
        _id = a.getId() - (Math.floor(a.getId() / 255) * 255);
        _idSector = Math.floor(a.getId() / 255);
        this.switchMaterial("flat");
        a.setColor(_id, _idSector, 248);
        a.cvDraw(ctx);
        a.setColor(_savedColor);
      } else {
        a = a.updateAttachment();
        if (a.getMaterial() !== ARERenderer._currentMaterial) {
          this.switchMaterial(a.getMaterial());
        }
        a.cvDraw(ctx);
      }
      ctx.restore();
    }
    return ctx.restore();
  };

  ARERenderer.prototype.nullRender = function() {
    var a, ctx, _i, _len, _ref, _results;
    ctx = this._ctx;
    if (ctx === void 0 || ctx === null) {
      return;
    }
    if (this._clearColor) {
      ctx.fillStyle = "rgb(" + this._clearColor + ")";
      ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    } else {
      ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
    _ref = ARERenderer.actors;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      a = a.updateAttachment();
      _results.push(a.nullDraw(ctx));
    }
    return _results;
  };

  ARERenderer.prototype.render = function() {
    if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_NULL) {
      return this.nullRender();
    } else if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_CANVAS) {
      return this.cvRender();
    } else if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_WGL) {
      return this.wglRender();
    }
  };

  ARERenderer.getNextId = function() {
    return ARERenderer._nextID++;
  };

  ARERenderer.addActor = function(actor, layer) {
    var layerIndex;
    param.required(actor);
    layer = param.optional(layer, actor.layer);
    if (actor.layer !== layer) {
      actor.layer = layer;
    }
    layerIndex = _.sortedIndex(ARERenderer.actors, actor, "layer");
    ARERenderer.actors.splice(layerIndex, 0, actor);
    return actor;
  };

  ARERenderer.removeActor = function(oactor) {
    var a, actor, i, _i, _len, _ref;
    param.required(oactor);
    actor = oactor;
    if (actor instanceof ARERawActor) {
      actor = actor.getId();
    }
    _ref = ARERenderer.actors;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      a = _ref[i];
      if (a.getId() === actor) {
        ARERenderer.actors.splice(i, 1);
        oactor.destroy();
        return true;
      }
    }
    return false;
  };

  ARERenderer.prototype.switchMaterial = function(material) {
    var gl, handles, ortho;
    param.required(material);
    if (ARERenderer.activeRendererMode !== ARERenderer.RENDERER_MODE_WGL) {
      return;
    }
    ortho = Matrix4.makeOrtho(0, this._width, 0, this._height, -10, 10).flatten();
    ortho[15] = 1.0;
    gl = ARERenderer._gl;
    if (material === ARERenderer._currentMaterial) {

    } else if (material === "flat") {
      gl.useProgram(this._defaultShader.getProgram());
      handles = this._defaultShader.getHandles();
      gl.uniformMatrix4fv(handles["Projection"], false, ortho);
      gl.enableVertexAttribArray(handles["Position"]);
      gl.enableVertexAttribArray(handles["Color"]);
      return ARERenderer._currentMaterial = "flat";
    } else if (material === "texture") {
      gl.useProgram(this._texShader.getProgram());
      handles = this._texShader.getHandles();
      gl.uniformMatrix4fv(handles["Projection"], false, ortho);
      gl.enableVertexAttribArray(handles["Position"]);
      gl.enableVertexAttribArray(handles["aTexCoord"]);
      return ARERenderer._currentMaterial = "texture";
    } else {
      throw new Error("Unknown material " + material);
    }
  };

  ARERenderer.hasTexture = function(name) {
    var t, _i, _len, _ref;
    _ref = ARERenderer.textures;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      t = _ref[_i];
      if (t.name === name) {
        return true;
      }
    }
    return false;
  };

  ARERenderer.getTexture = function(name) {
    var t, _i, _len, _ref;
    param.required(name);
    _ref = ARERenderer.textures;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      t = _ref[_i];
      if (t.name === name) {
        return t.texture;
      }
    }
    return null;
  };

  ARERenderer.getTextureSize = function(name) {
    var t, _i, _len, _ref;
    param.required(name);
    _ref = ARERenderer.textures;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      t = _ref[_i];
      if (t.name === name) {
        return {
          w: t.width,
          h: t.height
        };
      }
    }
    return null;
  };

  ARERenderer.addTexture = function(tex) {
    param.required(tex.name);
    param.required(tex.texture);
    return ARERenderer.textures.push(tex);
  };

  return ARERenderer;

})();

AREPhysics = (function() {
  AREPhysics.velIterations = 6;

  AREPhysics.posIterations = 2;

  AREPhysics.frameTime = 1.0 / 60.0;

  AREPhysics._gravity = new cp.v(0, -1);

  AREPhysics._stepIntervalId = null;

  AREPhysics._world = null;

  AREPhysics._densityRatio = 1 / 10000;

  AREPhysics.bodyCount = 0;

  function AREPhysics() {
    throw new Error("Physics constructor called");
  }

  AREPhysics.startStepping = function() {
    var me;
    if (this._stepIntervalId !== null) {
      return;
    }
    this._world = new cp.Space;
    this._world.gravity = this._gravity;
    this._world.iterations = 60;
    this._world.collisionSlop = 0.5;
    this._world.sleepTimeThreshold = 0.5;
    me = this;
    ARELog.info("Starting world update loop");
    return this._stepIntervalId = setInterval(function() {
      return me._world.step(me.frameTime);
    }, this.frameTime);
  };

  AREPhysics.stopStepping = function() {
    if (this._stepIntervalId === null) {
      return;
    }
    ARELog.info("Halting world update loop");
    clearInterval(this._stepIntervalId);
    this._stepIntervalId = null;
    return this._world = null;
  };

  AREPhysics.getWorld = function() {
    return this._world;
  };

  AREPhysics.getDensityRatio = function() {
    return this._densityRatio;
  };

  AREPhysics.getGravity = function() {
    return this._gravity;
  };

  AREPhysics.setGravity = function(v) {
    if (!(v instanceof cp.Vect)) {
      throw new Error("You need to set space gravity using cp.v!");
    }
    this._gravity = v;
    if (this._world !== null && this._world !== void 0) {
      return this._world.gravity = v;
    }
  };

  return AREPhysics;

})();

ARELog = (function() {
  function ARELog() {}

  ARELog.tags = ["", "[Error]> ", "[Warning]> ", "[Debug]> ", "[Info]> "];

  ARELog.level = 4;

  ARELog.w = function(level, str) {
    var me;
    me = ARELog;
    if (level > me.level || level === 0 || me.level === 0) {
      return;
    }
    if (level === 1 && console.error !== void 0) {
      if (console.error) {
        return console.error("" + me.tags[level] + str);
      } else {
        return console.log("" + me.tags[level] + str);
      }
    } else if (level === 2 && console.warn !== void 0) {
      if (console.warn) {
        return console.warn("" + me.tags[level] + str);
      } else {
        return console.log("" + me.tags[level] + str);
      }
    } else if (level === 3 && console.debug !== void 0) {
      if (console.debug) {
        return console.debug("" + me.tags[level] + str);
      } else {
        return console.log("" + me.tags[level] + str);
      }
    } else if (level === 4 && console.info !== void 0) {
      if (console.info) {
        return console.info("" + me.tags[level] + str);
      } else {
        return console.log("" + me.tags[level] + str);
      }
    } else if (level > 4 && me.tags[level] !== void 0) {
      return console.log("" + me.tags[level] + str);
    } else {
      return console.log(str);
    }
  };

  ARELog.error = function(str) {
    return this.w(1, str);
  };

  ARELog.warn = function(str) {
    return this.w(2, str);
  };

  ARELog.debug = function(str) {
    return this.w(3, str);
  };

  ARELog.info = function(str) {
    return this.w(4, str);
  };

  return ARELog;

})();

AREBezAnimation = (function() {
  function AREBezAnimation(actor, options, dryRun) {
    this.actor = actor;
    dryRun = param.optional(dryRun, false);
    this.options = param.required(options);
    this._duration = param.required(options.duration);
    param.required(options.endVal);
    this._property = param.required(options.property);
    options.controlPoints = param.optional(options.controlPoints, []);
    this._fps = param.optional(options.fps, 30);
    if (dryRun) {
      param.optional(this.actor);
      param.required(options.startVal);
    } else {
      param.required(this.actor);
    }
    this._animated = false;
    this.bezOpt = {};
    if (options.controlPoints.length > 0) {
      this.bezOpt.degree = options.controlPoints.length;
      if (this.bezOpt.degree > 0) {
        param.required(options.controlPoints[0].x);
        param.required(options.controlPoints[0].y);
        if (this.bezOpt.degree === 2) {
          param.required(options.controlPoints[1].x);
          param.required(options.controlPoints[1].y);
        }
      }
      this.bezOpt.ctrl = options.controlPoints;
    } else {
      this.bezOpt.degree = 0;
    }
    this.bezOpt.endPos = param.required(options.endVal);
    this.tIncr = 1 / (this._duration * (this._fps / 1000));
    if (dryRun) {
      this.bezOpt.startPos = options.startVal;
    } else {
      if (this._property === "rotation") {
        this.bezOpt.startPos = this.actor.getRotation();
      }
      if (this._property[0] === "position") {
        if (this._property[1] === "x") {
          this.bezOpt.startPos = this.actor.getPosition().x;
        } else if (this._property[1] === "y") {
          this.bezOpt.startPos = this.actor.getPosition().y;
        }
      }
      if (this._property[0] === "color") {
        if (this._property[1] === "r") {
          this.bezOpt.startPos = this.actor.getColor().getR();
        } else if (this._property[1] === "g") {
          this.bezOpt.startPos = this.actor.getColor().getG();
        } else if (this._property[1] === "b") {
          this.bezOpt.startPos = this.actor.getColor().getB();
        }
      }
    }
  }

  AREBezAnimation.prototype._update = function(t, apply) {
    var val, _Mt, _Mt2, _Mt3, _t2, _t3;
    param.required(t);
    apply = param.optional(apply, true);
    if (t > 1 || t < 0) {
      throw new Error("t out of bounds! " + t);
    }
    if (this.bezOpt.degree === 0) {
      val = this.bezOpt.startPos + ((this.bezOpt.endPos - this.bezOpt.startPos) * t);
    } else if (this.bezOpt.degree === 1) {
      _Mt = 1 - t;
      _Mt2 = _Mt * _Mt;
      _t2 = t * t;
      val = (_Mt2 * this.bezOpt.startPos) + (2 * _Mt * t * this.bezOpt.ctrl[0].y) + _t2 * this.bezOpt.endPos;
    } else if (this.bezOpt.degree === 2) {
      _Mt = 1 - t;
      _Mt2 = _Mt * _Mt;
      _Mt3 = _Mt2 * _Mt;
      _t2 = t * t;
      _t3 = _t2 * t;
      val = (_Mt3 * this.bezOpt.startPos) + (3 * _Mt2 * t * this.bezOpt.ctrl[0].y) + (3 * _Mt * _t2 * this.bezOpt.ctrl[1].y) + (_t3 * this.bezOpt.endPos);
    } else {
      throw new Error("Invalid degree, can't evaluate (" + this.bezOpt.degree + ")");
    }
    if (apply) {
      this._applyValue(val);
      if (this.options.cbStep !== void 0) {
        this.options.cbStep(val);
      }
    }
    return val;
  };

  AREBezAnimation.prototype.preCalculate = function() {
    var bezValues, t;
    t = 0;
    bezValues = {
      stepTime: this._duration * this.tIncr
    };
    bezValues.values = [];
    while (t <= 1.0) {
      t += this.tIncr;
      if (t > 1 && t < (1 + this.tIncr)) {
        t = 1;
      } else if (t > 1) {
        break;
      }
      bezValues.values.push(this._update(t, false));
    }
    return bezValues;
  };

  AREBezAnimation.prototype._applyValue = function(val) {
    var pos, _b, _g, _r;
    if (this._property === "rotation") {
      this.actor.setRotation(val);
    }
    if (this._property[0] === "position") {
      if (this._property[1] === "x") {
        pos = new cp.v(val, this.actor.getPosition().y);
        this.actor.setPosition(pos);
      } else if (this._property[1] === "y") {
        pos = new cp.v(this.actor.getPosition().x, val);
        this.actor.setPosition(pos);
      }
    }
    if (this._property[0] === "color") {
      if (this._property[1] === "r") {
        _r = val;
        _g = this.actor.getColor().getG();
        _b = this.actor.getColor().getB();
        return this.actor.setColor(_r, _g, _b);
      } else if (this._property[1] === "g") {
        _r = this.actor.getColor().getR();
        _g = val;
        _b = this.actor.getColor().getB();
        return this.actor.setColor(_r, _g, _b);
      } else if (this._property[1] === "b") {
        _r = this.actor.getColor().getR();
        _g = this.actor.getColor().getG();
        _b = val;
        return this.actor.setColor(_r, _g, _b);
      }
    }
  };

  AREBezAnimation.prototype.animate = function() {
    var t;
    if (this._animated) {
      return;
    } else {
      this._animated = true;
    }
    if (this.options.cbStart !== void 0) {
      this.options.cbStart();
    }
    t = -this.tIncr;
    return this._intervalID = setInterval((function(_this) {
      return function() {
        t += _this.tIncr;
        if (t > 1) {
          clearInterval(_this._intervalID);
          if (_this.options.cbEnd !== void 0) {
            return _this.options.cbEnd();
          }
        } else {
          _this._update(t);
          if (_this.options.cbStep !== void 0) {
            return _this.options.cbStep();
          }
        }
      };
    })(this), 1000 / this._fps);
  };

  return AREBezAnimation;

})();

AREVertAnimation = (function() {
  function AREVertAnimation(actor, options) {
    this.actor = actor;
    this.options = options;
    param.required(this.actor);
    param.required(this.options);
    param.required(this.options.delays);
    param.required(this.options.deltas);
    if (this.options.delays.length !== this.options.deltas.length) {
      ARELog.warn("Vert animation delay count != delta set count! Bailing.");
      this._animated = true;
      return;
    }
    this._animated = false;
  }

  AREVertAnimation.prototype._setTimeout = function(deltaSet, delay, udata, last) {
    param.required(deltaSet);
    param.required(delay);
    udata = param.optional(udata, null);
    return setTimeout(((function(_this) {
      return function() {
        _this._applyDeltas(deltaSet, udata);
        if (last) {
          if (_this.options.cbEnd !== void 0) {
            return _this.options.cbEnd();
          }
        }
      };
    })(this)), delay);
  };

  AREVertAnimation.prototype._applyDeltas = function(deltaSet, udata) {
    var d, finalVerts, i, repeat, val, _i, _ref;
    param.required(deltaSet);
    if (this.options.cbStep !== void 0) {
      this.options.cbStep(udata);
    }
    finalVerts = this.actor.getVertices();
    if (deltaSet.join("_").indexOf("...") !== -1) {
      repeat = true;
    } else {
      repeat = false;
    }
    for (i = _i = 0, _ref = deltaSet.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      d = deltaSet[i];
      if (i >= finalVerts.length) {
        if (repeat) {
          break;
        }
        val = void 0;
      } else {
        val = finalVerts[i];
      }
      if (typeof d === "number") {
        val = d;
      } else if (typeof d === "string") {
        if (val === void 0) {
          ARELog.warn("Vertex does not exist, yet delta is relative!");
          return;
        }
        if (d.charAt(0) === "|") {
          break;
        } else if (d.charAt(0) === "-") {
          val -= Number(d.slice(1));
        } else if (d.charAt(0) === "+") {
          val += Number(d.slice(1));
        } else if (d === "...") {
          i = 0;
        } else if (d.charAt(0) !== ".") {
          ARELog.warn("Unknown delta action, " + d + ", can't apply deltas.");
          return;
        }
      } else {
        ARELog.warn("Unknown delta type, can't apply deltas! " + d + " " + (typeof d));
        return;
      }
      if (i > finalVerts.length) {
        ARELog.warn("Vertex gap, can't push new vert! " + val + ":" + d + ":" + i);
        return;
      } else if (i === finalVerts.length) {
        finalVerts.push(val);
      } else {
        finalVerts[i] = val;
      }
    }
    return this.actor.updateVertices(finalVerts);
  };

  AREVertAnimation.prototype.animate = function() {
    var i, last, udata, _i, _ref, _results;
    if (this._animated) {
      return;
    } else {
      this._animated = true;
    }
    if (this.options.cbStart !== void 0) {
      this.options.cbStart();
    }
    _results = [];
    for (i = _i = 0, _ref = this.options.deltas.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      udata = null;
      if (this.options.udata !== void 0) {
        if (this.options.udata instanceof Array) {
          if (i < this.options.udata.length) {
            udata = this.options.udata[i];
          }
        } else {
          udata = this.options.udata;
        }
      }
      if (i === (this.options.deltas.length - 1)) {
        last = true;
      } else {
        last = false;
      }
      _results.push(this._setTimeout(this.options.deltas[i], this.options.delays[i], udata, last));
    }
    return _results;
  };

  return AREVertAnimation;

})();

AREPsyxAnimation = (function() {
  function AREPsyxAnimation(actor, options) {
    this.actor = actor;
    this.options = options;
    param.required(this.actor);
    param.required(this.options.mass);
    param.required(this.options.friction);
    param.required(this.options.elasticity);
    param.required(this.options.timeout);
    this._animated = false;
  }

  AREPsyxAnimation.prototype.animate = function() {
    if (this._animated) {
      return;
    } else {
      this._animated = true;
    }
    if (this.options.cbStart !== void 0) {
      this.options.cbStart();
    }
    return setTimeout((function(_this) {
      return function() {
        _this.actor.createPhysicsBody(_this.options.mass, _this.options.friction, _this.options.elasticity);
        if (_this.options.cbEnd !== void 0) {
          return _this.options.cbEnd();
        }
      };
    })(this), this.options.timeout);
  };

  return AREPsyxAnimation;

})();

AREActorInterface = (function() {
  function AREActorInterface() {}

  AREActorInterface.prototype._findActor = function(id) {
    var a, _i, _len, _ref;
    param.required(id);
    _ref = ARERenderer.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id) {
        return a;
      }
    }
    return null;
  };

  AREActorInterface.prototype.createRawActor = function(verts) {
    param.required(verts);
    return new ARERawActor(JSON.parse(verts)).getId();
  };

  AREActorInterface.prototype.createPolygonActor = function(radius, segments) {
    param.required(radius);
    if (typeof radius === "string") {
      return this.createRawActor(radius);
    } else {
      param.required(segments);
      return new AREPolygonActor(radius, segments).getId();
    }
  };

  AREActorInterface.prototype.createRectangleActor = function(width, height) {
    param.required(width);
    param.required(height);
    return new ARERectangleActor(width, height).getId();
  };

  AREActorInterface.prototype.createCircleActor = function(radius) {
    param.required(radius);
    return new ARECircleActor(radius).getId();
  };

  AREActorInterface.prototype.getRectangleActorWidth = function(id) {
    var a, _i, _len, _ref;
    _ref = ARERenderer.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof ARERectangleActor) {
        return a.getWidth();
      }
    }
    return null;
  };

  AREActorInterface.prototype.getRectangleActorHeight = function(id) {
    var a, _i, _len, _ref;
    _ref = ARERenderer.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof ARERectangleActor) {
        return a.getHeight();
      }
    }
    return null;
  };

  AREActorInterface.prototype.setRectangleActorHeight = function(id, height) {
    var a, _i, _len, _ref;
    _ref = ARERenderer.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof ARERectangleActor) {
        a.setHeight(height);
        return true;
      }
    }
    return false;
  };

  AREActorInterface.prototype.setRectangleActorWidth = function(id, width) {
    var a, _i, _len, _ref;
    _ref = ARERenderer.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof ARERectangleActor) {
        a.setWidth(width);
        return true;
      }
    }
    return false;
  };

  AREActorInterface.prototype.getCircleActorRadius = function(id) {
    var a, _i, _len, _ref;
    _ref = ARERenderer.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof AREPolygonActor) {
        return a.getRadius();
      }
    }
    return null;
  };

  AREActorInterface.prototype.setCircleActorRadius = function(id, radius) {
    var a, _i, _len, _ref;
    _ref = ARERenderer.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === id && a instanceof AREPolygonActor) {
        a.setRadius(radius);
        return true;
      }
    }
    return false;
  };

  AREActorInterface.prototype.attachTexture = function(texture, w, h, x, y, angle, id) {
    var a;
    param.required(id);
    param.required(texture);
    param.required(w);
    param.required(h);
    x = param.optional(x, 0);
    y = param.optional(y, 0);
    angle = param.optional(angle, 0);
    if ((a = this._findActor(id)) !== null) {
      a.attachTexture(texture, w, h, x, y, angle);
      return true;
    }
    return false;
  };

  AREActorInterface.prototype.setActorLayer = function(layer, id) {
    var a;
    param.required(id);
    param.required(layer);
    if ((a = this._findActor(id)) !== null) {
      a.setLayer(layer);
      return true;
    }
    return false;
  };

  AREActorInterface.prototype.setActorPhysicsLayer = function(layer, id) {
    var a;
    param.required(id);
    param.required(layer);
    if ((a = this._findActor(id)) !== null) {
      a.setPhysicsLayer(layer);
      return true;
    }
    return false;
  };

  AREActorInterface.prototype.removeAttachment = function(id) {
    var a;
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      a.removeAttachment();
      return true;
    }
    return false;
  };

  AREActorInterface.prototype.setAttachmentVisiblity = function(visible, id) {
    var a;
    param.required(visible);
    if ((a = this._findActor(id)) !== null) {
      return a.setAttachmentVisibility(visible);
    }
    return false;
  };

  AREActorInterface.prototype.updateVertices = function(verts, id) {
    var a;
    param.required(verts);
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      a.updateVertices(JSON.parse(verts));
      return true;
    }
    return false;
  };

  AREActorInterface.prototype.getVertices = function(id) {
    var a;
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      return JSON.stringify(a.getVertices());
    }
    return null;
  };

  AREActorInterface.prototype.destroyActor = function(id) {
    var a, i, _i, _len, _ref;
    param.required(id);
    _ref = ARERenderer.actors;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      a = _ref[i];
      if (a.getId() === id) {
        a.destroyPhysicsBody();
        ARERenderer.actors.splice(i, 1);
        a = void 0;
        return true;
      }
    }
    return false;
  };

  AREActorInterface.prototype.setPhysicsVertices = function(verts, id) {
    var a;
    param.required(verts);
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      a.setPhysicsVertices(JSON.parse(verts));
      return true;
    }
    return false;
  };

  AREActorInterface.prototype.setRenderMode = function(mode, id) {
    var a;
    mode = param.required(mode, [1, 2]);
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      a.setRenderMode(mode);
      return true;
    }
    return false;
  };

  AREActorInterface.prototype.setActorPosition = function(x, y, id) {
    var a;
    param.required(x);
    param.required(y);
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      a.setPosition(new cp.v(x, y));
      return true;
    }
    return false;
  };

  AREActorInterface.prototype.getActorPosition = function(id) {
    var a, pos;
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      pos = a.getPosition();
      return JSON.stringify({
        x: pos.x,
        y: pos.y
      });
    }
    return null;
  };

  AREActorInterface.prototype.setActorRotation = function(angle, id, radians) {
    var a;
    param.required(angle);
    param.required(id);
    radians = param.optional(radians, false);
    if ((a = this._findActor(id)) !== null) {
      a.setRotation(angle, radians);
      return true;
    }
    return false;
  };

  AREActorInterface.prototype.getActorRotation = function(id, radians) {
    var a;
    param.required(id);
    radians = param.optional(radians, false);
    if ((a = this._findActor(id)) !== null) {
      return a.getRotation(radians);
    }
    return 0.000001;
  };

  AREActorInterface.prototype.setActorColor = function(r, g, b, id) {
    var a;
    param.required(r);
    param.required(g);
    param.required(b);
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      a.setColor(new AREColor3(r, g, b));
      return true;
    }
    return false;
  };

  AREActorInterface.prototype.getActorColor = function(id) {
    var a;
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      return JSON.stringify({
        r: a.getColor().getR(),
        g: a.getColor().getG(),
        b: a.getColor().getB()
      });
    }
    return null;
  };

  AREActorInterface.prototype.enableActorPhysics = function(mass, friction, elasticity, id) {
    var a;
    param.required(id);
    param.required(mass);
    param.required(friction);
    param.required(elasticity);
    if ((a = this._findActor(id)) !== null) {
      a.createPhysicsBody(mass, friction, elasticity);
      return true;
    }
    return false;
  };

  AREActorInterface.prototype.destroyPhysicsBody = function(id) {
    var a;
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      a.destroyPhysicsBody();
      true;
    }
    return false;
  };

  AREActorInterface.prototype.setActorTexture = function(name, id) {
    var a;
    param.required(name);
    param.required(id);
    if ((a = this._findActor(id)) !== null) {
      a.setTexture(name);
      true;
    }
    return false;
  };

  AREActorInterface.prototype.setActorTextureRepeat = function(x, y, id) {
    var a;
    param.required(x);
    param.required(id);
    y = param.optional(y, 1);
    if ((a = this._findActor(id)) !== null) {
      a.setTextureRepeat(x, y);
      true;
    }
    return false;
  };

  return AREActorInterface;

})();

AREEngineInterface = (function() {
  function AREEngineInterface() {}

  AREEngineInterface.prototype.initialize = function(width, height, ad, log, id) {
    var me;
    param.required(ad);
    param.required(width);
    param.required(height);
    log = param.optional(log, 4);
    id = param.optional(id, "");
    ARERenderer.actors = [];
    ARERenderer.textures = [];
    ARERenderer._gl = null;
    ARERenderer.me = null;
    ARERenderer._currentMaterial = "none";
    ARERenderer.camPos = {
      x: 0,
      y: 0
    };
    AREPhysics.stopStepping();
    me = this;
    return new AREEngine(width, height, function(are) {
      me._engine = are;
      are.startRendering();
      return ad(are);
    }, log, id);
  };

  AREEngineInterface.prototype.setClearColor = function(r, g, b) {
    param.required(r);
    param.required(g);
    param.required(b);
    if (this._engine === void 0) {

    } else {
      return ARERenderer.me.setClearColor(r, g, b);
    }
  };

  AREEngineInterface.prototype.getClearColor = function() {
    var col;
    if (this._engine === void 0) {
      return null;
    }
    col = ARERenderer.me.getClearColor();
    return JSON.stringify({
      r: col.getR(),
      g: col.getG(),
      b: col.getB()
    });
  };

  AREEngineInterface.prototype.setLogLevel = function(level) {
    param.required(level, [0, 1, 2, 3, 4]);
    return ARELog.level = level;
  };

  AREEngineInterface.prototype.setCameraPosition = function(x, y) {
    ARERenderer.camPos.x = param.optional(x, ARERenderer.camPos.x);
    return ARERenderer.camPos.y = param.optional(y, ARERenderer.camPos.y);
  };

  AREEngineInterface.prototype.getCameraPosition = function() {
    return JSON.stringify(ARERenderer.camPos);
  };

  AREEngineInterface.prototype.loadManifest = function(json, cb) {
    var count, loadTexture, manifest, tex, _i, _len, _results;
    param.required(json);
    manifest = JSON.parse(json);
    if (manifest.textures !== void 0) {
      manifest = manifest.textures;
    }
    count = 0;
    loadTexture = function(name, path) {
      var gl, img, tex;
      img = new Image();
      img.crossOrigin = "anonymous";
      gl = ARERenderer._gl;
      tex = null;
      if (ARERenderer.activeRendererMode === ARERenderer.RENDERER_MODE_WGL) {
        ARELog.info("Loading Gl Texture");
        tex = gl.createTexture();
        img.onload = function() {
          var pot;
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          pot = false;
          if ((img.width & (img.width - 1)) === 0) {
            if ((img.height & (img.height - 1)) === 0) {
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
              pot = true;
            }
          }
          if (!pot) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          }
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.bindTexture(gl.TEXTURE_2D, null);
          ARERenderer.addTexture({
            name: name,
            texture: tex,
            width: img.width,
            height: img.height
          });
          count++;
          if (count === manifest.length) {
            return cb();
          }
        };
      } else {
        img.onload = function() {
          ARERenderer.addTexture({
            name: name,
            texture: img,
            width: img.width,
            height: img.height
          });
          count++;
          if (count === manifest.length) {
            return cb();
          }
        };
      }
      return img.src = path;
    };
    _results = [];
    for (_i = 0, _len = manifest.length; _i < _len; _i++) {
      tex = manifest[_i];
      if (tex.compression !== void 0 && tex.compression !== "none") {
        console.error(tex.compression);
        throw new Error("Only un-compressed textures are supported!");
      }
      if (tex.type !== void 0 && tex.type !== "image") {
        console.error(tex.type);
        throw new Error("Only image textures are supported!");
      }
      _results.push(loadTexture(tex.name, tex.path));
    }
    return _results;
  };

  AREEngineInterface.prototype.getTextureSize = function(name) {
    return ARERenderer.getTextureSize(name);
  };

  AREEngineInterface.prototype.setRemindMeButton = function(x, y, w, h) {};

  return AREEngineInterface;

})();

AREAnimationInterface = (function() {
  function AREAnimationInterface() {}

  AREAnimationInterface._animationMap = {
    "position": AREBezAnimation,
    "color": AREBezAnimation,
    "rotation": AREBezAnimation,
    "mass": AREPsyxAnimation,
    "friction": AREPsyxAnimation,
    "elasticity": AREPsyxAnimation,
    "physics": AREPsyxAnimation,
    "vertices": AREVertAnimation
  };

  AREAnimationInterface.prototype.canAnimate = function(property) {
    if (AREAnimationInterface._animationMap[property] === void 0) {
      return false;
    }
    return true;
  };

  AREAnimationInterface.prototype.getAnimationName = function(property) {
    var type;
    if (AREAnimationInterface._animationMap[property] === void 0) {
      return false;
    } else {
      type = AREAnimationInterface._animationMap[property];
      if (type === AREBezAnimation) {
        return "bezier";
      } else if (type === AREPsyxAnimation) {
        return "psyx";
      } else if (type === AREVertAnimation) {
        return "vert";
      }
    }
  };

  AREAnimationInterface.prototype.animate = function(actorID, property, options) {
    var a, actor, name, _i, _len, _ref, _spawnAnim;
    param.required(actorID);
    property = JSON.parse(param.required(property));
    options = JSON.parse(param.required(options));
    options.start = param.optional(options.start, 0);
    actor = null;
    _ref = ARERenderer.actors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      a = _ref[_i];
      if (a.getId() === actorID) {
        actor = a;
        break;
      }
    }
    if (actor === null) {
      throw new Error("Actor not found, can't animate! " + actorId);
    }
    name = property[0];
    if (options.property === void 0) {
      options.property = property;
    }
    _spawnAnim = function(_n, _a, _o) {
      if (AREAnimationInterface._animationMap[_n] === AREBezAnimation) {
        return new AREBezAnimation(_a, _o).animate();
      } else if (AREAnimationInterface._animationMap[_n] === AREPsyxAnimation) {
        return new AREPsyxAnimation(_a, _o).animate();
      } else if (AREAnimationInterface._animationMap[_n] === AREVertAnimation) {
        return new AREVertAnimation(_a, _o).animate();
      } else {
        return ARELog.warn("Unrecognized property: " + _n);
      }
    };
    if (options.start > 0) {
      return setTimeout((function() {
        return _spawnAnim(name, actor, options);
      }), options.start);
    } else {
      return _spawnAnim(name, actor, options);
    }
  };

  AREAnimationInterface.prototype.preCalculateBez = function(options) {
    var ret;
    options = JSON.parse(param.required(options));
    param.required(options.startVal);
    param.required(options.endVal);
    param.required(options.duration);
    options.controlPoints = param.required(options.controlPoints, []);
    options.fps = param.required(options.fps, 30);
    ret = new AREBezAnimation(null, options, true).preCalculate();
    return JSON.stringify(ret);
  };

  return AREAnimationInterface;

})();

AREInterface = (function() {
  function AREInterface() {
    this._Actors = new AREActorInterface();
    this._Engine = new AREEngineInterface();
    this._Animations = new AREAnimationInterface();
  }

  AREInterface.prototype.Actors = function() {
    return this._Actors;
  };

  AREInterface.prototype.Engine = function() {
    return this._Engine;
  };

  AREInterface.prototype.Animations = function() {
    return this._Animations;
  };

  return AREInterface;

})();

AREEngine = (function() {
  function AREEngine(width, height, cb, logLevel, canvas) {
    param.required(width);
    param.required(height);
    param.required(cb);
    ARELog.level = param.optional(logLevel, 4);
    canvas = param.optional(canvas, "");
    this._renderIntervalId = null;
    this._framerate = 1.0 / 60.0;
    if (window._ === null || window._ === void 0) {
      return ARELog.error("Underscore.js is not present!");
    }
    if (window.cp === void 0 || window.cp === null) {
      return ARELog.error("Chipmunk-js is not present!");
    }
    this._renderer = new ARERenderer(canvas, width, height);
    this.startRendering();
    cb(this);
  }

  AREEngine.prototype.setFPS = function(fps) {
    return this._framerate = 1.0 / fps;
  };

  AREEngine.prototype.startRendering = function() {
    if (this._renderIntervalId !== null) {
      return;
    }
    ARELog.info("Starting render loop");
    return this._renderIntervalId = setInterval(((function(_this) {
      return function() {
        return _this._renderer.render();
      };
    })(this)), this._framerate);
  };

  AREEngine.prototype.stopRendering = function() {
    if (this._renderIntervalId === null) {
      return;
    }
    ARELog.info("Halting render loop");
    clearInterval(this._renderIntervalId);
    return this._renderIntervalId = null;
  };

  AREEngine.prototype.setClearColor = function(r, g, b) {
    r = param.optional(r, 0);
    g = param.optional(g, 0);
    b = param.optional(b, 0);
    if (this._renderer instanceof ARERenderer) {
      return this._renderer.setClearColor(r, g, b);
    }
  };

  AREEngine.prototype.getClearColor = function() {
    if (this._renderer instanceof ARERenderer) {
      return this._renderer.getClearColor();
    } else {
      return null;
    }
  };

  AREEngine.prototype.getWidth = function() {
    if (this._renderer === null || this._renderer === void 0) {
      return -1;
    } else {
      return this._renderer.getWidth();
    }
  };

  AREEngine.prototype.getHeight = function() {
    if (this._renderer === null || this._renderer === void 0) {
      return -1;
    } else {
      return this._renderer.getHeight();
    }
  };

  AREEngine.prototype.requestPickingRender = function(buffer, cb) {
    if (this._renderer === null || this._renderer === void 0) {
      return ARELog.warn("Can't request a pick render, renderer not instantiated!");
    } else {
      return this._renderer.requestPickingRender(buffer, cb);
    }
  };

  AREEngine.prototype.getGL = function() {
    if (ARERenderer._gl === null) {
      ARELog.warn("Render not instantiated!");
    }
    return ARERenderer._gl;
  };

  return AREEngine;

})();

window.AdefyGLI = new AREInterface;

//# sourceMappingURL=are.js.map
