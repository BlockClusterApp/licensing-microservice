const mongoose = require('mongoose');
const Sentry = require('@sentry/node');

const config = require('../config');
require('./redis');

function initializeSentry(app) {
  Sentry.init({
    dsn: config.dsnSentry,
    environment: process.env.NODE_ENV,
    release: process.env.COMMIT_HASH,
    maxBreadcrumbs: 20,
    attachStacktrace: true,
    serverName: `licensing Microservice ${process.env.NODE_ENV || 'local'}`,
    enabled: true,
  });

  app.use(Sentry.Handlers.errorHandler());
}

function initializeMongo() {
  mongoose
    .connect(
      config.mongo.url,
      { useNewUrlParser: true }
    )
    .then(
      () => {
        console.log('Connected to Mongo');
      },
      err => console.log('Error connecting to Mongo', err)
    );
}

function initiazlizeCors(app) {
  const whileListedURLs = [];

  switch (process.env.NODE_ENV) {
    case 'production':
      whileListedURLs.push('https://app.blockcluster.io');
      whileListedURLs.push('https://admin.blockcluster.io');
      break;
    case 'staging':
      whileListedURLs.push('https://staging.blockcluster.io');
      break;
    case 'test':
      whileListedURLs.push('https://test.blockcluster.io');
      break;
    case 'dev':
      whileListedURLs.push('https://dev.blockcluster.io');
      break;
    default:
      whileListedURLs.push('*');
  }
  app.use((req, res, next) => {
    if (whileListedURLs.includes('*') || (req.get('origin') && whileListedURLs.includes(req.get('origin'))) || whileListedURLs.includes(req.headers.host)) {
      res.header('Access-Control-Allow-Origin', req.get('origin'));
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
      res.header('Access-Control-Allow-Credentials', true);
      res.header(
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Headers, Content-Type, Authorization, Content-Length, X-Requested-With, Pragma, Cache-Control, If-Modified-Since, withCredentials, x-access-key, X-Access-Key'
      );

      // intercept OPTIONS method
      if (req.method === 'OPTIONS') {
        res.sendStatus(204);
      } else {
        next();
      }
    } else {
      next();
    }
  });
}

module.exports = app => {
  initializeSentry(app);
  initializeMongo();
  initiazlizeCors(app);
};
