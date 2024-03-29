var AREPolygonActor,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AREPolygonActor = (function(_super) {
  __extends(AREPolygonActor, _super);

  AREPolygonActor._INDICE_BUFFER_CACHE = {};

  AREPolygonActor._VERTEX_CACHE = {};

  AREPolygonActor._UV_CACHE = {};


  /*
   * Sets us up with the supplied radius and segment count, generating our
   * vertex sets.
   *
   * NOTE: Texture support is not available! No UVs! ;(
   *
   * @param [ARERenderer] renderer
   * @param [Number] radius
   * @param [Number] segments
   */

  function AREPolygonActor(renderer, radius, segments) {
    var psyxVerts, uvs, verts;
    this.radius = radius;
    this.segments = segments;
    param.required(radius);
    if (this.radius instanceof Array) {
      this._verts = this.radius;
      this.radius = null;
      uvs = this.generateUVs(this._verts);
      AREPolygonActor.__super__.constructor.call(this, renderer, this._verts, uvs);
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
      AREPolygonActor.__super__.constructor.call(this, renderer, verts, uvs);
      this.setPhysicsVertices(psyxVerts);
    }
    this.setRenderMode(ARERenderer.GL_MODE_TRIANGLE_FAN);
    this.validateCacheEntry();
  }


  /*
   * @private
   * Private method that rebuilds our vertex array.
   *
   * @param [Object] options optional generation options
   * @options options [Boolean] mode generation mode (normal, or for physics)
   */

  AREPolygonActor.prototype.generateVertices = function(options) {
    var cacheLookup, cachedVertexSet, i, radFactor, tanFactor, theta, tx, ty, verts, x, y, _i, _j, _ref, _ref1, _tv;
    options || (options = {});
    cacheLookup = "" + this.radius + "." + this.segments + "." + options.mode;
    cachedVertexSet = AREPolygonActor._VERTEX_CACHE[cacheLookup];
    if (cachedVertexSet) {
      return cachedVertexSet;
    }
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
    AREPolygonActor._VERTEX_CACHE[cacheLookup] = verts;
    return verts;
  };


  /*
   * Generate UV array from a vertex set, using our current radius
   *
   * @return [Array<Number>] uvs
   */

  AREPolygonActor.prototype.generateUVs = function(vertices) {
    var cacheLookup, cachedUVSet, uvs, v, _i, _len;
    param.required(vertices);
    cacheLookup = "" + this.radius + "." + this.segments;
    cachedUVSet = AREPolygonActor._UV_CACHE[cacheLookup];
    if (cachedUVSet) {
      return cachedUVSet;
    }
    uvs = [];
    for (_i = 0, _len = vertices.length; _i < _len; _i++) {
      v = vertices[_i];
      uvs.push(((v / this.radius) / 2) + 0.5);
    }
    AREPolygonActor._UV_CACHE[cacheLookup] = uvs;
    return uvs;
  };


  /*
   * Preforms a full vert refresh (vertices, physics vertics, and UVs)
   * @private
   */

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


  /*
   * Ensure we are in the cache under our radius/segments pair, if no other poly
   * is.
   */

  AREPolygonActor.prototype.validateCacheEntry = function() {
    var cacheLookup, cachedActor;
    cacheLookup = "" + this.radius + "." + this.segments;
    if (AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup]) {
      cachedActor = AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup];
      return this.setHostIndiceBuffer(cachedActor.getIndiceBuffer(), cachedActor.getId());
    } else {
      AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup] = this;
      return this.clearHostIndiceBuffer();
    }
  };


  /*
   * Removes the Actor, cleaning the cache
   *
   * @return [null]
   */

  AREPolygonActor.prototype.destroy = function() {
    var cacheLookup;
    cacheLookup = "" + this.radius + "." + this.segments;
    if (AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup] === this) {
      AREPolygonActor._INDICE_BUFFER_CACHE[cacheLookup] = null;
    }
    return AREPolygonActor.__super__.destroy.call(this);
  };


  /*
   * Get stored radius
   *
   * @return [Number] radius
   */

  AREPolygonActor.prototype.getRadius = function() {
    return this.radius;
  };


  /*
   * Get stored segment count
   *
   * @return [Number] segments
   */

  AREPolygonActor.prototype.getSegments = function() {
    return this.segments;
  };


  /*
   * Set radius, causes a full vert refresh
   *
   * @param [Number] radius
   */

  AREPolygonActor.prototype.setRadius = function(radius) {
    this.radius = radius;
    if (radius <= 0) {
      throw new Error("Invalid radius: " + radius);
    }
    this.fullVertRefresh();
    return this.validateCacheEntry();
  };


  /*
   * Set segment count, causes a full vert refresh
   *
   * @param [Number] segments
   */

  AREPolygonActor.prototype.setSegments = function(segments) {
    this.segments = segments;
    if (segments <= 2) {
      throw new ERror("Invalid segment count: " + segments);
    }
    this.fullVertRefresh();
    return this.validateCacheEntry();
  };

  return AREPolygonActor;

})(ARERawActor);
