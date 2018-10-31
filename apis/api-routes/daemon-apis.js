const express = require('express');
const multer = require('multer');
const winston = require('winston');
require('winston-daily-rotate-file');

const router = express.Router();
const Licence = require('../../schema/license-schema');
const loginController = require('../controllers/auth.client');
// const versionController = require('../controllers/version');
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

router.post('/licence/validate', async (req, res) => {
  let licence = await Licence.findOne({
    'licenseDetails.licenseKey': req.licenceKey,
  });

  const metadata = {
    blockclusterAgentVersion: '1.0',
    webappVersion: '', // await versionController.getLatest('webapp'),
    shouldDaemonDeployWebapp: false,
    activatedFeatures: [],
  };

  if (licence) {
    metadata.clientId = licence.clientId;
    if (!licence.servicesIncluded) {
      await Licence.updateOne(
        {
          _id: licence._id,
        },
        {
          $set: {
            servicesIncluded: {
              Payments: true,
              SupportTicket: true,
              Vouchers: true,
              Invoice: true,
              CardToCreateNetwork: true,
              Hyperion: true,
            },
          },
        }
      );
    }
    licence = await Licence.findOne({
      'licenseDetails.licenseKey': req.licenceKey,
    });
    metadata.activatedFeatures = Object.keys(licence.servicesIncluded).filter(serviceName => !!licence.servicesIncluded[serviceName]);
  }

  function updateAgentInfo(_licence, body = {}) {
    if (!_licence) {
      return () => {};
    }
    const allowedKeys = ['daemonVersion', 'webAppVersion'];
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

module.exports = router;
