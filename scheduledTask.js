
const cron = require('node-cron');
const db = require('./db');
const { sendLineNotification } = require('./services/lineBotService');
const { sendLineNotificationAlert } = require('./services/lineBotService');
const { sendLineNotificationMission } = require('./services/lineBotService');




function scheduleTask() {
    cron.schedule('*/1 * * * *', async () => {
        console.log('Checking for expired missions at:', new Date().toLocaleString());
        const expiredMissions = await db.findExpiredMissions();
        console.log("expiredMissions", expiredMissions)

        if (expiredMissions.length > 0) {
            console.log("inside first if")

            for (let mission of expiredMissions) {
                console.log("SESSION ID QUERY", mission.SessionID)
                await db.completeMissionSession(mission.SessionID);
                const what = await db.getCompletedMissionsForUser(mission.SessionID)

                console.log("this is the what", what)
                console.log("this is the what", what.length)

                const completedMissionRatio = Math.round((what.reduce((count, mission) => mission.Complete ? count + 1 : count, 0) / what.length) * 100);

                console.log("completedmissions", completedMissionRatio)
                await db.updateMissionSessionRating(mission.SessionID, completedMissionRatio);


                const user = await db.getUserLineIdByUserId(mission.UserID);
                console.log("user user user", user)

                if (user) {
                    console.log("inside useer if")
                    

                    const messageText = `สวัสดีครับลูกพี่ เซสชั่นของลูกพี่ได้หมดอายุแล้ว! คลิกที่ลิงค์ด้านล่างเพื่อดูผลงานของลูกพี่เลย;`;
                    console.log("user id is correct?", user)
                    await sendLineNotification(user, messageText, mission.UserID, mission.SessionID);
                    await db.markNotificationAsSent(mission.SessionID); 
                }
            }
        } else {
            console.log('No expired missions found at this time.');
        }
    });
    cron.schedule('0 * * * *', async () => { 
        console.log('Checking for missions needing reminders:', new Date().toLocaleString());
    
        const missionsForReminder = await db.findMissionsNeedingReminder();
    
        for (const session of missionsForReminder) {
            const user = await db.getUserLineIdByUserId(session.UserID);
            if (user) {
                // Query to get all missions for the current session
                const missionsResult = await db.pool.query(
                    'SELECT * FROM "LineSchemas"."Missions" WHERE "SessionID" = $1 ORDER BY "Misson_ID" ASC',
                    [session.SessionID]
                );
    
                // Building the missions list string
                const descriptions = missionsResult.rows.map(mission => {
                    // Check if Due_Date is not null, then format it, otherwise use a placeholder
                    const endDate = new Date(session.EndDate);
        
                    // Format the date to Thai time zone
                    dueDateStr = endDate.toLocaleString('th-TH', {
                        timeZone: 'Asia/Bangkok',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });                    
                    return `ภารกิจ: ${mission.Description} (สิ้นสุด: ${dueDateStr})`;
                });
                
                console.log("descriptions", descriptions);
                
        
                const missionsListStr = descriptions.join('\n');
                // Adjusting the message text to include missions list
                const messageText = `สวัสดีครับลูกพี่: ภารกิจของคุณเริ่มต้นที่ ${session.StartDate.toLocaleString()}. ตรวจสอบความคืบหน้าของคุณ!\n\nMissions:\n${missionsListStr}`;
                
    
                await sendLineNotificationAlert(user, messageText, session.UserID);
                await db.updateNextReminderTime(session.SessionID);
            }
        }
    });
    
cron.schedule('* * * * *', async () => {
    console.log('Checking for missions ending soon:', new Date().toLocaleString());

    // Fetch missions that are ending soon
    const missionsEndingSoon = await db.findMissionsEndingSoon();
    console.log("Missions fetched:", missionsEndingSoon.length);

    for (const session of missionsEndingSoon) {
        console.log("Processing session:", session.SessionID);
        const user = await db.getUserLineIdByUserId(session.UserID);

        if (!user) {
            console.log("User not found for UserID:", session.UserID);
            continue; // Skip to the next session if user is not found
        }
        console.log("hi")

        // Fetch all missions for the current session
        const missionsResult = await db.pool.query(
            'SELECT * FROM "LineSchemas"."Missions" WHERE "SessionID" = $1 ORDER BY "Misson_ID" ASC',
            [session.SessionID]
        );
        console.log("missionsResult", missionsResult)

        // Process missions to generate a list of descriptions
        const descriptions = missionsResult.rows.map(mission => {
            // Check if Due_Date is not null, then format it, otherwise use a placeholder
            const endDate = new Date(session.EndDate);
        
            // Format the date to Thai time zone
            dueDateStr = endDate.toLocaleString('th-TH', {
                timeZone: 'Asia/Bangkok',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            return `ภารกิจ: ${mission.Description} (สิ้นสุด: ${dueDateStr})`;
        });
        
        console.log("descriptions", descriptions);
        

        const missionsListStr = descriptions.join('\n');
        console.log("Missions list string prepared for SessionID:", session.SessionID);

        // Construct and send the notification message
        const messageText = `เตือนความจำ: ภารกิจต่อไปนี้กำลังจะสิ้นสุดในไม่ช้า โปรดตรวจสอบความคืบหน้าของคุณ!\n\nภารกิจที่กำลังจะสิ้นสุด:\n${missionsListStr}`;
        const url = 'https://whale-app-63n8p.ondigitalocean.app/progress';
        const title = 'Notification'
        await sendLineNotificationMission(user, messageText, session.UserID, url, title);
        console.log("Notification sent for SessionID:", session.SessionID);

        // Update logic after sending the notification
        await db.updatePostNotificationLogic(session.SessionID);
    }
});
    
    
}

module.exports = {
    scheduleTask
};