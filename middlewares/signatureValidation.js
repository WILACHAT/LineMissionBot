const crypto = require('crypto');
const { channelSecret } = require('../config');
const { replyToUser } = require('../services/lineBotService');
const db = require('../db');

exports.validateSignature = (req, res, next) => {
  const signature = req.headers['x-line-signature'];

  const hash = crypto
    .createHmac('sha256', channelSecret)
    .update(req.rawBody)
    .digest('base64');

  if (signature === hash) {
    console.log('Signature verified!');
    next();
  } else {
    console.log('Signature verification failed!');
    res.status(403).send('Signature mismatch');
  }
};

