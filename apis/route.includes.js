const jwt = require('express-jwt');
const cors = require('cors');
const jwksRsa = require('jwks-rsa');
const config = require('../config');

const api = {};

api.includeRoutes = app => {
  const client = require('./api-routes/client-apis');
  const auth = require('./api-routes/auth-apis');
  const cli = require('./api-routes/cli-apis');
  const daemon = require('./api-routes/daemon-apis');
  const versions = require('./api-routes/version-apis');

  const checkJwt = jwt({
    // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${config.AUTH0_BASE_URL}/.well-known/jwks.json`,
    }),

    // Validate the audience and the issuer.
    // audience: process.env.AUTH0_AUDIENCE,
    issuer: `${config.AUTH0_BASE_URL}/`,
    algorithms: ['RS256'],
  });
  function isAuthenticatedPages(req, res, next) {
    console.log(req.headers['x-access-key']);
    if (
      req.headers['x-access-key'] === undefined
      || new Date(
        Number(
          req.headers['x-access-key']
            .split('')
            .splice(1, 13)
            .join('')
        )
      ).getUTCHours() !== new Date().getUTCHours()
    ) {
      return next({
        status: 401,
        message: 'Unauthenticated.',
      });
    }
    return next();
  }
  // function versionAuth(req, res, next) {
  //   // do something for auth
  //   return next();
  // }
  app.use('/client/*', isAuthenticatedPages);
  app.use('/client', client);
  app.use('/auth', auth);
  app.use('/cli/*', cli, checkJwt);

  // app.use('/versions/*', versionAuth);
  app.use('/versions', versions);

  app.use('/daemon', cors());
  app.use('/daemon', daemon);
};

module.exports = api;
