'use strict';
const clientCreate = require('./apis/client_init');
const app = require('fastify')();



app.get('/ping', (req, res) => {
  res.code(200).send('pong');
});

require('./apis/middlewares')(app);

/*
 * Client Section.
 * 
 **/
app.post('/client/create_client', (req, res, next) => {
  if (!req.body.client_id || !req.body.client_details) {
    return res.code(400).send({
      message: 'client id or client_details is missing.'
    });
  }
  clientCreate
    .createClient(req.body, req.query)
    .then(data => {
      return res.send(data);
    })
    .catch(error => {
      console.log(error);
      return res.code(error.status ? error.status : 500).send({
        message: error.message ? error.message : 'Internal Server Error!'
      });
    });
});


require('./apis/routes')(app);

app.get('/*',(req, res) => {
  return res.send({ status: 'somehow its up!' });
});



if (require.main === module) {
  // called directly i.e. "node app"
  app.listen(process.env.PORT ? process.env.PORT : 3000, (err) => {
    if (err) console.error(err);
    console.log(`server listening on ${app.server.address().port}`);
  });
} else {
  // required as a module => executed on aws lambda
  module.exports.handler = app;
}
