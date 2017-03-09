'use strict';

const debug = require('debug')('cfgram:basic-auth-middleware');
const createError = require('http-errors');

module.exports = function (req, res, next) {
  debug('basic-auth-middleware');

  var authHeader = req.headers.authorization;
  if (!authHeader) return next(createError(401, 'authorization headers required'));

  var base64string = authHeader.split('Basic ')[1]; //takes the username and password part of the auth header
  if (!base64string) return next(createError(401, 'username and password required'));

  var utf8string = new Buffer(base64string, 'base64').toString(); //turns our string into a readable by humans string
  var authArray = utf8string.split(':'); //puts the username in index 0 of array and the password in index 1

  req.auth = { //create new property auth of request object
    username: authArray[0],
    password: authArray[1]
  };

  if (!req.auth.username) return next(createError(401, 'username required'));
  if (!req.auth.password) return next(createError(401, 'password required'));

  next();
};
