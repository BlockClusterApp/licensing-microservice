const express = require('express');
const multer = require('multer');
const winston = require('winston');
require('winston-daily-rotate-file');

const router = express.Router();
const Licence = require('../../schema/license-schema');
const loginController = require('../controllers/auth.client');
// const versionController = require('../controllers/version');
const MetricConsumer = require('../controllers/metric-consumer');
const aws = require('../controllers/aws');
const licenceInjector = require('../middlewares/license-injector');

const clientLogger = winston.createLogger({
  format: winston.format.json(),
  level: 'info',
  transport: [new winston.transports.Console()],
});
if (['production', 'staging'].includes(process.env.NODE_ENV)) {
  clientLogger.add(
    new winston.transports.DailyRotateFile({
      filename: '/logs/client-logs-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: false,
      maxFiles: '2d',
      maxSize: '2g',
    })
  );
}

const upload = multer();

router.use(licenceInjector);

function updateAgentInfo(_licence, body = {}) {
  if (!_licence) {
    return () => {};
  }
  const allowedKeys = ['daemonVersion', 'webAppVersion', 'migrationVersion', 'migrationStatus', 'operationType'];
  if (body.webAppVersion === 'NotFetched') {
    delete body.webAppVersion;
  }
  Object.keys(body).forEach(prop => {
    if (!allowedKeys.includes(prop)) {
      delete body[prop];
    }
  });
  const agentInfo = { ..._licence.agentMeta, ...body };
  return async () => {
    await Licence.updateOne(
      {
        _id: _licence._id,
      },
      {
        $set: {
          agentMeta: agentInfo,
        },
      }
    );
  };
}

router.post('/licence/validate', async (req, res) => {
  const licence = await Licence.findOne({
    'licenseDetails.licenseKey': req.licenceKey,
  });

  const metadata = {
    blockclusterAgentVersion: '1.2',
    webAppVersion: '', // await versionController.getLatest('webapp'),
    shouldDaemonDeployWebapp: false,
    activatedFeatures: [],
    shouldWebAppRefreshAWSImageAuth: false,
    webappMigration: 0,
  };

  let clusterConfig = [];

  if (licence) {
    metadata.clientId = licence.clientId;
    metadata.shouldDaemonDeployWebapp = licence.agentMeta.shouldDaemonDeployWebApp;
    metadata.shouldWebAppRefreshAWSImageAuth = licence.agentMeta.shouldWebAppRefreshAWSImageAuth;
    metadata.webappMigration = licence.agentMeta.webappMigration;
    metadata.activatedFeatures = Object.keys(licence.servicesIncluded).filter(serviceName => !!licence.servicesIncluded[serviceName]);
    clusterConfig = [...licence.clusterConfig];
  }

  setTimeout(updateAgentInfo(licence, req.body), 0);
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
      clusterConfig,
    });
  }

  if (Math.floor(new Date().getTime() / 1000) < req.jwt.exp - 60 * 60) {
    const token = loginController.generateToken(req.licenceKey);
    return res.send({
      success: true,
      message: token,
      metadata,
      clusterConfig,
    });
  }
  return res.send({
    success: true,
    message: req.token,
    metadata,
    clusterConfig,
  });
});

router.post('/cluster-token', async (req, res) => {
  // Save cluster token
  const { token, identifier } = req.body;

  if (!token) {
    return res.status(400).json({
      error: true,
      message: 'Token is missing',
    });
  }
  if (!identifier) {
    return res.status(400).json({
      error: true,
      message: 'Identifier is missing',
    });
  }
});

router.get('/cluster-config', async (req, res) => {
  // Generate cluster config
});

router.post('/aws-creds', async (req, res) => {
  const result = await aws.generateAWSCreds(req.licenceKey);
  res.send(result);
});

router.post('/info/:type', upload.none(), (req, res) => {
  if (!['nodes', 'pods', 'logs'].includes(req.params.type)) {
    return res.status(401).send('Unauthorized');
  }
  if (Array.isArray(req.body)) {
    req.body.forEach(b => {
      const a = { ...b };
      delete a.date;
      const log = {
        timestamp: new Date(Math.floor(b.date) * 1000),
        ...a,
      };

      clientLogger.info(log);
    });
  }
  res.send({
    success: true,
  });
  return null;
});

router.post('/metrics', async (req, res) => {
  await MetricConsumer.consume(req);
  res.json({ success: true });
});

module.exports = router;
