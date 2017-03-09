'use strict';

const debug = require('debug')('cfgram:user');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const createError = require('http-errors');
const Promise = require('bluebird');

const Schema = mongoose.Schema;

const userSchema = Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  findHash: { type: String, unique: true }
});

userSchema.methods.generatePasswordHash = function(password) {
  debug('generatePasswordHash');
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => { //take the plain text password the user chose and turn it into a hash
      if (err) return reject(err);
      this.password = hash; //store the hashed password
      resolve(this);
    });
  });
};

userSchema.methods.comparePasswordHash = function(password) {
  debug('comparePasswordHash');
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, valid) => { //compare a user entered password with their hashed password
      if (err) return reject(err);
      if (!valid) return reject(createError(401, 'wrong password'));
      resolve(this);
    });
  });
};

userSchema.methods.generateFindHash = function() {
  debug('generateFindHash');
  return new Promise((resolve, reject) => {
    let tries = 0;
    _generateFindHash.call(this);
    function _generateFindHash() {
      this.findHash = crypto.randomBytes(32).toString('hex'); //assign to findHash a randomly generated hash for two step authentication
      this.save() //make sure to save it in db
      .then( () => resolve(this.findHash))
      .catch(err => {
        if (tries > 3) return reject(err);
        tries++;
        _generateFindHash.call(this); //try to generate the FindHash again until it has been tried 3 times
      });
    }
  });
};

userSchema.methods.generateToken = function() {
  debug('generateToken');
  return new Promise((resolve, reject) => {
    this.generateFindHash()
    .then(findHash => resolve(jwt.sign( { token: findHash }, process.env.APP_SECRET)))
    .catch(err => reject(err));
  });
};

module.exports = mongoose.model('user', userSchema);
