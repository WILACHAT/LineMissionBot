// routes/missionRoutes.js
const express = require('express');
const db = require('../db'); // Adjust the path according to your project structure
const router = express.Router();
router.post('/submit', async (req, res) => {
    console.log('Received data:', req.body); // Debugging line

    console.log("missionRoutes start", req.body.startDate)
    console.log("missionRoutes end", req.body.missionEndDate)

    
    try {
      const savedData = await db.saveFormData(
          req.body.userId,
          req.body.missions, 

          req.body.startDate, req.body.missionEndDate,
          req.body.sessionName
      );

      console.log(`Data saved successfully`);
      res.json({ message: 'Data saved successfully', savedData });

  } catch (error) {
      console.error('Error saving form data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
  
  });
  
  router.get('/checkLatestSession', async (req, res) => {
    const userId = req.query.userId // Obtain userId from query parameter

    try {
        const latestSession = await db.getLatestSessionByUserId(userId);
        res.json(latestSession);
    } catch (error) {
        console.error('Error checking latest session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/deleteCurrentSession', async (req, res) => {
    const sessionId =  req.query.sessionId // Obtain userId from query parameter

    try {
       
        await db.deleteSessionById(sessionId);
        res.json({ message: 'Session deleted successfully' });
     
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
  

module.exports = router;