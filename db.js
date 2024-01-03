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
async function saveFormData(userId, missiontitle1, missiontitle2, missiontitle3, missiontitle4, missiontitle5, missiondes1, missiondes2, missiondes3, missiondes4, missiondes5, startDate, missionEndDate) {
  console.log("in saveFormData")
  

  // Step 1: Insert into MissionSessions and get SessionID
  let sessionInsertQuery = 'INSERT INTO "LineSchemas"."MissionSessions"("StartDate", "EndDate", "UserID") VALUES ($1, $2, $3) RETURNING "SessionID"';
  let sessionResult = await pool.query(sessionInsertQuery, [startDate, missionEndDate, userId]);
  let sessionId = sessionResult.rows[0].SessionID;

  // Step 2: Insert missions into Missions table
  let missions = [
      { title: missiontitle1, description: missiondes1 },
      { title: missiontitle2, description: missiondes2 },
      { title: missiontitle3, description: missiondes3 },
      { title: missiontitle4, description: missiondes4 },
      { title: missiontitle5, description: missiondes5 }
  ];

  for (let mission of missions) {
      if (mission.title && mission.description) { // Insert only if title and description are provided
          let missionInsertQuery = 'INSERT INTO "LineSchemas"."Missions" ("Title", "Description", "SessionID") VALUES ($1, $2, $3)';
          await pool.query(missionInsertQuery, [mission.title, mission.description, sessionId]);
      }
  }
}
async function getLatestIncompleteSessionByUserId(userId) {
  const query = `
    SELECT "SessionID", "EndDate" 
    FROM "LineSchemas"."MissionSessions" 
    WHERE "UserID" = $1 AND "Complete" = FALSE 
    ORDER BY "SessionID" DESC 
    LIMIT 1;
  `;
  const result = await pool.query(query, [userId]);

  if (result.rows.length > 0) {
    return result.rows[0]; // Return the latest incomplete session
  } else {
    return null; // Return null if no incomplete session exists
  }
}
async function updateMissionStatus(missionId, completed) {
  console.log("missionid", missionId)
  console.log("completed", completed)
  const query = 'UPDATE "LineSchemas"."Missions" SET "Complete" = $1 WHERE "Misson_ID" = $2';
  await pool.query(query, [completed, missionId]);
}

async function findExpiredMissions() {
  const query = `
      SELECT * FROM "LineSchemas"."MissionSessions"
      WHERE "EndDate" < NOW() AND "Notify" = FALSE;
  `;
  const result = await pool.query(query);
  return result.rows; // Rows containing missions with expired end dates
}

// Add a function to send notifications and update the 'NotificationSent' status
module.exports = {
  pool, 
  getUserByLineId,
  saveNewUser,
  saveTokenForUser,
  saveFormData,
  getLatestIncompleteSessionByUserId,
  updateMissionStatus,
  findExpiredMissions
};
