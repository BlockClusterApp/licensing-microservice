const express = require('express');
const multer = require('multer');

const router = express.Router();
const Licence = require('../../schema/license-schema');
const loginController = require('../controllers/auth.client');
// const versionController = require('../controllers/version');
const aws = require('../controllers/aws');
const licenceInjector = require('../middlewares/license-injector');
const LogController = require('../controllers/log-store');

const upload = multer();

router.use(licenceInjector);

router.post('/licence/validate', async (req, res) => {
  const licence = await Licence.findOne({
    'licenseDetails.licenseKey': req.licenceKey,
  });

  const metadata = {
    blockclusterAgentVersion: '1.0',
    webappVersion: '', // await versionController.getLatest('webapp'),
    shouldDaemonDeployWebapp: false,
  };

  if (licence) {
    metadata.clientId = licence.clientId;
  }

  if (req.authToken === 'fetch-token' && req.licenceKey) {
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
  res.send(result);
});

router.post('/info/:type', upload.none(), (req, res) => {
  if (!['nodes', 'pods', 'logs'].includes(req.params.type)) {
    return res.status(400).send('Unauthorized');
  }
  console.log('Body', req.body);
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
