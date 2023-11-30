const axios = require('axios');
const fs = require('fs');

const { channelAccessToken } = require('../config');

async function replyToUser(replyToken) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`
    };

    const body = {
        replyToken: replyToken,
        messages: [
            {
                type: 'text',
                text: 'สวัสดีครับลูกพี่'
            },
            {
                type: 'text',
                text: 'May I help you?'
            }
        ]
    };

    try {
        const response = await axios.post('https://api.line.me/v2/bot/message/reply', body, { headers });
        console.log('Message sent:', response.data);
    } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
    }
}

async function createRichMenu() {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`
    };

    const richMenuData = {
        "size": {
          "width": 2500,
          "height": 1686
        },
        "selected": false,
        "name": "Example Rich Menu",
        "chatBarText": "Open this",
        "areas": [
          {
            "bounds": {
              "x": 0,
              "y": 0,
              "width": 833,
              "height": 1686
            },
            "action": {
              "type": "uri",
              "uri": "https://waan.ngrok.app/progress.html"
            }
          },
          {
            "bounds": {
              "x": 833,
              "y": 0,
              "width": 834,
              "height": 1686
            },
            "action": {
              "type": "message",
              "text": "https://waan.ngrok.app"
            }
          },
          {
            "bounds": {
              "x": 1667,
              "y": 0,
              "width": 833,
              "height": 1686
            },
            "action": {
              "type": "postback",
              "data": "action=redirect"
          }
          }
        ]
      };
      

    try {
        const response = await axios.post('https://api.line.me/v2/bot/richmenu', richMenuData, { headers });
        console.log('Rich menu created:', response.data);

        return response.data.richMenuId; 
    } catch (error) {
        console.error('Error creating rich menu:', error.response ? error.response.data : error.message);
    }
}

async function uploadRichMenuImage(richMenuId, imagePath) {
    console.log('Check Rich Menu:', richMenuId);

    const headers = {
        'Authorization': `Bearer ${channelAccessToken}`,
        'Content-Type': 'image/jpeg' // or 'image/png' based on your image
    };

    try {
        const imageData = fs.readFileSync(imagePath);
        await axios.post(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, imageData, { headers });
        console.log('Rich menu image uploaded successfully');
    } catch (error) {
        console.error('Error uploading rich menu image:', error.response ? error.response.data : error.message);
    }
}

async function setDefaultRichMenu(richMenuId) {
    const headers = {
        'Authorization': `Bearer ${channelAccessToken}`
    };

    try {
        await axios.post(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {}, { headers });
        console.log('Rich menu set as default successfully');
    } catch (error) {
        console.error('Error setting rich menu as default:', error.response ? error.response.data : error.message);
    }
}
module.exports = {
  replyToUser,
  createRichMenu,
  uploadRichMenuImage,
  setDefaultRichMenu 
};
