'use strict';

require('./lib/test-env.js');

const Pic = require('../model/pic.js');
const Gallery = require('../model/gallery.js');
const User = require('../model/user.js');
const serverToggle = require('./lib/server-toggle.js');
const expect = require('chai').expect;
const request = require('superagent');
const server = require('../server.js');
const url = 'http://localhost:3003';
const awsMocks = require('./lib/aws-mocks.js');

const testUser = {
  username: 'testUser',
  password: 'word',
  email: 'testUser@test.com'
};

const testGallery = {
  name: 'testGallery name',
  desc: 'testGallery description'
};

const testPic = {
  name: 'testpicname',
  desc: 'test pic description',
  image: `${__dirname}/data/tester.png`
};

describe('Pic Routes', function() {
  before(done => serverToggle.serverOn(server, done));
  after(done => serverToggle.serverOff(server, done));

  beforeEach(done => {
    new User(testUser)
    .generatePasswordHash(testUser.password)
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
  beforeEach(done => {
    testGallery.userID = this.tempUser._id.toString();
    new Gallery(testGallery).save()
    .then(gallery => {
      this.tempGallery = gallery;
      done();
    })
    .catch(done);
  });

  afterEach(done => {
    Promise.all([
      Pic.remove({}),
      User.remove({}),
      Gallery.remove({})
    ])
    .then( () => done())
    .catch(done);
  });
  afterEach(done => {
    delete testGallery.userID;
    done();
  });

  describe('POST: /api/gallery/:galleryID/pic', () => {
    describe('with a valid body', () => {
      it('should return a pic', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id.toString()}/pic`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .field('name', testPic.name)
        .field('desc', testPic.desc)
        .attach('image', testPic.image)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.name).to.equal(testPic.name);
          expect(res.body.desc).to.equal(testPic.desc);
          expect(res.body.galleryID).to.equal(this.tempGallery._id.toString());
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
    describe('without a valid body', () => {
      it('should return a 400 error', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id.toString()}/pic`)
        .set( { Authorization: `Bearer ${this.tempToken}`} )
        .end(err => {
          expect(err.status).to.equal(400);
          done();
        });
      });
    });
    describe('with an invalid galleryID', () => {
      it('should return a 404 error', done => {
        request.post(`${url}/api/gallery/00p5th1515s0wr0ng/pic`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .field('name', testPic.name)
        .field('desc', testPic.desc)
        .attach('image', testPic.image)
        .end(err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
});
  // describe('DELETE: /api/gallery/:galleryID/pic/:picID', () => {
  //   describe('with valid pic, user, and gallery ids', () => {
  //     before(done => {
  //       request.post(`${url}/api/gallery/${this.tempGallery._id.toString()}/pic`)
  //       .set( { Authorization: `Bearer ${this.tempToken}` } )
  //       .field('name', testPic.name)
  //       .field('desc', testPic.desc)
  //       .attach('image', testPic.image)
  //       .end((err, res) => {
  //         if (err) return done(err);
  //         this.tempPic = res.body;
  //         done();
  //       });
  //       done();
  //     });
      // before(done => {
      //   let picProps = {
      //     name: testPic.name,
      //     desc: testPic.desc,
      //     userID: this.tempUser._id,
      //     galleryID: this.tempGallery._id,
      //     objectKey: '077a7aa47fd359ad6d14d95db1bbb31a.png',
      //     imageURI: 'https://cfgrambackend42.s3.amazonaws.com/077a7aa47fd359ad6d14d95db1bbb31a.png'
      //   }
      //   new Pic(picProps).save()
      //   .then(pic => {
      //     this.tempPic = pic;
      //     done();
      //   })
      //   .catch(done);
      // });
  //     it('should return a 204 code', done => {
  //       request.delete(`${url}/api/gallery/${this.tempGallery._id.toString()}/pic/${this.tempPic._id.toString()}`)
  //       .set( { Authorization: `Bearer ${this.tempToken}` } )
  //       .end((err, res) => {
  //         if (err) return done(err);
  //         expect(res.status).to.equal(204);
  //         done();
  //       });
  //     });
  //   });
  // });
// });
