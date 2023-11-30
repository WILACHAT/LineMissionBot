require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'LineBotDB', 
  password: process.env.DB_PASSWORD, 
  port: 5432,
});

async function getUserByLineId(lineId) {
  const query = 'SELECT * FROM "LineSchemas"."Users" WHERE "LineID" = $1';
  const result = await pool.query(query, [lineId]);

  if (result.rows.length > 0) {
    return result.rows[0]; // Return the first row (user data)
  } else {
    return null; // Return null if user does not exist
  }
}

async function saveNewUser(lineId) {
  const query = 'INSERT INTO "LineSchemas"."Users" ("LineID", "CreatedAt") VALUES ($1, NOW()) RETURNING *';
  const result = await pool.query(query, [lineId]);
  return result.rows[0];
}

async function saveTokenForUser(lineId, token) {
  const query = 'INSERT INTO "LineSchemas"."UserTokens" ("Token", "LineID", "ExpiresAt") VALUES ($1, $2, NOW() + INTERVAL \'1 hour\') RETURNING *';
  const result = await pool.query(query, [token, lineId]);
  return result.rows[0];
}


module.exports = {
  pool, 
  getUserByLineId,
  saveNewUser,
  saveTokenForUser,
};
