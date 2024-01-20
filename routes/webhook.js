const express = require('express');
const router = express.Router();
const { validateSignature } = require('../middlewares/signatureValidation');
const { handleWebhook } = require('../middlewares/signatureValidation');


router.post('/webhook', validateSignature, handleWebhook);

module.exports = router;