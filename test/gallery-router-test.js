'use strict';

require('./lib/test-env.js');

const expect = require('chai').expect;
const request = require('superagent');
const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');
const url = 'http://localhost:3003';
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;


const testUser = {
  username: 'testUser',
  password: 'word',
  email: 'testUser@user.com'
};

const testGallery = {
  name: 'testGallery name',
  desc: 'testGallery description'
};

require('../server.js');

describe('Gallery Routes', function() {
  beforeEach(done => {
    let user = new User(testUser);
    user.generatePasswordHash(testUser.password)
    .then(user => {
      user.save();
      this.tempUser = user;
      return user.generateToken();
    })
    .then(token => {
      this.tempToken = token;
      done();
    })
    .catch(done);
  });
  beforeEach(done => { //make a gallery and save it to db, needed for GET, PUT, and DELETE
    testGallery.userID = this.tempUser._id.toString();
    new Gallery(testGallery).save()
    .then(gallery => {
      this.tempGallery = gallery;
      done();
    })
    .catch(done);
  });
  afterEach(done => { //remove user and gallery db entries
    Promise.all([
      User.remove({}),
      Gallery.remove({})
    ])
    .then( () => {
      delete testGallery.userID; //remove user ID
      done();
    })
    .catch(done);
  });
  describe('POST: /api/gallery', () => {
    describe('with a valid body and token', () => {
      it('should return a gallery', done => {
        request.post(`${url}/api/gallery`)
        .send(testGallery)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end((err, res) => {
          if (err) return done(err);
          let date = new Date(res.body.created).toString();
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(testGallery.name);
          expect(res.body.desc).to.equal(testGallery.desc);
          expect(date).to.not.equal('invalid date');
          expect(res.body.userID.toString()).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });
    describe('wthout a valid token', () => {
      it('should return a 401 error', done => {
        request.post(`${url}/api/gallery`)
        .send(testGallery)
        .end(err => {
          expect(err.status).to.equal(401);
          done();
        });
      });
    });
    describe('without a valid body', () => {
      it('should return a 400 error', done => {
        request.post(`${url}/api/gallery`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end(err => {
          expect(err.status).to.equal(400);
          done();
        });
      });
    });
  });
  describe('GET: /ap1/s0m3rand0mwr0ngr0ut3', () => {
    describe('with an invalid route', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/ap1/s0m3rand0mwr0ngr0ut3`)
        .end(err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
  describe('GET: /api/gallery', () => {
    describe('with a valid token', () => {
      it('should return a list of gallery IDs in the db', done => {
        request.get(`${url}/api/gallery`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(1);
          // expect(res.body[0]).to.equal(this.tempGallery._id.toString);
          done();
        });
      });
    });
    describe('without a valid token', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/gallery`)
        .end(err => {
          expect(err.status).to.equal(401);
          done();
        });
      });
    });
  });
  describe('GET: /api/gallery/:id', () => {
    describe('with a valid id and token', () => {
      it('should return a gallery', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end((err, res) => {
          if (err) return done(err);
          let date = new Date(res.body.created).toString();
          expect(date).to.not.equal('invalid date');
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(testGallery.name);
          expect(res.body.desc).to.equal(testGallery.desc);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });
    describe('wthout a valid token', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .end(err => {
          expect(err.status).to.equal(401);
          done();
        });
      });
    });
    describe('with an invalid id' , () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/gallery/1nval1did`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end(err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
  describe('DELETE: /api/gallery/:id', () => {
    describe('with a valid id and token', () => {
      it('should return a 204 code', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
      });
    });
    describe('without a valid id', () => {
      it('should return a 404 error code', done => {
        request.delete(`${url}/api/gallery/1nvalid1d`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end(err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
    describe('without a valid token', () => {
      it('should return a 401 error code', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
        .end(err => {
          expect(err.status).to.equal(401);
          done();
        });
      });
    });
  });
  describe('PUT: /api/gallery/:id', () => {
    var update = { name: 'updated gallery name', desc: 'updated gallery description' };
    describe('with a valid body, id, and token', () => {
      it('should return an updated gallery', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send(update)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(update.name);
          expect(res.body.desc).to.equal(update.desc);
          done();
        });
      });
    });
    describe('without a valid body', () => {
      it('should return a 400 error', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end(err => {
          expect(err.status).to.equal(400);
          done();
        });
      });
    });
    describe('without a valid token', () => {
      it('should return a 401 error', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send(update)
        .end(err => {
          expect(err.status).to.equal(401);
          done();
        });
      });
    });
    describe('without a valid gallery id', () => {
      it('should return a 404 error', done => {
        request.put(`${url}/api/gallery/00p5wr0ng1d`)
        .send(update)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end(err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
});
