const express = require('express');
const router = express.Router();
const { getAgentCatalog, getAgentProduct } = require('../controllers/agentController');

router.get('/', getAgentCatalog);
router.get('/:id', getAgentProduct);

module.exports = router;
