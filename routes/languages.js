const express = require('express');
const { publicList } = require('../services/languages');

const router = express.Router();
router.get('/', (req, res) => res.json(publicList()));

module.exports = router;
