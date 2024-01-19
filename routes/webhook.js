const express = require('express');
const router = express.Router();
const { validateSignature } = require('../middlewares/signatureValidation');
const lineBotController = require('../controllers/lineBotController');

router.post('/webhook', validateSignature, lineBotController.handleWebhook);

module.exports = router;