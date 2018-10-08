const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const config = require('../config');

const api = {};

api.includeRoutes = app => {
  const client = require('./api-routes/client-apis');
  const auth = require('./api-routes/auth-apis');
  const cli = require('./api-routes/cli-apis');

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
    if (req.headers['x-access-key'] !== config.pages_accessKey) {
      return next({
        status: 401,
        message: 'Unauthenticated.',
      });
    }
    return next();
  }
  app.use('/client/*', isAuthenticatedPages);
  app.use('/client', client);
  app.use('/auth', auth);
  app.use('/cli/*', cli, checkJwt);
};

module.exports = api;
