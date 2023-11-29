require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'LineBotDB', 
  password: process.env.DB_PASSWORD, 
  port: 5432,
});

async function checkUserExists(lineId) {
  const query = 'SELECT * FROM "LineSchemas"."Users" WHERE "LineID" = $1';
  
  const result = await pool.query(query, [lineId]);
  return result.rows.length > 0;
}

async function saveNewUser(lineId) {
  const query = 'INSERT INTO "LineSchemas"."Users" ("LineID", "CreatedAt") VALUES ($1, NOW()) RETURNING *';
  const result = await pool.query(query, [lineId]);
  return result.rows[0];
}


module.exports = {
  pool, 
  checkUserExists,
  saveNewUser,
};
