const express = require('express');

const router = express.Router();
const clientController = require('../controllers/client_init');
const MetricsController = require('../controllers/metric-consumer');
const FeatureController = require('../controllers/feature');
const License = require('../../schema/license-schema');

router.post('/create_client', (req, res, next) => {
  if (!req.body.clientDetails) {
    return res.status(400).send({
      message: 'client_details is missing.',
    });
  }
  clientController
    .createClient(req.body)
    .then(data => res.send(data))
    .catch(error => {
      console.log(error);
      return next({
        status: error.status ? error.status : '500',
        message: error.message ? error.message : 'Internal Server Error!',
      });
    });
  return true;
});

router.get('/features', async (req, res) => {
  const list = await FeatureController.fetchFeatures();
  res.json({
    data: list,
  });
});

router.post('/features', async (req, res) => {
  const { name, activated } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Feature name is required' });
  }
  const result = await FeatureController.add(name, activated);
  res.json({
    data: result,
  });
  return true;
});

/**
 * in filter just pass clientsIds comma separated in query
 */
router.get('/filter', (req, res, next) => {
  const query = req.query.query ? JSON.parse(req.query.query) : {};
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const page = req.query.page ? Number(req.query.page) : 0;
  clientController
    .getClients(query, limit, page)
    .then(data => res.json(data))
    .catch(error => next(error));
});

router.post('/license-generate', async (req, res, next) => {
  if (!req.body.clientId) {
    return next({
      message: 'Invalid client',
      status: 400,
    });
  }
  return clientController
    .clientLicenseUpdate(req.body)
    .then(data => res.json(data))
    .catch(error => next(error));
});

router.post('/reset-secret', async (req, res, next) => {
  if (!req.body.clientId) {
    return next({ status: 400, message: 'invalid client Id' });
  }
  const updateStat = await clientController.resetclientSecret(req.body.clientId);
  return res.json(updateStat);
});

router.patch('/', async (req, res) => {
  const result = await clientController.patchClient(req.body);
  return res.json(result);
});

router.use('/metrics*', async (req, res, next) => {
  const clientId = await License.findClientIdFromId(req.query.clientId);
  req.clientId = clientId;
  return next();
});

router.get('/metrics/:type/:resourceName', async (req, res) => {
  const metrics = await MetricsController.fetchMetrics(req.clientId, req.params.type, req.params.resourceName);
  res.json(metrics);
});

router.get('/metrics/:type', async (req, res) => {
  const metrics = await MetricsController.fetchMetrics(req.clientId, req.params.type);
  res.json(metrics);
});

router.get('/metrics', async (req, res) => {
  const metrics = await MetricsController.fetchMetrics(req.clientId);
  res.json(metrics);
});

module.exports = router;
