var p2re = require('path-to-regexp');

function MyLayer(path, middleWare, option) {
  var self = this;
  self.layerPath = path;
  self.handle = middleWare

  if (path[path.length - 1] == '/') {
    self.layerPath = path.slice(0, path.length - 1);
  }

  self.match = function (path) {
    option = option || false;
    var names = []
      , params = {}
      , optional = {end: option}
      , re = p2re(self.layerPath, names, optional);

    // Counts how many times the slash'/' appears in the larger String
    // can also be `path.replace(/[^\/]/g, '').length`
    // or `path.split('/').length - 1`
    //path = (path.match(/\//g) || []).length > 3
    //  ? path.substring(0, path.lastIndexOf('/')) : path;

    path = decodeURIComponent(path);

    if (re.test(path)) {
      var pathArray = re.exec(path);
      //Another Method: use iterator assign, respectively
      names.forEach(function (key, index) {
        params[key.name] = pathArray[index+1]
      });
      return { path: pathArray[0],
        params: params
      }
    } else {
      return undefined;
    }
  }
  return self;
}

module.exports = MyLayer;
