const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io').listen(http);

const config = require('./config');
const loginController = require('./apis/controllers/auth.client');
const apiRoutes = require('./apis/route.includes');

mongoose.connect(
  config.mongo.url,
  { useNewUrlParser: true }
);

// enable the use of request body parsing middleware
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

function emittion(topic, data) {
  return io.sockets.emit(`/${topic}`, data);
}
app.get('/client/oauth', async (req, res) => {
  const mainData = await loginController.oauthController(req.query.code, JSON.parse(req.query.state));

  emittion(mainData.topic, mainData.tokens.id_token);

  return res.send('You Are Good to Go!');
});

apiRoutes.includeRoutes(app);
require('./apis/routes')(app);

// app.get('/*', (req, res) => res.redirect(302, 'https://www.blockcluster.io'));

if (require.main === module) {
  // called directly i.e. "node app"
  http.listen(process.env.PORT ? process.env.PORT : 3000, () => {
    console.log(`server listening on ${process.env.PORT ? process.env.PORT : 3000}`);
  });
} else {
  // required as a module => executed on aws lambda
  module.exports = app;
}
