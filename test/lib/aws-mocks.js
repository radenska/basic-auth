'use strict';

const AWS = require('aws-sdk-mock');

module.exports = exports = {};

exports.uploadMock = {
  ETag: '"1234abcd"',
  Location: 'https://mockurl.com/mock.png',
  Key: '1234.png',
  key: '1234.png',
  Bucket: 'cfgrambackend42'
};

AWS.mock('S3', 'upload', function(params, callback) {
  if (!params.ACL === 'public-read') return callback(new Error('ACL must be public-read'));
  if (!params.Bucket === 'cfgrambackend42') return callback(new Error('bucket must be cfgram-testing'));
  if (!params.Key) return callback(new Error('key required'));
  if (!params.Body) return callback(new Error('body required'));

  callback(null, exports.uploadMock);
});
