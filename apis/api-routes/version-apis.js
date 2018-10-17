const express = require('express');

const router = express.Router();
const versionController = require('../controllers/version_save');

router.post('/takeIn', (req, res, next) => {
  if (req.body.version && req.body.app) {
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

module.exports = router;
