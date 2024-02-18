require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');



const pool = new Pool({
  user: 'doadmin',
  host: 'db-postgresql-sgp1-70402-do-user-8313236-0.c.db.ondigitalocean.com',
  database: 'defaultdb',
  password: process.env.DB_PASSWORD,
  port: 25060,
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync('ca-certificate.crt').toString(),
  }
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
async function getUserLineIdByUserId(userId) {
  const query = 'SELECT "LineID" FROM "LineSchemas"."Users" WHERE "UserID" = $1';
  const result = await pool.query(query, [userId]);

  if (result.rows.length > 0) {
    return result.rows[0].LineID; // Return the LineID of the user
  } else {
    return null; // Return null if the user does not exist
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
async function saveFormData(userId, missions, startDate, missionEndDate) {
  console.log("in saveFormData");

  // Calculate the NextReminder time (12 hours after startDate)
  let nextReminderTime = new Date(startDate);
  nextReminderTime.setHours(nextReminderTime.getHours() + 12);

  // Step 1: Insert into MissionSessions and get SessionID
  let sessionInsertQuery = 'INSERT INTO "LineSchemas"."MissionSessions"("StartDate", "EndDate", "UserID", "NextReminder") VALUES ($1, $2, $3, $4) RETURNING "SessionID"';
  let sessionResult = await pool.query(sessionInsertQuery, [startDate, missionEndDate, userId, nextReminderTime]);
  let sessionId = sessionResult.rows[0].SessionID;

  // Step 2: Insert missions into Missions table
  for (let mission of missions) {
      if (mission.title && mission.description) { // Insert only if title and description are provided
          let missionInsertQuery = 'INSERT INTO "LineSchemas"."Missions" ("Title", "Description", "SessionID") VALUES ($1, $2, $3)';
          await pool.query(missionInsertQuery, [mission.title, mission.description, sessionId]);
      }
  }
}

async function getLatestIncompleteSessionByUserId(userId) {
  const query = `
    SELECT "SessionID", "EndDate" , "Complete"
    FROM "LineSchemas"."MissionSessions" 
    WHERE "UserID" = $1 
    ORDER BY "SessionID" DESC 
    ;
  `;
  const result = await pool.query(query, [userId]);
  console.log("this is the result from getLatestIncomplete", result)

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
async function completeMissionSession(sessionId) {
  const query = 'UPDATE "LineSchemas"."MissionSessions" SET "Complete" = TRUE WHERE "SessionID" = $1';
  await pool.query(query, [sessionId]);
}

async function findExpiredMissions() {
  const query = `
      SELECT * FROM "LineSchemas"."MissionSessions"
      WHERE "EndDate" < NOW() AND "Notify" = false;
  `;
  const result = await pool.query(query);
  return result.rows; // Rows containing missions with expired end dates
}
async function markNotificationAsSent(missionId) {
  const query = 'UPDATE "LineSchemas"."MissionSessions" SET "Notify" = TRUE WHERE "SessionID" = $1';
  await pool.query(query, [missionId]);
}
async function getCompletedMissionsForUser(userId) {
  // First, find the latest completed session for the user
  const latestSessionQuery = `
    SELECT "SessionID"
    FROM "LineSchemas"."MissionSessions"
    WHERE "UserID" = $1 AND "Complete" = true
    ORDER BY "SessionID" DESC
    LIMIT 1;
  `;
  console.log("latestSessionQuery1", latestSessionQuery)
  const sessionResult = await pool.query(latestSessionQuery, [userId]);
  console.log("sessionResult", sessionResult)
  if (sessionResult.rows.length === 0) {
    // No completed sessions found
    return [];
  }
  const latestSessionId = sessionResult.rows[0].SessionID;
  console.log("latestSessionId", latestSessionId)


  // Now, find all missions for the latest completed session
  const missionsQuery = `
    SELECT * FROM "LineSchemas"."Missions"
    WHERE "SessionID" = $1;
  `;
  const missionsResult = await pool.query(missionsQuery, [latestSessionId]);
  return missionsResult.rows; // Rows containing the missions for the latest completed session
}

async function saveUserReflection(userId, reflection) {
  // First, find the latest completed session for the user
  const latestSessionQuery = `
    SELECT "SessionID"
    FROM "LineSchemas"."MissionSessions"
    WHERE "UserID" = $1 AND "Complete" = TRUE
    ORDER BY "SessionID" DESC
    LIMIT 1;
  `;
  const sessionResult = await pool.query(latestSessionQuery, [userId]);
  
  // If there's no completed session, we can't update anything
  if (sessionResult.rows.length === 0) {
    return;
  }

  const latestSessionId = sessionResult.rows[0].SessionID;

  // Now, update the reflection for the latest completed session
  const updateReflectionQuery = `
    UPDATE "LineSchemas"."MissionSessions"
    SET "Reflection" = $1
    WHERE "SessionID" = $2;
  `;
  await pool.query(updateReflectionQuery, [reflection, latestSessionId]);
}
  async function getCompletedSessionsForUser(userId) {
    console.log("checking for userId", userId)
    const query = `
        SELECT "SessionID", "StartDate", "EndDate", "Rating", "Complete", "Reflection"
        FROM "LineSchemas"."MissionSessions"
        WHERE "UserID" = $1 AND "Complete" = TRUE
        ORDER BY "SessionID" DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.map(session => ({
      ...session,
      StartDate: session.StartDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).substring(0, 10), // Format date as 'YYYY-MM-DD'
      EndDate: session.EndDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }).substring(0, 10), // Format date as 'YYYY-MM-DD'
    }));
  }
  async function getMissionsBySessionId(sessionId) {
    const query = 'SELECT * FROM "LineSchemas"."Missions" WHERE "SessionID" = $1';
    const result = await pool.query(query, [sessionId]);
    return result.rows;
}
async function getLatestSessionByUserId(userId) {
  const query = `
      SELECT "SessionID", "EndDate", "Complete"
      FROM "LineSchemas"."MissionSessions"
      WHERE "UserID" = $1
      ORDER BY "SessionID" DESC
      LIMIT 1;
  `;
  const result = await pool.query(query, [userId]);
  if (result.rows.length > 0) {
      return result.rows[0]; // Return the latest session
  } else {
      return null; // Return null if no session exists
  }
}
async function deleteSessionById(sessionId) {
  const deleteQuery = 'DELETE FROM "LineSchemas"."MissionSessions" WHERE "SessionID" = $1';
  await pool.query(deleteQuery, [sessionId]);
}

async function updateMissionSessionRating(sessionId, rating) {
  const query = 'UPDATE "LineSchemas"."MissionSessions" SET "Rating" = $1 WHERE "SessionID" = $2';
  await pool.query(query, [rating, sessionId]);
}
async function findMissionsNeedingReminder() {
  const query = `
      SELECT * FROM "LineSchemas"."MissionSessions"
      WHERE "NextReminder" <= NOW() AND "Complete" = false;
  `;
  const result = await pool.query(query);
  return result.rows;
}

async function updateNextReminderTime(sessionId) {
  const query = `
      UPDATE "LineSchemas"."MissionSessions"
      SET "NextReminder" = NOW() + INTERVAL '12 hours'
      WHERE "SessionID" = $1;
  `;
  await pool.query(query, [sessionId]);
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
  findExpiredMissions,
  getUserLineIdByUserId,
  markNotificationAsSent,
  getCompletedMissionsForUser,
  saveUserReflection,
  completeMissionSession,
  getCompletedSessionsForUser,
  getMissionsBySessionId,
  getLatestSessionByUserId,
  deleteSessionById,
  updateMissionSessionRating,
  findMissionsNeedingReminder,
  updateNextReminderTime


};