module.exports = {
  mongo: {
    url: process.env.MONGO_URL,
    db: 'admin',
  },
  AUTH0_BASE_URL: process.env.AUTH0_BASE_URL || 'https://saikatharryc.auth0.com',
  AUTH0_APP_CLIENT: process.env.AUTH0_APP_CLIENT || 'fwUmzlpz3fU1XPVzaNRDrRzgLBZ0QZ3Y',
  MY_HOST: process.env.MY_HOST || 'http://localhost:3000',
  sendgridAPIKey: process.env.sendgridAPIKey || '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',
  pages_accessKey: process.env.pages_accessKey || '12345678',
  dsnSentry: process.env.dsnSentry || 'https://fbb9e0f0d2e24f1387fa8210332d3a31@sentry.io/1302296',
  aws: {
    ACCESS_KEY_ID: 'AKIAISAETV4L47B4P3WA',
    SECRET_ACCESS_KEY: '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',
  },
};
