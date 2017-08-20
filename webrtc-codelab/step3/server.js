var static = require('node-static');
var http = require('http');
var file = new(static.Server)();
var app = http.createServer(function (req, res) {
  console.log('aaa');
  file.serve(req, res);
}).listen(3001, (cb) => console.log('server is runnig on 3001'));