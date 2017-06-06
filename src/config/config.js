var path = require('path');

var rootPath = path.normalize(__dirname + '/../../../');

var config = {
  development: {
    rootPath: rootPath,
    port: process.env.PORT || 8080
  },
  production: {
    rootPath: rootPath,
    port: process.env.PORT || 80
  }
};

module.exports = config;