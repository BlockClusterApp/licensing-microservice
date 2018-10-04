"use strict";
const express = require("express");
const bodyParser = require("body-parser");
var crypto = require("crypto");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const path = require('path');
const clientCreate = require("./apis/client_init");
const loginContrller = require("./apis/auth.client");

const app = express();

var http = require("http").Server(app);
var io = require("socket.io").listen(http);

// enable the use of request body parsing middleware
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

function emittion(topic, data) {
    return io.sockets.emit("/" + topic, data);
}

const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://saikatharryc.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  // audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://saikatharryc.auth0.com/`,
  algorithms: ["RS256"]
});

app.post("/timesheets", checkJwt, function(req, res) {
  var timesheet = req.body;

  // Save the timesheet entry to the database...

  //send the response
  res.status(201).send(timesheet);
});

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

/*
 * Client Section.
 * 
 **/
app.post("/client/create_client", (req, res) => {
  if (!req.body.client_id || !req.body.client_details) {
    return res.status(400).send({
      message: "client id or client_details is missing."
    });
  }
  clientCreate
    .createClient(req.body, req.query)
    .then(data => {
      return res.send(data);
    })
    .catch(error => {
      console.log(error);
      return res.status(error.status ? error.status : 500).send({
        message: error.message ? error.message : "Internal Server Error!"
      });
    });
});

app.get("/client/oauth", async (req, res) => {
  const main_data = await loginContrller.oauthController(
    req.query.code,
    JSON.parse(req.query.state)
  );

  emittion(main_data.topic, main_data.tokens.id_token);
  return res.json(main_data);
});
app.get("/callback/first", (req, res) => {
  return res.send("Hi there , you lgged in");
});

app.get("/client/login", (req, res) => {
  if (!req.query.license_key) {
    throw "No license key found";
  }
  return res.redirect(
    loginContrller.construct_login(req.query.license_key).url
  );
});
app.get("/*", (req, res) => {
  return res.send({ status: "somehow its up!" });
});

if (require.main === module) {
  // called directly i.e. "node app"
  http.listen(process.env.PORT ? process.env.PORT : 3000, () => {
    console.log(
      `server listening on ${process.env.PORT ? process.env.PORT : 3000}`
    );
  });
} else {
  // required as a module => executed on aws lambda
  module.exports = app;
}
