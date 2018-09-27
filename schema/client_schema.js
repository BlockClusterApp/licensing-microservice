const Schema = require("schm");

const LicenseSchema = Schema({
  client_id: {
    type: Number
  },
  createdAt: {
    type: Date
  },
  license_details: {
    type: {
      license_key: String,
      license_created: Date,
      license_expiry: Date
    }
  },
  license_token: [
    {
      access_token: String,
      expireBy: Date
    }
  ],
  client_details: {
    type: {
      client_name: String,
      email_id: String,
      phone: String
    }
  },
  status:{
    type:Boolean
  }
});
module.exports = {
  LicenseSchema
};
