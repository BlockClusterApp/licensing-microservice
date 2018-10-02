module.exports = {
  mongo: {
    url: process.env.MONGO_URL,
    db: process.env.MONGO_DB || 'admin'
  },
  jwt: {
    secret: 'sakfgvbskdr1234u787iJHGNKrgk'
  }
};
