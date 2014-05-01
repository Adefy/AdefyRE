var ARELog;

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
