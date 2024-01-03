// routes/missionRoutes.js
const express = require('express');
const db = require('../db'); // Adjust the path according to your project structure
const router = express.Router();
router.post('/', async (req, res) => {
    console.log('Received data:', req.body); // Debugging line
  
    // Access userId from the session
    const userId = 4;
    console.log('UserID from session:', userId);
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
  

module.exports = router;
