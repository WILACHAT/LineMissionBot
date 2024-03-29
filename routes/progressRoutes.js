// progressRoutes.js - Part of your Node.js server
const express = require('express');
const db = require('../db'); // Adjust the path to where your db.js is located
const router = express.Router();

router.get('/getLatestIncompleteSession', async (req, res) => {
  const userId = req.query.userId;
  
  try {
      let incompleteSessions = await db.getLatestIncompleteSessionByUserId(userId);

      if (incompleteSessions && incompleteSessions.length > 0) {
          let sessionsData = [];
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

          /*
          for (let session of incompleteSessions) {
              const missionsResult = await db.pool.query(
                  'SELECT * FROM "LineSchemas"."Missions" WHERE "SessionID" = $1 ORDER BY "Misson_ID" ASC',
                  [session.SessionID]
              );

              let missionsData = [];
              
       
              for (let mission of missionsResult.rows) {
                  if (mission.Title === 'ออกกำลังกาย') { // "Exercise"
                      const gymMissionResult = await db.pool.query(
                          'SELECT * FROM "LineSchemas"."GymMission" WHERE "Misson_ID" = $1',
                          [mission.Misson_ID]
                      ); 
                      mission.gymDetails = gymMissionResult.rows[0];
                  }
            
                  missionsData.push(mission);
              }
              

              sessionsData.push({
                  session: session,
                  missions: missionsData,
                  endDate: session.EndDate
              });
          }

          */
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

  router.post('/updateFrequency', async (req, res) => {
    console.log("heree1")
    console.log("reqBODY", req.body)

    const missionId = req.body.Misson_ID;

    console.log("yoyoyo", req.body)
    console.log("heree2")
  
    try {
      await db.updateFrequency(missionId);
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