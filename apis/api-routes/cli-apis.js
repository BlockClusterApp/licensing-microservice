const express = require('express');

const router = express.Router();

router.get('/ping', (req, res) => res.json({ status: 'Ok' }));

module.exports = router;
