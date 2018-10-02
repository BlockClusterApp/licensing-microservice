'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../config');

function generateToken(key) {
  const token = jwt.sign(
    {
      key
    },
    config.jwt.secret,
    {
      expiresIn: '1m'
    }
  );
  const accessToken = Buffer.from(token).toString('base64');
  return accessToken;
}

module.exports = app => {
  app.post('/licence/validate', async (req, res) => {

    if (req.authToken === 'fetch-token' && req.licenceKey) {
      // TODO: Check in DB for this key
      const token = generateToken(req.licenceKey);
      return res.send({
        success: true,
        message: token
      });
    } else {
      if(Math.floor(new Date().getTime() / 1000) < req.jwt.exp - 60) {
        const token = generateToken(req.licenceKey);
        return res.send({
          success: true,
          message: token
        });
      }
      return res.send({
        success: true,
        message: req.token
      });
    }
  });
};
