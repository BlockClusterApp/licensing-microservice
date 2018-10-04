const LogController = require('../controllers/log-store');

module.exports = (app) => {
  app.post('/info/:type', (req, res) => {
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
};
