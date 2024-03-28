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
                    url = 'https://waan.ngrok.app/progress';
                    imageUrl = 'https://res.cloudinary.com/linema/image/upload/v1711548874/meerkat_prog_reply_pyur2e.jpg';
                    title = 'ดูความคืบหน้า';
                    text = 'มาดูความคืบหน้ากันคับลูกพี่';

                    break;
                case 'สร้างเซสชันภารกิจ':
                    url = 'https://waan.ngrok.app';
                    imageUrl = 'https://res.cloudinary.com/linema/image/upload/v1711548878/meerkat_createMis_reply_gyjwlx.jpg';
                    text = 'มาสร้างเป้าหมายกันคับลูกพี่';
                    title = 'สร้างเซสชันภารกิจ';

                    break;
                case 'ดูวิธีใช้':
                    url = 'https://waan.ngrok.app';
                    imageUrl = 'https://res.cloudinary.com/linema/image/upload/v1711548885/meerkat_instruct_reply_yghjen.jpg';
                    text = 'มาดูธีใช้กันคับลูกพี่';
                    title = 'ดูวิธีใช้';


                    break;
                case 'ดูประวัติ':
                    url = 'https://waan.ngrok.app/history';
                    imageUrl = 'https://res.cloudinary.com/linema/image/upload/v1711548881/meerkat_history_reply_l8ys8z.jpg';
                    text = 'มาดูประวัติกันคับลูกพี่';
                    title = 'ดูประวัติ';


                    break;
                default:
                    url = 'https://waan.ngrok.app';
                    imageUrl = 'https://res.cloudinary.com/linema/image/upload/v1706023133/missionwrong_ftyr3n.jpg';
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