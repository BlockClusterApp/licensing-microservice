const express = require('express');

const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../../config');

const aws = require('../controllers/aws');

function generateToken(key) {
  const token = jwt.sign(
    {
      key,
    },
    config.jwt.secret,
    {
      expiresIn: 'm',
    }
  );
  const accessToken = Buffer.from(token).toString('base64');
  return accessToken;
}

router.post('/licence/validate', (req, res) => {
  if (req.authToken === 'fetch-token' && req.licenceKey) {
    // TODO: Check in DB for this key
    const token = generateToken(req.licenceKey);
    return res.send({
      success: true,
      message: token,
    });
  }
  if (Math.floor(new Date().getTime() / 1000) < req.jwt.exp - 60 * 60) {
    const token = generateToken(req.licenceKey);
    return res.send({
      success: true,
      message: token,
    });
  }
  return res.send({
    success: true,
    message: req.token,
  });
});

router.post('/aws-creds', async (req, res) => {
  const result = await aws.generateAWSCreds(req.licenceKey);
  res.send(result);
});
module.exports = router;
