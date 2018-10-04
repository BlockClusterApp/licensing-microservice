const crypto = require("crypto");
const mongo = require("../helpers/mongo_querys");
const request = require("request-promise");
const config = require('../config/index');

function base64URLEncode(str) {
  return str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function sha256(buffer) {
  return crypto
    .createHash("sha256")
    .update(buffer)
    .digest();
}

function construct_login(license_key) {
  var random_key = crypto.randomBytes(32);
  var verifier = base64URLEncode(random_key);
  const buffer = JSON.stringify(random_key);
  var buffer_data =JSON.parse(buffer).data;
  // var verifier = 'abc';
  console.log(verifier);
  var challenge = base64URLEncode(sha256(verifier));
  var auth0_client = config.AUTH0_APP_CLIENT;
  var scope_var = "openid read:client_grants offline_access";
//   var aud_var = "cashpositive";
var state={
    buffer_data:buffer_data,
    license_key:license_key
}
  var callback_URI = `${config.MY_HOST}/client/oauth`;
  var url = `${config.AUTH0_BASE_URL}/authorize?scope=${scope_var}&response_type=code&client_id=${auth0_client}&code_challenge=${challenge}&code_challenge_method=S256&redirect_uri=${callback_URI}&state=${JSON.stringify(state)}`;
  console.log(url);
  return { url: url, verification_key: buffer_data,license_key:license_key };
}

async function oauthController(code,state) {
   var verifier = state.buffer_data;
   var license_key = state.license_key;
  var random_key = base64URLEncode(new Buffer(verifier));
  var callback_URI = `${config.MY_HOST}/client/oauth`;
  var options = {
    method: "POST",
    url: `${config.AUTH0_BASE_URL}/oauth/token`,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: config.AUTH0_BASE_URL,
      code_verifier: random_key,
      code: code,
      redirect_uri: callback_URI
    })
  };
const tokens= await request(options)
return {tokens:JSON.parse(tokens),topic:license_key};
}
module.exports = {
  construct_login,
  oauthController,
  base64URLEncode
};
