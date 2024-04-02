const axios = require('axios');
const fs = require('fs');
const line = require('@line/bot-sdk');


const { channelAccessToken } = require('../config');

const lineConfig = {
  channelAccessToken: channelAccessToken // Set in your .env file
};

const client = new line.Client(lineConfig);
async function sendLineNotification(lineUserId, messageText, UserID, sessionID) {
  const baseUrl = "https://whale-app-63n8p.ondigitalocean.app/completed";
  const linkUrl = `${baseUrl}?userId=${encodeURIComponent(sessionID)}`;
  

    const imageUrl = 'https://res.cloudinary.com/linema/image/upload/v1712008608/meerkat_completed_gtr6c8.jpg';
    const title = 'เซสชั่นเสร็จสิ้น';
  
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}` // Ensure channelAccessToken is defined
    };
  
    // Create an array of message objects with the carousel first
    const messages = [
      {
        type: 'text',
        text: messageText // The full message text, ensure it's within the character limit
      },
      {
          type: 'template',
          altText: 'มาดูเซสชั่นเสร็จสิ้นกันคับลูกพี่',
          template: {
            type: 'buttons',
            thumbnailImageUrl: imageUrl,
            imageAspectRatio: 'square',
            imageSize: 'cover',
            imageBackgroundColor: "#FFFFFF",
            title: title,
            text: title, // The full message text, ensure it's within the character limit
            actions: [
              {
                type: 'uri',
                label: 'มาดูเซสชั่นเสร็จสิ้นกันคับลูกพี่',
                uri: linkUrl
              }
              // You can add more actions/buttons here if needed
            ]
          }
     
      }
      
    ];
  
    const body = {
      to: lineUserId,
      messages: messages,
    };
  
    try {
      const response = await axios.post('https://api.line.me/v2/bot/message/push', body, { headers });
      console.log('Compound message with carousel on top sent to LINE user:', response.data);
    } catch (error) {
      console.error('Failed to send compound message with carousel on top:', error.response ? error.response.data : error.message);
    }
  }

async function sendLineNotificationAlert(lineUserId, messageText, UserID) {
  const baseUrl = "https://waan.ngrok.app/progress";
  const linkUrl = `${baseUrl}?userId=${encodeURIComponent(UserID)}`;
  
  const messages = [
      {
          type: 'text',
          text: messageText
      },
      {
          type: 'text',
          text: `${linkUrl}`
      }
  ]
    console.log("lineUserId print", lineUserId, messages)
    try {
        await client.pushMessage(lineUserId, messages);
        console.log('Notification sent to LINE user:', lineUserId);
    } catch (error) {
        console.error('Failed to send LINE notification:', error);
    }
  }

  async function sendLineNotificationStreak(lineUserId, messageText, UserID) {
    const baseUrl = "https://waan.ngrok.app";
    const linkUrl = `${baseUrl}?userId=${encodeURIComponent(UserID)}`;
    const imageUrl = 'https://res.cloudinary.com/linema/image/upload/v1711548878/meerkat_createMis_reply_gyjwlx.jpg';
    const title = 'สร้างเป้าหมาย';
  
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}` // Ensure channelAccessToken is defined
    };
  
    // Create an array of message objects with the carousel first
    const messages = [
      {
        type: 'text',
        text: messageText // The full message text, ensure it's within the character limit
      },
      {
          type: 'template',
          altText: 'มาสร้างเป้าหมายกันครับลูกพี่',
          template: {
            type: 'buttons',
            thumbnailImageUrl: imageUrl,
            imageAspectRatio: 'square',
            imageSize: 'cover',
            imageBackgroundColor: "#FFFFFF",
            title: title,
            text: title, // The full message text, ensure it's within the character limit
            actions: [
              {
                type: 'uri',
                label: 'มาสร้างเป้าหมายกันครับลูกพี่',
                uri: linkUrl
              }
              // You can add more actions/buttons here if needed
            ]
          }
     
      }
      
    ];
  
    const body = {
      to: lineUserId,
      messages: messages,
    };
  
    try {
      const response = await axios.post('https://api.line.me/v2/bot/message/push', body, { headers });
      console.log('Compound message with carousel on top sent to LINE user:', response.data);
    } catch (error) {
      console.error('Failed to send compound message with carousel on top:', error.response ? error.response.data : error.message);
    }

  }

  async function sendLineNotificationMission(lineUserId, messageText, UserID) {
    const baseUrl = "https://waan.ngrok.app/progress";
    const linkUrl = `${baseUrl}?userId=${encodeURIComponent(UserID)}`;
    const imageUrl = 'https://res.cloudinary.com/linema/image/upload/v1711548874/meerkat_prog_reply_pyur2e.jpg';
    const title = 'ดูความคืบหน้า';
  
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}` // Ensure channelAccessToken is defined
    };
  
    // Create an array of message objects with the carousel first
    const messages = [
      {
        type: 'text',
        text: messageText // The full message text, ensure it's within the character limit
      },
      {
          type: 'template',
          altText: 'มาดูความคืบหน้ากันคับลูกพี่',
          template: {
            type: 'buttons',
            thumbnailImageUrl: imageUrl,
            imageAspectRatio: 'square',
            imageSize: 'cover',
            imageBackgroundColor: "#FFFFFF",
            title: title,
            text: title, // The full message text, ensure it's within the character limit
            actions: [
              {
                type: 'uri',
                label: 'มาดูความคืบหน้ากันคับลูกพี่',
                uri: linkUrl
              }
              // You can add more actions/buttons here if needed
            ]
          }
     
      }
      
    ];
  
    const body = {
      to: lineUserId,
      messages: messages,
    };
  
    try {
      const response = await axios.post('https://api.line.me/v2/bot/message/push', body, { headers });
      console.log('Compound message with carousel on top sent to LINE user:', response.data);
    } catch (error) {
      console.error('Failed to send compound message with carousel on top:', error.response ? error.response.data : error.message);
    }
  }
  
  
  
  
  
  

async function replyToUser(replyToken, url, userId) {
  const customizedUrl = `${url}?userId=${encodeURIComponent(userId)}`;
  console.log("i am here", customizedUrl)

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
                text: customizedUrl
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
            "width": 2500,
            "height": 843
          },
          "action": {
            "type": "message",
            "text": "ดูความคืบหน้า"
          }
        },
        {
          "bounds": {
            "x": 0,
            "y": 843,
            "width": 833,
            "height": 843
          },
          "action": {
            "type": "message",
            "text": "สร้างเซสชันภารกิจ"
          }
        },
        {
          "bounds": {
            "x": 833,
            "y": 843,
            "width": 834,
            "height": 843
          },
          "action": {
            "type": "message",
            "text": "ดูวิธีใช้"
          }
        },
        {
          "bounds": {
            "x": 1667,
            "y": 843,
            "width": 833,
            "height": 843
          },
          "action": {
            "type": "message",
            "text": "ดูประวัติ" // Assuming you have a fourth button
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


async function sendImageWithUrl(replyToken, imageUrl, title, text, baseUrl, userId) {
  const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}`
  };
  const fullUrl = `${baseUrl}?userId=${encodeURIComponent(userId)}`;


  const body = {
    replyToken: replyToken,
    messages: [
        {
            type: 'template',
            altText: title,
            template: {
                type: 'buttons',
                thumbnailImageUrl: imageUrl, // Optional: URL of the image displayed in the button template
                imageAspectRatio: 'square', // Optional: Aspect ratio of the image. Default is 'rectangle'
                imageSize: 'cover', // Optional: Size of the image. Default is 'cover'
                imageBackgroundColor: "#FFFFFF", // Optional: Background color of image
                text: text, // Required: Text shown in the button template
                actions: [
                    {
                        type: 'uri',
                        label: title, // Label for the button
                        uri: fullUrl // The URL to be opened
                    }
                ]
            }
        }
    ]
};


  try {
      const response = await axios.post('https://api.line.me/v2/bot/message/reply', body, { headers });
      console.log('Image with URL sent:', response.data);
  } catch (error) {
      console.error('Error sending image with URL:', error.response ? error.response.data : error.message);
  }
}
module.exports = {
  replyToUser,
  createRichMenu,
  uploadRichMenuImage,
  setDefaultRichMenu,
  sendLineNotification,
  sendLineNotificationAlert,
  sendLineNotificationMission,
  sendImageWithUrl,
  sendLineNotificationStreak

};