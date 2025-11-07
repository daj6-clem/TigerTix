const express = require('express');
const router = express.Router();
const { parseInput } = require('../controllers/llmController');

router.post('/parse', parseInput);

module.exports = router;
