'use strict';

const debug = require('debug')('cfgram:auth-routes');
const parseJSON = require('body-parser').json();
const Router = require('express').Router;
const basicAuth = require('../lib/basic-auth-middleware.js');
const User = require('../model/user.js');
const createError = require('http-errors');

const authRouter = module.exports = Router();

authRouter.post('/api/signup', parseJSON, function(req, res, next) {
  debug('POST: /api/signup');

  let password = req.body.password;
  delete req.body.password; //remove the password which is in plain text
  let user = new User(req.body);
  user.generatePasswordHash(password)
  .then(user => user.save()) //save new user info to db
  .then(user => user.generateToken()) //generate a new auth token
  .then(token => res.send(token)) //send auth token to user
  .catch(err => {
    next(createError(400, err.message));
  });
});

authRouter.get('/api/signin', basicAuth, function(req, res, next) {
  debug('GET: /api/signin');
  User.findOne( { username: req.auth.username }) //find the user name entered by the user from the request object where we put it in basic auth middleware
  .then(user => user.comparePasswordHash(req.auth.password)) //compare user entered password to hash of actual user password
  .then(user => user.generateToken) //make a token after confirming passwords match
  .then(token => res.send(token)) //send user the token as part of authorization process
  .catch(next);
});
