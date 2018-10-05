const crypto = require('crypto');
const request = require('request-promise');

const config = require('../../config/index');

function base64URLEncode(str) {
  return str
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer) {
  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest();
}

function constructLogin(licenseKey) {
  const randomKey = crypto.randomBytes(32);
  const verifier = base64URLEncode(randomKey);
  const buffer = JSON.stringify(randomKey);
  const bufferData = JSON.parse(buffer).data;
  // var verifier = 'abc';
  console.log(verifier);
  const challenge = base64URLEncode(sha256(verifier));
  const auth0Client = config.AUTH0_APP_CLIENT;
  const scopeVar = 'openid read:client_grants offline_access';
  //   var aud_var = "cashpositive";
  const state = {
    bufferData,
    licenseKey,
  };
  const callbackURI = 'http://localhost:3000/client/oauth';
  const url = `${
    config.AUTH0_BASE_URL
  }/authorize?scope=${scopeVar}&response_type=code&client_id=${auth0Client}&code_challenge=${challenge}&code_challenge_method=S256&redirect_uri=${callbackURI}&state=${JSON.stringify(
    state
  )}`;
  console.log(url);
  return { url, verification_key: bufferData, licenseKey };
}

async function oauthController(code, state) {
  const verifier = state.bufferData;
  const { licenseKey } = state;
  const randomKey = base64URLEncode(Buffer.from(verifier));
  const callbackURI = 'http://localhost:3000/client/oauth';
  const options = {
    method: 'POST',
    url: `${config.AUTH0_BASE_URL}/oauth/token`,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: config.AUTH0_BASE_URL,
      code_verifier: randomKey,
      code,
      redirect_uri: callbackURI,
    }),
  };
  const tokens = await request(options);
  return { tokens: JSON.parse(tokens), topic: licenseKey };
}
module.exports = {
  constructLogin,
  oauthController,
  base64URLEncode,
};
