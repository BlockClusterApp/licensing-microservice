module.exports = {
  mongo: {
    url: process.env.MONGO_URL,
    db: "admin"
  },
  AUTH0_BASE_URL:
    process.env.AUTH0_BASE_URL || "https://saikatharryc.auth0.com",
  AUTH0_APP_CLIENT:
    process.env.AUTH0_APP_CLIENT || "fwUmzlpz3fU1XPVzaNRDrRzgLBZ0QZ3Y",
  MY_HOST: process.env.MY_HOST || "http://localhost:3000",
  
};
