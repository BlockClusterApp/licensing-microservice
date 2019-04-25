const Promise = require('bluebird');

const FeatureController = require('../../apis/controllers/feature');

const InitFeatures = ['Payments', 'SupportTicket', 'Vouchers', 'Invoice', 'CardToCreateNetwork', 'Hyperion', 'Admin', 'Paymeter'];

async function main() {
  const features = await FeatureController.fetchFeatures();

  await Promise.each(InitFeatures, async feature => {
    if (features.find(f => f.name === feature)) {
      return true;
    }
    console.log('Adding feature', feature);
    return FeatureController.add(feature, true);
  });

  return true;
}

(async () => {
  await require('../index')();
  await main();
  console.log('Finished Migration', __filename);
  process.exit(0);
})();
