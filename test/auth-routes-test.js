'use strict';

require('./lib/test-env.js');

const expect = require('chai').expect;
const request = require('superagent');
const User = require('../model/user.js');
const url = 'http://localhost:3003';

require('../server.js');

const testUser = {
  username: 'testUser',
  password: 'word',
  email: 'testUser@test.com'
};

describe('Auth Routes', function() {
  describe('POST: /api/signup', function() {
    describe('with a valid body', function() {
      after(done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });
      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(testUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });
    describe('without a valid body', function() {
      it('should return a 400 error', done => {
        request.post(`${url}/api/signup`)
        .end(err => {
          expect(err.status).to.equal(400);
          done();
        });
      });
    });
  });
  describe('GET: /api/signin', function() {
    describe('with a valid authentication header', function() {
      before(done => {
        let user = new User(testUser);
        user.generatePasswordHash(user.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          done();
        });
      });
      after(done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });
      it('should return a token', done => {
        request.get(`${url}/api/signin`)
        .auth('testUser', 'word')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });
    describe('without a valid authentication header', function() {
      it('should return a 401 error', done => {
        request.get(`${url}/api/signin`)
        .end(err => {
          expect(err.status).to.equal(401);
          done();
        });
      });
    });
  });
});
