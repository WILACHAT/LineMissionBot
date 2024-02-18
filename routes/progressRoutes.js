// progressRoutes.js - Part of your Node.js server
const express = require('express');
const db = require('../db'); // Adjust the path to where your db.js is located
const router = express.Router();

router.get('/getLatestIncompleteSession', async (req, res) => {
    console.log("pls not here")
    console.log("lol", req)
    const userId = req.query.userId;
    console.log("yee", userId)
    try {
      // Fetch all incomplete sessions for the user
      let incompleteSessions = await db.getAllIncompleteSessionsByUserId(userId); // Adjust the DB query method accordingly
      console.log("Found incomplete sessions", incompleteSessions);
    
      // Check if there are any incomplete sessions
      if (incompleteSessions && incompleteSessions.length > 0) {
        // Initialize an array to hold the session data along with their missions
        let sessionsData = [];
    
        // Iterate over each session to fetch its missions
        for (let session of incompleteSessions) {
          console.log("Processing session", session.SessionID);
    
          // Fetch missions for the current session
          const missionsResult = await db.pool.query(
            'SELECT * FROM "LineSchemas"."Missions" WHERE "SessionID" = $1 ORDER BY "Misson_ID" ASC',
            [session.SessionID]
          );
    
          // Add the session data and its missions to the array
          sessionsData.push({
            session: session,
            missions: missionsResult.rows,
            endDate: session.EndDate
          });
        }
    
        // Respond with the sessions data
        res.json(sessionsData);
      } else {
        res.status(404).json({ message: 'No incomplete sessions found for the user.' });
      }
    } catch (error) {
      console.error('Error in getting incomplete sessions:', error);
      res.status(500).send('Internal Server Error');
    }
    
});
router.post('/updateMissionStats', async (req, res) => {
    console.log("heree1")

    const { missionId, completed } = req.body;
    console.log("yoyoyo", req.body)
    console.log("heree2")
  
    try {
      await db.updateMissionStatus(missionId, completed);
      res.status(200).json({ message: 'Mission status updated successfully' });
    } catch (error) {
      console.error('Error updating mission status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  // Server-side
router.post('/completeMissionSession', async (req, res) => {
  try {
    console.log("jj abrhams", req.body)
      // If you're sending userId in the body:
      const { userId } = req.body; // Correct way to receive userId for a POST request

      await db.completeMissionSessionByUserId(userId);
      res.status(200).json({ message: 'Session marked as completed successfully' });
  } catch (error) {
      console.error('Error completing session:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;