// routes/missionRoutes.js
const express = require('express');
const db = require('../db'); // Adjust the path according to your project structure
const router = express.Router();
router.post('/submit', async (req, res) => {
    console.log('Received data:', req.body); // Debugging line
  
    // Access userId from the session
   
        try {
      const savedData = await db.saveFormData(
          req.body.userId,
          req.body.missiontitle1, req.body.missiontitle2, 
          req.body.missiontitle3, req.body.missiontitle4, 
          req.body.missiontitle5, req.body.missiondes1, 
          req.body.missiondes2,  req.body.missiondes3,
          req.body.missiondes4, req.body.missiondes5,
          req.body.startDate, req.body.missionEndDate
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
    const userId =  req.query.userId // Obtain userId from query parameter

    try {
        const latestSession = await db.getLatestSessionByUserId(userId);
        if (latestSession && !latestSession.Complete) {
            // Delete the session here
            await db.deleteSessionById(latestSession.SessionID);
            res.json({ message: 'Session deleted successfully' });
        } else {
            res.status(404).json({ message: 'No active session to delete' });
        }
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
  

module.exports = router;
