// reflectionRoutes.js
const express = require('express');
const db = require('../db'); // Adjust the path according to your project structure
const router = express.Router();

router.get('/getCompletedMissions', async (req, res) => {
    try {
        
        const userId = req.query.userId;
        console.log("user id in routes comple", userId)
        // Implement logic to fetch completed missions for the user
        const missions = await db.getCompletedMissionsForUser(userId);
        console.log("user id in missions", missions)

        res.json({ missions });
    } catch (error) {
        console.error('Error fetching completed missions:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/submitReflection', async (req, res) => {
    try {
        const { userId, reflection } = req.body;
        // Implement logic to handle reflection submission
        await db.saveUserReflection(userId, reflection);
        res.status(200).send('Reflection submitted successfully');
    } catch (error) {
        console.error('Error submitting reflection:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
