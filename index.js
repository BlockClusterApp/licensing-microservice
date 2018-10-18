const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const Sentry = require('@sentry/node');

const loginController = require('./apis/controllers/auth.client');
const apiRoutes = require('./apis/route.includes');

const whileListedURLs = [];

switch (process.env.NODE_ENV) {
  case 'production':
    whileListedURLs.push('https://app.blockcluster.io');
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

const corsOptions = {
  origin(origin, cb) {
    if (!origin || whileListedURLs.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
};

const app = express();

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

app.use(cors(corsOptions));
// eslint-disable-next-line import/order
const http = require('http').Server(app);
// eslint-disable-next-line import/order
const io = require('socket.io').listen(http);
const config = require('./config');

// Raven.config(config.dsnSentry).install();

Sentry.init({
  dsn: config.dsnSentry,
  environment: process.env.NODE_ENV,
  release: process.env.COMMIT_HASH,
  maxBreadcrumbs: 20,
  attachStacktrace: true,
  serverName: `licensing Microservice ${process.env.NODE_ENV}`,
  enabled: true,
});

mongoose.connect(
  config.mongo.url,
  { useNewUrlParser: true }
);

// app.use(Raven.requestHandler());

// enable the use of request body parsing middleware
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
function emittion(topic, data) {
  return io.sockets.emit(`/${topic}`, data);
}
app.get('/client/oauth', async (req, res) => {
  const mainData = await loginController.oauthController(req.query.code, JSON.parse(req.query.state));

  emittion(mainData.topic, mainData.tokens.id_token);

  return res.send('You Are Good to Go!');
});

apiRoutes.includeRoutes(app);

app.use(Sentry.Handlers.errorHandler());
// eslint-ignore-next-line no-unused-vars
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  // res.status(err.status || 500).json({ err: err.message });
  const errorObj = {
    service: 'licensing_microservice',
  };
  if (err.status === 400) {
    if (err.validationErrors) {
      errorObj.validationErrors = err.validationErrors;
    }
    errorObj.message = err.message || 'Invalid Values Supplied';
    errorObj.head = err.head || null;
  } else if (err.status === 401 || err.status === 403) {
    errorObj.head = err.head || null;
    errorObj.message = err.message || 'Unauthorised User';
  } else if (err.status === 500) {
    errorObj.head = err.head || null;

    errorObj.message = err.message;

    errorObj.message = 'Internal Server Error';
  } else if (err.status === 404) {
    errorObj.head = err.head || null;
    errorObj.message = err.message;
  } else {
    errorObj.head = err.head || null;

    errorObj.message = err.message;

    errorObj.message = 'Unknown Error Occured';
  }

  next();
  return res.status(err.status || 500).json(errorObj);
});

if (require.main === module) {
  // called directly i.e. "node app"
  http.listen(process.env.PORT ? process.env.PORT : 4000, () => {
    console.log(`server listening on ${process.env.PORT ? process.env.PORT : 4000}`);
  });
} else {
  // required as a module => executed on aws lambda
  module.exports = app;
}
