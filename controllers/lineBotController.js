const { replyToUser } = require('../services/lineBotService');

exports.handleWebhook = async (req, res) => {
  // Log the incoming webhook event
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  if (req.body.events && req.body.events.length > 0) {
    const replyToken = req.body.events[0].replyToken;
    await replyToUser(replyToken); // Call the function to reply to the user
  }

  res.status(200).end();
};
