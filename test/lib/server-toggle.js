'use strict';

const debug = require('debug')('cfgram:server-toggle');

module.exports = exports = {};

exports.serverOn = function(server, done) {
  if (!server.isRunning) {
    server.listen(3003, () => {
      server.isRunning = true;
      debug('server is up!');
      done();
    });
    return;
  }
  done();
};

exports.serverOff = function(server, done) {
  if (server.isRunning) {
    server.close(err => {
      if (err) console.error('error in server.close', err);
      server.isRunning = false;
      debug('server is off!');
      done();
    });
    return;
  }
  done();
};
