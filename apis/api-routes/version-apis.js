const express = require('express');

const router = express.Router();
const versionController = require('../controllers/version_save');

router.post('/takeIn', (req, res, next) => {
  if (!req.body.version || !req.body.app) {
    return next({
      status: 400,
      message: 'version & app required',
    });
  }
  return versionController
    .saveVersion(req.body.version, req.body.app)
    .then(data => res.json(data))
    .catch(error => next(error));
});

router.get('/list', (req, res, next) => {
  const query = {};
  if (!req.query.app) {
    next({
      message: 'App is required.',
      status: 400,
    });
  }
  Object.assign(query, { app: req.query.app });
  if (req.query.version) {
    Object.assign(query, { version: req.query.version });
  }
  return versionController
    .searchVersion(query)
    .then(data => res.json(data))
    .catch(error => next({ error: 'Unknown Error Occured', stack: error, status: 400 }));
});

router.get('/latest', (req, res, next) => {
  if (!req.query.app) {
    next({
      message: 'App is required.',
      status: 400,
    });
  }

  return versionController
    .getLatest(req.query.app)
    .then(data => res.json(data))
    .catch(error => next({ error: 'Unknown Error Occured', stack: error, status: 400 }));
});

module.exports = router;
