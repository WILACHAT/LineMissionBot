const fs = require('fs');
const path = require('path');
const { replyToUser } = require('../services/lineBotService');
const db = require('../db');

function logToFile(message) {
  const logFilePath = path.join(__dirname, 'debug.log');
  fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
}

exports.handleWebhook = async (req, res) => {
  logToFile('Received webhook event');

  for (const event of req.body.events) {
    let userId;

    if (event.type === 'message' || event.type === 'postback') {
      userId = event.source.userId; // Both message and postback events have a userId in the source object

      logToFile(`Processing event for user ID: ${userId}`);

      // Check if this user ID is already in the database
      const userExists = await db.checkUserExists(userId);

      if (!userExists) {
        logToFile(`User ID ${userId} not found in database. Inserting.`);
        try {
          const newUser = await db.saveNewUser(userId);
          logToFile(`New user inserted: ${JSON.stringify(newUser)}`);
        } catch (error) {
          logToFile(`Error inserting user: ${error.message}`);
          res.status(500).json({ error: error.message }); // Send a 500 error response
          return; 
        }
      }

      // Reply to the user if it's a message event
      if (event.type === 'message') {
        const replyToken = event.replyToken;
        await replyToUser(replyToken);
      }
    } else {
      // Handle other event types as necessary
      logToFile(`Unhandled event type: ${event.type}`);
    }
  }

  res.status(200).end(); // End the response after handling all events
};
