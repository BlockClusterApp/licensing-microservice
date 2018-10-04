

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const clientCreate = require('./apis/client_init');
const loginController = require('./apis/auth.client');
const config = require('./config/index');

const app = express();

// eslint-disable-next-line import/order
const http = require('http').Server(app);
// eslint-disable-next-line import/order
const io = require('socket.io').listen(http);

// enable the use of request body parsing middleware
app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

function emittion(topic, data) {
  return io.sockets.emit(`/${topic}`, data);
}

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

app.post('/timesheets', checkJwt, (req, res) => {
  // eslint-disable-next-line
  let timesheet = req.body;

  // Save the timesheet entry to the database...

  // send the response
  res.status(201).send(timesheet);
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

/*
 * Client Section.
 *
 * */
app.post('/client/create_client', (req, res) => {
  if (!req.body.client_id || !req.body.client_details) {
    return res.status(400).send({
      message: 'client id or client_details is missing.',
    });
  }
  clientCreate
    .createClient(req.body, req.query)
    .then(data => res.send(data))
    .catch((error) => {
      console.log(error);
      return res.status(error.status ? error.status : 500).send({
        message: error.message ? error.message : 'Internal Server Error!',
      });
    });
  return true;
});


app.get('/client/oauth', async (req, res) => {
  const mainData = await loginController.oauthController(
    req.query.code,
    JSON.parse(req.query.state),
  );

  emittion(mainData.topic, mainData.tokens.id_token);
  return res.json(mainData);
});
app.get('/callback/first', (req, res) => res.send('Hi there , you lgged in'));

app.get('/client/login', (req, res) => {
  if (!req.query.license_key) {
    throw new Error('No license key found');
  }
  return res.redirect(
    loginController.construct_login(req.query.license_key).url,
  );
});
app.get('/*', (req, res) => res.send({ status: 'somehow its up!' }));

require('./apis/routes')(app);

app.get('/*', (req, res) => res.redirect(302, 'https://www.blockcluster.io'));

if (require.main === module) {
  // called directly i.e. "node app"
  http.listen(process.env.PORT ? process.env.PORT : 3000, () => {
    console.log(
      `server listening on ${process.env.PORT ? process.env.PORT : 3000}`,
    );
  });
} else {
  // required as a module => executed on aws lambda
  module.exports = app;
}
