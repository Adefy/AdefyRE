var AREVector2;

AREVector2 = (function() {
  function AREVector2(x, y) {
    this.x || (this.x = 0);
    this.y || (this.y = 0);
  }


  /*
   * @param [Boolean] bipolar should randomization occur in all directions?
   * @return [AREVector2] randomizedVector
   */

  AREVector2.prototype.random = function(options) {
    var bipolar, seed, x, y;
    options || (options = {});
    bipolar = !!options.bipolar;
    seed = options.seed || Math.random() * 0xFFFF;
    x = Math.random() * this.x;
    y = Math.random() * this.y;
    if (bipolar) {
      if (Math.random() < 0.5) {
        x = -x;
      }
      if (Math.random() < 0.5) {
        y = -y;
      }
    }
    return new AREVector2(x, y);
  };


  /*
   * @param [AREVector2]
   * @return [AREVector2]
   */

  AREVector2.prototype.add = function(other) {
    return new AREVector2(this.x + other.x, this.y + other.y);
  };


  /*
   * @param [AREVector2]
   * @return [AREVector2]
   */

  AREVector2.prototype.sub = function(other) {
    return new AREVector2(this.x - other.x, this.y - other.y);
  };


  /*
   * @param [AREVector2]
   * @return [AREVector2]
   */

  AREVector2.prototype.mul = function(other) {
    return new AREVector2(this.x * other.x, this.y * other.y);
  };


  /*
   * @param [AREVector2]
   * @return [AREVector2]
   */

  AREVector2.prototype.div = function(other) {
    return new AREVector2(this.x / other.x, this.y / other.y);
  };


  /*
   * @return [AREVector2]
   */

  AREVector2.prototype.floor = function() {
    return new AREVector2(Math.floor(this.x), Math.floor(this.y));
  };


  /*
   * @return [AREVector2]
   */

  AREVector2.prototype.ceil = function() {
    return new AREVector2(Math.ceil(this.x), Math.ceil(this.y));
  };


  /*
   * @return [AREVector2]
   */

  AREVector2.zero = function() {
    return new AREVector2(0, 0);
  };

  return AREVector2;

})();
