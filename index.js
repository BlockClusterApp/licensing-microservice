const app = require('fastify')();

const clientCreate = require('./apis/client_init');

app.get('/ping', (req, res) => {
  res.code(200).send('pong');
});

require('./apis/middlewares')(app);

/*
 * Client Section.
 *
 * */
app.post('/client/create_client', (req, res) => {
  if (!req.body.client_id || !req.body.client_details) {
    return res.code(400).send({
      message: 'client id or client_details is missing.',
    });
  }
  clientCreate
    .createClient(req.body, req.query)
    .then(data => res.send(data))
    .catch((error) => {
      console.log(error);
      return res.code(error.status ? error.status : 500).send({
        message: error.message ? error.message : 'Internal Server Error!',
      });
    });

  return true;
});

require('./apis/routes')(app);

app.get('/*', (req, res) => res.redirect(302, 'https://www.blockcluster.io'));

if (require.main === module) {
  // called directly i.e. "node app"
  app.listen(process.env.PORT ? process.env.PORT : 3000, '0.0.0.0', (err) => {
    if (err) console.error(err);
    console.log(`server listening on ${app.server.address().port}`);
  });
} else {
  // required as a module => executed on aws lambda
  module.exports.handler = app;
}
