const express = require('express');

const router = express.Router();
const clientController = require('../controllers/client_init');

router.post('/create_client', (req, res) => {
  if (!req.body.clientDetails) {
    return res.status(400).send({
      message: 'client_details is missing.',
    });
  }
  clientController
    .createClient(req.body, req.query)
    .then(data => res.send(data))
    .catch(error => {
      console.log(error);
      return res.status(error.status ? error.status : 500).send({
        message: error.message ? error.message : 'Internal Server Error!',
      });
    });
  return true;
});

/**
 * in filetr just pass clientsIds comma seperated in query
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

router.post('/reset-secret', async (req, res) => {
  if (!req.body.clientId) {
    return { error: 400, message: 'invalid client Id' };
  }
  const updateStat = await clientController.resetclientSecret(req.body.clientId);
  return res.json(updateStat);
});

module.exports = router;
