// routes/missionRoutes.js
const express = require('express');
const db = require('../db'); // Adjust the path according to your project structure
const router = express.Router();


router.post('/submit', async (req, res) => {
    console.log('Received data:', req.body); // Debugging line

    try {
        console.log("YOUR PROBLEM", req.body.userId)
        // First, get the lastPosted and CurrentStreak value for the user
        const userId = req.body.userId;
        // First, get the lastPosted and CurrentStreak value for the user
        const userResult = await db.pool.query('SELECT "LastPosted", "CurrentStreak" FROM "LineSchemas"."Users" WHERE "UserID" = $1', [userId]);
        const user = userResult.rows[0]; // Assuming the query returns at least one row

        let updateStreakNeeded = false;
        let resetStreak = false;
        if (!user || user.LastPosted === null) {
            // If user does not exist or LastPosted is null, treat as a new streak start
            updateStreakNeeded = true;
        } else {
            const lastPostedDate = new Date(user.LastPosted);
            const now = new Date();
            const submissionDate = new Date(req.body.startDate);

            // Compare dates by converting them to the start of their respective days in UTC
            const lastPostedDayStart = Date.UTC(lastPostedDate.getUTCFullYear(), lastPostedDate.getUTCMonth(), lastPostedDate.getUTCDate());
            const nowDayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
            const submissionDayStart = Date.UTC(submissionDate.getUTCFullYear(), submissionDate.getUTCMonth(), submissionDate.getUTCDate());

            // Check if submission is for today and if last post was not yesterday
            if (lastPostedDayStart < submissionDayStart && submissionDayStart === nowDayStart) {
                updateStreakNeeded = true;
                // Additionally, check if the last post was more than one day before today, indicating a break in the streak
                if ((submissionDayStart - lastPostedDayStart) > 86400000) { // More than 24 hours difference in milliseconds
                    resetStreak = true;
                }
            }
        }
        if (resetStreak) {
            // Reset CurrentStreak to 1
            await db.resetCurrentStreak(userId); // Ensure this function sets CurrentStreak to 1
        } else if (updateStreakNeeded) {
            // Increment the current streak
            await db.updateCurrentStreak(userId);
        }


        if (updateStreakNeeded) {
            await db.updateCurrentStreak(req.body.userId); // Increment the current streak

            // After incrementing, fetch current streak and compare with StreakSeshPost
            const currentStreakResult = await db.pool.query('SELECT "CurrentStreak" FROM "LineSchemas"."Users" WHERE "UserID" = $1', [req.body.userId]);
            const currentStreak = currentStreakResult.rows[0].CurrentStreak;

            const streakSeshPostResult = await db.pool.query('SELECT "StreakSeshPost" FROM "LineSchemas"."Users" WHERE "UserID" = $1', [req.body.userId]);
            const streakSeshPost = streakSeshPostResult.rows[0].StreakSeshPost;

            if (currentStreak > streakSeshPost) {
                await db.updateHighestStreak(req.body.userId); // Update StreakSeshPost if current streak is higher
            }
        }

        // Update lastPosted to the start date of the submission
        await db.lastPosted(req.body.startDate, req.body.userId);

        // Proceed to save the form data
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