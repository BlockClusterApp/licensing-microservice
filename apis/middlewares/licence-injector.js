const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = app => {
  app.use((req, res, next) => {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth) {
      return next();
    }
    const b64Token = auth.split(' ')[1];
    console.log('Token', b64Token);
    if (!b64Token) {
      return res.status(401).send({ success: false, error: 'Unauthorized' });
    }
    let token = Buffer.from(b64Token.trim(), 'base64').toString();
    if (token === 'fetch-token') {
      req.licenceKey = req.body.licence;
      req.authToken = token;
      return next();
    }

    req.token = token;
    token = Buffer.from(token, 'base64').toString();
    let verified;
    try {
      verified = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      console.log('Token expired');
      verified = false;
      return res.status(401).send({
        success: false,
        error: 'Token expired',
      });
    }
    req.jwt = {
      token,
      payload: jwt.decode(token),
      verified: !!verified,
    };
    req.licenceKey = verified.key;
    return next();
  });
};
