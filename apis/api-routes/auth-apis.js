const express = require('express');

const router = express.Router();
const loginController = require('../controllers/auth.client');

router.get('/callback/first', (req, res) => res.send('Hi there , you logged in'));

router.get('/login', (req, res) => {
  if (!req.query.license_key) {
    throw new Error('No license key found');
  }
  return res.redirect(loginController.constructLogin(req.query.license_key).url);
});

module.exports = router;
