require('dotenv').config();
const express = require('express');
const session = require('express-session'); // Include express-session
const webhookRouter = require('./routes/webhook');
const lineBotService = require('./services/lineBotService');
const path = require('path');
const db = require('./db');
const missionRoutes = require('./routes/missionRoutes');
const progressRoutes = require('./routes/progressRoutes');
const completedRoutes = require('./routes/completedRoutes');
const historyRoutes = require('./routes/historyRoutes');




const { verifyToken } = require('./utils/tokenUtils'); // Make sure you have this function

const { scheduleTask } = require('./scheduledTask');

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

scheduleTask();

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

app.use('/completed', completedRoutes);
app.use('/history', historyRoutes);


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
     console.log("we win", req.session)
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/progress', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/progress.html'));
});
app.get('/completed', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'completed.html'));
});

app.get('/history', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'history.html'));
});

console.log("server console.log")
app.get('/session-data', (req, res) => {
  console.log("this is in app.get? fak off", req)

  console.log("this is in app.get? fak off", req.session)
  console.log("this is in app.get? fak off", req.session.userId)


  if (req.session.userId) {
    console.log("this is in app.get?")
      res.json({ userId: req.session.userId });
  } else {
      res.status(404).send('Session not found');
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

setupRichMenu('menu final.JPG');

const PORT = process.env.PORT || 4040;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
