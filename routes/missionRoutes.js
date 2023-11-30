// routes/missionRoutes.js
const express = require('express');
const db = require('../db'); // Adjust the path according to your project structure
const router = express.Router();
router.post('/', async (req, res) => {
    console.log('Received data:', req.body); // Debugging line
  
    // Access userId from the session
    const userId = req.session.userId;
    console.log('UserID from session:', userId);
  
    // ... your existing code to handle the mission data ...
  });
  

module.exports = router;
