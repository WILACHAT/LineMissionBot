const fs = require('fs');
const path = require('path');
const { sendImageWithUrl } = require('../services/lineBotService');
const db = require('../db');

function logToFile(message) {
    const logFilePath = path.join(__dirname, 'debug.log');
    fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
}

exports.handleWebhook = async (req, res) => {
    logToFile('Received webhook event');

    for (const event of req.body.events) {
        if (event.type === 'message' && event.message.type === 'text') {
            const lineId = event.source.userId;
            logToFile(`Processing event for line ID: ${lineId}`);

            let user = await db.getUserByLineId(lineId);
            logToFile(`Retrieved user: ${JSON.stringify(user)}`);

            if (!user) {
                try {
                    user = await db.saveNewUser(lineId);
                    logToFile(`New user inserted: ${JSON.stringify(user)}`);
                } catch (error) {
                    logToFile(`Error inserting user: ${error.message}`);
                    res.status(500).json({ error: error.message });
                    return;
                }
            }

            const userMessage = event.message.text;
            let imageUrl;
            let url;
            let title;
            let text;

            switch (userMessage) {
                case 'ดูความคืบหน้า':
                    url = 'https://whale-app-63n8p.ondigitalocean.app/progress';
                    imageUrl = 'https://res.cloudinary.com/linema/image/upload/v1706023133/missionwrong_ftyr3n.jpg';
                    title = 'Progress';
                    text = 'Progress';

                    break;
                case 'สร้างเซสชันภารกิจ':
                    url = 'https://whale-app-63n8p.ondigitalocean.app';
                    imageUrl = 'https://res.cloudinary.com/linema/image/upload/v1706023133/missionwrong_ftyr3n.jpg';
                    title = 'Misision';
                    text = 'Misision';

                    break;
                case 'ดูวิธีใช้':
                    url = 'https://whale-app-63n8p.ondigitalocean.app';
                    imageUrl = 'https://res.cloudinary.com/linema/image/upload/v1706023133/missionwrong_ftyr3n.jpg';
                    title = 'Misision';
                    text = 'Misision';

                    break;
                case 'ดูประวัติ':
                    url = 'https://whale-app-63n8p.ondigitalocean.app/history';
                    imageUrl = 'https://res.cloudinary.com/linema/image/upload/v1706023133/missionwrong_ftyr3n.jpg';
                    title = 'History';
                    text = 'History';

                    break;
                default:
                    url = 'https://whale-app-63n8p.ondigitalocean.app';
                    imageUrl = 'https://res.cloudinary.com/linema/image/upload/v1706023133/missionwrong_ftyr3n.jpg';
                    title = 'Mission';
                    text = 'Mission';

            }
            const replyToken = event.replyToken;
            await sendImageWithUrl(replyToken, imageUrl, title, text, url, user.UserID);
        } else {
            logToFile(`Unhandled event type: ${event.type}`);
        }
    }

    res.status(200).end();
};