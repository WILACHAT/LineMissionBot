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



exports.handleWebhook = async (req, res) => {
  console.log("what is going on")

  for (const event of req.body.events) {
      if (event.type === 'message' && event.message.type === 'text') {
          console.log("inside the event")

         
          const lineId = event.source.userId; // Retrieve the lineId from the event source

          let user = await db.getUserByLineId(lineId);


          if (!user) {
              try {
                  user = await db.saveNewUser(lineId);
                  console.log("fucker save user", user)

              } catch (error) {
                  res.status(500).json({ error: error.message }); // Send a 500 error response
                  return;
              }
          }
          const userMessage = event.message.text;
          let url;
          switch (userMessage) {
              case 'one':
              url = 'https://octopus-app-sys7a.ondigitalocean.app/progress';
              break;
              case 'two':
              url = 'https://octopus-app-sys7a.ondigitalocean.app';
              break;
              case 'three':
              url = 'https://octopus-app-sys7a.ondigitalocean.app';
              break;
              case 'four':
              url = 'https://octopus-app-sys7a.ondigitalocean.app/history';
              break;

              // Add cases for other rich menu buttons
              default:
              url = 'https://octopus-app-sys7a.ondigitalocean.app';
          }


          
          const replyToken = event.replyToken;
          await replyToUser(replyToken, url, user.UserID);
      } 
     
      else {
          console.log("what is this")
          // Handle other event types as necessary
      }
      
  }

  res.status(200).end(); // End the response after handling all events
};
