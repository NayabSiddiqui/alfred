var express = require('express');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('./src/server/config/config')[env];

var app = express();

app.listen(config.port, () => {
  console.log('Server listening on port ' + config.port + '...');
});