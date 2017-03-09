'use strict';

const debug = require('debug')('cfgram:gallery-router');
const createError = require('http-errors');
const parseJSON = require('body-parser').json();
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Gallery = require('../model/gallery.js');
const Router = require('express').Router;

const galleryRouter = module.exports = Router();

galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next) {
  debug('GET: /api/gallery/:id');
  Gallery.findById(req.params.id)
  .then(gallery => {
    if (gallery.userID.toString() !== req.user._id.toString()) return next(createError(401, 'invalid user')); //check that the user is trying to access their own gallery
    res.json(gallery);
  })
  .catch(next);
});

galleryRouter.get('/api/gallery', bearerAuth, function(req, res, next) {
  debug('GET (list): /api/gallery');

  Gallery.find({}, function(err, galleries) {
    if (err) return(next(err));
    var ids = [];
    galleries.forEach(gallery => ids.push(gallery._id)); //take just the IDs from the returned objects
    res.json(ids);
  });
});

galleryRouter.post('/api/gallery', bearerAuth, parseJSON, function(req, res, next) {
  debug('POST: /api/gallery');
  // if (req._body === false) return next(createError(400, 'bad request'));
  req.body.userID = req.user._id; //associate the user with the gallery before creating the new gallery and saving it to the db
  new Gallery(req.body).save()
  .then(gallery => res.json(gallery))
  .catch(next);
});

galleryRouter.put('/api/gallery/:id', bearerAuth, parseJSON, function(req, res, next) {
  debug('PUT: /api/gallery/:id');

  if (req._body !== true) return next(createError(400, 'bad request'));
  Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true } )
  .then(gallery => res.json(gallery))
  .catch(next);
});

galleryRouter.delete('/api/gallery/:id', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/gallery/:id');

  Gallery.findByIdAndRemove(req.params.id)
  .then( () => res.status(204).send())
  .catch(next);
});
