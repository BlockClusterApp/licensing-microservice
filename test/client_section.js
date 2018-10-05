const test = require('ava');
const mongoUnit = require('mongo-unit');

const testMongoUrl = 'mongodb://saikat:saikat95@ds135156.mlab.com:35156/tasking';
const clientInit = require('../apis/controllers/client_init');

test.beforeEach('before each running', async () => {
  await mongoUnit.initDb(testMongoUrl, [{ a: 1, b: 2 }]);
});
test.afterEach('after each running', async () => {
  await mongoUnit.drop();
});
let createdClient;
test('create client', async t => {
  const clientDetails = {
    clientDetails: {
      clientName: 'test',
      emailId: 'test@test.com',
      phone: '9191919191',
    },
  };
  const queryChain = {
    gen_license: 'true',
    expire: '3',
  };
  createdClient = await clientInit.createClient(clientDetails, queryChain);
  t.is(createdClient.client.clientDetails.clientName, 'test', 'Client Creation Failing');
  t.is(createdClient.licenseDetails.licenseKey.length, 21, 'License Creation Failing');
});
