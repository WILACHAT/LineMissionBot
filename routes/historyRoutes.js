// historyRoutes.js
const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/getSessionHistory', async (req, res) => {
    const userId = req.session.userId; // Assuming you're storing userId in session
    try {
        const sessions = await db.getCompletedSessionsForUser(4);
        console.log("sessions ork ma", sessions)
        res.json({ sessions });
    } catch (error) {
        console.error('Error fetching session history:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/getSessionMissions', async (req, res) => {
    const sessionId = req.query.sessionId;
    try {
        const missions = await db.getMissionsBySessionId(sessionId);
        res.json({ missions });
    } catch (error) {
        console.error('Error fetching missions for session:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
