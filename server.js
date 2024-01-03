require('dotenv').config();
const express = require('express');
const session = require('express-session'); // Include express-session
const webhookRouter = require('./routes/webhook');
const lineBotService = require('./services/lineBotService');
const path = require('path');
const db = require('./db');
const missionRoutes = require('./routes/missionRoutes');
const progressRoutes = require('./routes/progressRoutes');

const { verifyToken } = require('./utils/tokenUtils'); // Make sure you have this function

const { scheduleTasks } = require('./scheduledTasks');
const app = express();

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET, // Make sure SESSION_SECRET is set in your .env file
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } // Set to false if not using https
}));

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

scheduleTasks();

// Logging middleware
app.use((req, res, next) => {
  console.log("Incoming request headers:", req.headers);
  next();
});

// Uncomment and use this middleware if you want to restrict access to LINE requests only
/*
function checkIfRequestFromLine(req, res, next) {
    const userAgent = req.headers['user-agent'];
    if (userAgent && userAgent.includes('Line')) {
        next();
    } else {
        res.sendFile(path.join(__dirname, 'public/cannotaccess.html'));
    }
}
app.use(checkIfRequestFromLine);
*/

app.use('/', missionRoutes);
app.use('/progress', progressRoutes);

app.use('/webhook', webhookRouter);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/progress', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/progress.html'));
});
app.get('/resolveToken', async (req, res) => {
  const token = req.query.token;

  const userId = verifyToken(token);
  if (userId) {
      // Here, you can perform additional logic based on the userId if needed
      res.json({ url: 'https://waan.ngrok.app' });
  } else {
      res.status(400).json({ error: 'Invalid token' });
  }
});
app.post('/', async (req, res) => {
  try {
    const { userId, missiontitle1, missiontitle2, missiontitle3, missiontitle4, missiontitle5, missiondes1, missiondes2, missiondes3, missiondes4, missiondes5, startDate, missionEndDate } = req.body;

    
    // Now, call a function to save this data to the database. 
    // For example, you might have a function in db.js called 'saveFormData'
    const savedData = await db.saveFormData(userId, missiontitle1, missiontitle2, missiontitle3, missiontitle4, missiontitle5, missiondes1, missiondes2, missiondes3, missiondes4, missiondes5, startDate, missionEndDate);
    console.log(`in saved data`);

    res.json({ message: 'Data saved successfully', savedData });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



async function setupRichMenu(imagePath) {
  const richMenuId = await lineBotService.createRichMenu();
  if (richMenuId) {
      await lineBotService.uploadRichMenuImage(richMenuId, imagePath);
      await lineBotService.setDefaultRichMenu(richMenuId);
  }
}

setupRichMenu('/Users/wilachat16/linebot/line waan-min.jpg');

const PORT = process.env.PORT || 4040;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
