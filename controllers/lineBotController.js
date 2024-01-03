
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
        if (event.type === 'message' && event.message.type === 'text') {
           
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
            const userMessage = event.message.text;
            let url;
            switch (userMessage) {
                case 'button1_command':
                url = 'https://waan.ngrok.app/progress';
                break;
                case 'button2_command':
                url = 'https://waan.ngrok.app/progress';
                break;
                case 'button2_command':
                url = 'https://waan.ngrok.app/';
                break;
                // Add cases for other rich menu buttons
                default:
                url = 'https://waan.ngrok.app';
            }


            // Store the userId in the session
           
                        
            // Reply to the user if it's a message event
            try {
                req.session.userId = user.UserID;
                logToFile(`Session user ID set: ${req.session.userId}`);
            } catch (error) {
                logToFile(`Error setting session user ID: ${error.message}`);
            }
            
            const replyToken = event.replyToken;
            await replyToUser(replyToken, url);
        } 
       
        else {
            // Handle other event types as necessary
            logToFile(`Unhandled event type: ${event.type}`);
        }
        
    }

    res.status(200).end(); // End the response after handling all events
};
