const mongoose = require('mongoose');

const config = require('../config');

/* eslint-disable implicit-arrow-linebreak */
module.exports = () =>
  new Promise(resolve => {
    mongoose
      .connect(
        config.mongo.url,
        { useNewUrlParser: true }
      )
      .then(
        () => {
          console.log('Connected to Mongo');
          resolve();
        },
        err => {
          console.log('Error connecting to Mongo', err);
          process.exit(1);
        }
      );
  });
