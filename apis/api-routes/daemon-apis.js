const express = require('express');

const router = express.Router();
const Licence = require('../../schema/license-schema');
const loginController = require('../controllers/auth.client');
const aws = require('../controllers/aws');
const licenceInjector = require('../middlewares/license-injector');
const LogController = require('../controllers/log-store');

router.use(licenceInjector);

router.post('/licence/validate', async (req, res) => {
  const metadata = {
    blockclusterAgentVersion: '1.0',
    webappVersion: '1.0',
    shouldDaemonDeployWebapp: false,
  };
  if (req.authToken === 'fetch-token' && req.licenceKey) {
    const licence = await Licence.findOne({
      'licenseDetails.licenseKey': req.licenceKey,
    });
    if (!licence) {
      return res.send({
        success: false,
        error: 'Licence key not valid',
        errorCode: 401,
      });
    }
    const token = loginController.generateToken(licence.licenseDetails.licenseKey);
    return res.send({
      success: true,
      message: token,
      metadata,
    });
  }
  if (Math.floor(new Date().getTime() / 1000) < req.jwt.exp - 60 * 60) {
    const token = loginController.generateToken(req.licenceKey);
    return res.send({
      success: true,
      message: token,
      metadata,
    });
  }
  return res.send({
    success: true,
    message: req.token,
    metadata,
  });
});

router.post('/aws-creds', async (req, res) => {
  const result = await aws.generateAWSCreds(req.licenceKey);
  console.log('Generating aws creds', result);
  res.send(result);
});

router.post('/info/:type', (req, res) => {
  if (!['nodes', 'pods'].includes(req.params.type)) {
    return res.status(400).send('Unauthorized');
  }
  LogController.storeLogs({
    type: req.params.type,
    info: req.body.info,
    key: req.licenceKey,
  });
  res.send({
    success: true,
  });
  return null;
});

module.exports = router;
