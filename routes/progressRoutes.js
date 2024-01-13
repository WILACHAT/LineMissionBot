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
    let latestSession = await db.getLatestIncompleteSessionByUserId(userId);
    if (latestSession) {
        console.log("fuck off", latestSession.EndDate)
      const sessionId = latestSession.SessionID;
      const missionsResult = await db.pool.query(
        'SELECT * FROM "LineSchemas"."Missions" WHERE "SessionID" = $1 ORDER BY "Misson_ID" ASC',
        [sessionId]
      );
      res.json({ session: latestSession, missions: missionsResult.rows, endDate: latestSession.EndDate });
    } else { 
      res.status(404).json({ message: 'No incomplete session found for the user.' });
    }
  } catch (error) {
    console.error('Error in getting latest incomplete session:', error);
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
  

module.exports = router;
