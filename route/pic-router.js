'use strict';

const Pic = require('../model/pic.js');
const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const debug = require('debug')('cfgram:pic-router');
const path = require('path');
const multer = require('multer');
const AWS = require('aws-sdk');
const createError = require('http-errors');
const fs = require('fs');
const del = require('del');
const Router = require('express').Router;

AWS.config.setPromisesDependency(require('bluebird'));
const s3 = new AWS.S3();
const picDir = `${__dirname}/../data`;
const upload = multer( { dest: picDir } );

const picRouter = module.exports = Router();

function s3uploadProm(params) {
  debug('s3uploadProm');

  return new Promise(resolve => {
    s3.upload(params, (err, s3data) => {
      resolve(s3data);
    });
  });
}

picRouter.post('/api/gallery/:galleryID/pic', bearerAuth, upload.single('image'), function(req, res, next) {
  debug('POST: /api/gallery/:galleryID/pic');
  if (!req.file) return next(createError(400, 'file not found'));
  if (!req.file.path) return next(createError(500, 'file not saved'));

  let fileExt = path.extname(req.file.originalname);
  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${fileExt}`,
    Body: fs.createReadStream(req.file.path)
  };

  Gallery.findById(req.params.galleryID)
  .then( () => s3uploadProm(params))
  .then(s3data => {
    del([`${picDir}/*`]);
    let picData = {
      name: req.body.name,
      desc: req.body.desc,
      objectKey: s3data.Key,
      imageURI: s3data.Location,
      galleryID: req.params.galleryID,
      userID: req.user._id
    };
    return new Pic(picData).save();
  })
  .then(pic => res.json(pic))
  .catch(next);
});

// picRouter.delete('/api/gallery/:galleryID/pic/:picID', bearerAuth, function(req, res, next) {
//   debug('DELETE: /api/gallery/:galleryID/pic/:picID');
//
//   Pic.findByIdAndRemove(req.params.picID)
//   .then(res => {
//     let params = {
//       Bucket: process.env.AWS_BUCKET,
//       Key: res._id.toString()
//     }
//     s3.deleteObject(params);
//     res.status(204).send();
//   })
//   .catch(next);
// });
