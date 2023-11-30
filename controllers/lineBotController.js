const fs = require('fs');
const path = require('path');
const { replyToUser } = require('../services/lineBotService');
const db = require('../db');
const { generateSecureToken } = require('../utils/tokenUtils'); // Ensure you have this utility


function logToFile(message) {
    const logFilePath = path.join(__dirname, 'debug.log');
    fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
}

exports.handleWebhook = async (req, res) => {
    logToFile('Received webhook event');

    for (const event of req.body.events) {
        if (event.type === 'message') {
            const lineId = event.source.userId; // Retrieve the lineId from the event source
            logToFile(`Processing event for line ID: ${lineId}`);

            let user = await db.getUserByLineId(lineId);
            logToFile(`Retrieved user: ${JSON.stringify(user)}`);


            if (!user) {
                logToFile(`Line ID ${lineId} not found in database. Inserting.`);
                try {
                    user = await db.saveNewUser(lineId);
                    logToFile(`New user inserted: ${JSON.stringify(user)}`);
                } catch (error) {
                    logToFile(`Error inserting user: ${error.message}`);
                    res.status(500).json({ error: error.message }); // Send a 500 error response
                    return;
                }
            }

            // Store the userId in the session
            req.session.userId = user.id;
            logToFile(`User ID set in session: ${req.session.userId}`);
                        
            // Reply to the user if it's a message event
            const replyToken = event.replyToken;
            await replyToUser(replyToken);
        } 
        else if (event.type === 'postback' && event.postback.data === 'action=redirect') {
          const userId = event.source.userId;
          logToFile(`Handling postback for user: ${userId}`);

          // Generate a secure, temporary token for this user
          const token = generateSecureToken(userId);

          // Store this token and userId in a database for later retrieval
          // Assuming you have a function saveTokenForUser in your db module
          try {
            await db.saveTokenForUser(userId, token);
            logToFile(`Token saved for user: ${userId}`);
        } catch (error) {
            logToFile(`Error saving token: ${error.message}`);
            res.status(500).json({ error: error.message });
            return;
        }
        }
        
        else {
            // Handle other event types as necessary
            logToFile(`Unhandled event type: ${event.type}`);
        }
        
    }

    res.status(200).end(); // End the response after handling all events
};
