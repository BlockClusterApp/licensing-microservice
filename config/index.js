module.exports = {
  mongo: {
    url: process.env.MONGO_URL,
    db: process.env.MONGO_DB || 'admin',
  },
  jwt: {
    secret: 'sakfgvbskdr1234u787iJHGNKrgk',
  },
  AUTH0_BASE_URL: process.env.AUTH0_BASE_URL || 'https://saikatharryc.auth0.com',
  AUTH0_APP_CLIENT: process.env.AUTH0_APP_CLIENT || 'fwUmzlpz3fU1XPVzaNRDrRzgLBZ0QZ3Y',
};
