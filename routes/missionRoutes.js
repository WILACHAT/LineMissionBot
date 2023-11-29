const express = require('express');
const db = require('../db'); // Adjust the path according to your project structure
const router = express.Router();

router.post('/', async (req, res) => {
  console.log('Received data:', req.body); // Debugging line

  const { input1 } = req.body;

  try {
      console.log(`Inserting into the database: ${input1}`); // Debugging line
      const result = await db.query(
          'INSERT INTO "LineSchemas"."DummyTable" ("Name") VALUES ($1) RETURNING *', 
          [input1]
      );
      console.log('Insertion result:', result.rows[0]); // Debugging line
      res.json(result.rows[0]);
  } catch (error) {
      console.error('Error during database operation:', error); // More descriptive error
      res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
