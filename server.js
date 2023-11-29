require('dotenv').config();
const express = require('express');
const webhookRouter = require('./routes/webhook');
const lineBotService = require('./services/lineBotService'); 
const path = require('path'); 
const line = require('@line/bot-sdk'); 
const db = require('./db');

const app = express();

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Logging middleware to inspect request headers
app.use((req, res, next) => {
  console.log("Incoming request headers:", req.headers);
  next(); // Pass the request to the next middleware
});

// Middleware to check if the request is from LINE

function checkIfRequestFromLine(req, res, next) {
    const userAgent = req.headers['user-agent'];

    // Check if the user agent contains 'Line'
    if (userAgent && userAgent.includes('Line')) {
        next();
    } else {
        res.sendFile(path.join(__dirname, 'public/cannotaccess.html'));
    }
}

app.use(checkIfRequestFromLine);

// Now place the express.static middleware after the user agent check
app.use(express.static(path.join(__dirname, 'public')));

// Define all your routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/progress', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/progress.html'));
});

const missionRoutes = require('./routes/missionRoutes');

// Use the data routes for the root path
app.use('/', missionRoutes);


app.use('/webhook', webhookRouter);

async function setupRichMenu(imagePath) {
  const richMenuId = await lineBotService.createRichMenu();
  if (richMenuId) {
      await lineBotService.uploadRichMenuImage(richMenuId, imagePath);
      await lineBotService.setDefaultRichMenu(richMenuId);
  }
}

// Call this function with the path to your rich menu image
setupRichMenu('/Users/wilachat16/linebot/line waan-min.jpg');

const PORT = process.env.PORT || 4040;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});