const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');

const loginController = require('./apis/controllers/auth.client');
const apiRoutes = require('./apis/route.includes');
const bootstrap = require('./boot');

const app = express();

app.use(morgan('dev'));
app.use(helmet());

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// eslint-disable-next-line import/order
const http = require('http').Server(app);
// eslint-disable-next-line import/order
const io = require('socket.io').listen(http);

bootstrap(app);

// enable the use of request body parsing middleware
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
function emission(topic, data) {
  return io.sockets.emit(`/${topic}`, data);
}
app.get('/client/oauth', async (req, res) => {
  const mainData = await loginController.oauthController(req.query.code, JSON.parse(req.query.state));

  emission(mainData.topic, mainData.tokens.id_token);

  return res.send('You Are Good to Go!');
});

app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});

apiRoutes.includeRoutes(app);

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
    errorObj.message = err.message || 'Unauthorized User';
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

    errorObj.message = 'Unknown Error Occurred';
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
