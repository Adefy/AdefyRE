var ARETriangleActor,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ARETriangleActor = (function(_super) {
  __extends(ARETriangleActor, _super);


  /*
   * Sets us up with the supplied base and height, generating both our vertex
   * and UV sets.
   *
   * @param [Number] base
   * @param [Number] height
   */

  function ARETriangleActor(base, height) {
    var uvs, verts;
    this.base = base;
    this.height = height;
    param.required(base);
    param.required(height);
    if (base <= 0) {
      throw new Error("Invalid base: " + base);
    }
    if (height <= 0) {
      throw new Error("Invalid height: " + height);
    }
    verts = this.generateVertices();
    uvs = this.generateUVs();
    ARETriangleActor.__super__.constructor.call(this, verts, uvs);
  }


  /*
   * Generate array of vertices using our dimensions
   *
   * @return [Array<Number>] vertices
   */

  ARETriangleActor.prototype.generateVertices = function() {
    var hB, hH;
    hB = this.base / 2;
    hH = this.height / 2;
    return [-hB, -hH, 0, hH, hB, -hH, -hB, -hH];
  };


  /*
   * Generate array of UV coordinates
   *
   * @return [Array<Number>] uvs
   */

  ARETriangleActor.prototype.generateUVs = function() {
    return [0, 1, 0, 0, 1, 0, 1, 1];
  };


  /*
   * Get stored base
   *
   * @return [Number] base
   */

  ARETriangleActor.prototype.getBase = function() {
    return this.base;
  };


  /*
   * Get stored height
   *
   * @return [Number] height
   */

  ARETriangleActor.prototype.getHeight = function() {
    return this.height;
  };


  /*
   * Set base, causes a vert refresh
   *
   * @param [Number] base
   */

  ARETriangleActor.prototype.setBase = function(base) {
    this.base = base;
    return this.updateVertBuffer(this.generateVertices());
  };


  /*
   * Set height, causes a vert refresh
   *
   * @param [Number] height
   */

  ARETriangleActor.prototype.setHeight = function(height) {
    this.height = height;
    return this.updateVertBuffer(this.generateVertices());
  };

  return ARETriangleActor;

})(ARERawActor);
