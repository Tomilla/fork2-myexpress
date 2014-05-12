function MyLayer(path, middleWare) {
  var self = this;
  self.path = path;
  self.handle = middleWare;
  self.match = function (path) {
    if (path.indexOf(self.path) >= 0)
      return {"path": self.path};
  }
  return self;
}

module.exports = MyLayer;
