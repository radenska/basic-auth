'use strict';

const debug = require('debug')('cfgram:server');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const authRouter = require('./route/auth-routes.js');
const galleryRouter = require('./route/gallery-router.js');
const picRouter = require('./route/pic-router.js');
const errors = require('./lib/error-middleware.js');
const dotenv = require('dotenv');
const PORT = 3003;

dotenv.load(); //use the variables in the .env file;

const app = express();

mongoose.connect(process.env.MONGODB_URI);

let morganFormat =  process.env.PRODUCTION ? 'common':'dev';

app.use(cors());
app.use(morgan(morganFormat));
app.use(authRouter);
app.use(galleryRouter);
app.use(picRouter);
app.use(errors);

const server = module.exports = app.listen(PORT, () => debug(`Listening on port ${PORT}.`));

server.isRunning = true;
