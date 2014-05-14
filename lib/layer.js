  var p2re = require('path-to-regexp');

function MyLayer(path, middleWare) {
  var self = this;
  self.path = path;
  self.handle = middleWare;
  self.match = function (path) {
// 1st method to solved "should decode uri encoding"
    path = path.match(/%20/g) ? decodeURIComponent(path) : path;
    // Counts how many times the slash'/' appears in the larger String
    // can also be `path.replace(/[^\/]/g, '').length`
    // or `path.split('/').length - 1`
    path = (path.match(/\//g) || []).length > 3
      ? path.substring(0, path.lastIndexOf('/')) : path;
    if(self.path.substr(-1) == '/') {
      return self.path.substr(0, self.path.length - 1);
    }
    var re = p2re(self.path, [], {end: false});
    if (re.test(path))
      return { path: re.exec(path)[0],
        params: {
          a: re.exec(path)[1],
          b: re.exec(path)[2]
        }
      }

//    if (path.indexOf(self.path) >= 0)
//      return {path: self.path};
  }
  return self;
}

module.exports = MyLayer;
