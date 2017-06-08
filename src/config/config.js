var path = require('path');

var rootPath = path.normalize(__dirname + '/../../../');

var config = {
  development: {
    rootPath: rootPath,
    port: process.env.PORT || 8080,
    leaveApiRootUrl: 'http://localhost:8081/api'
  },
  production: {
    rootPath: rootPath,
    port: process.env.PORT || 80,
    leaveApiRootUrl: 'TODO'
  }
};

module.exports = config;