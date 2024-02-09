// In your scheduledTask.js or wherever you're implementing the cron job

const cron = require('node-cron');
const db = require('./db');
const { sendLineNotification } = require('./services/lineBotService');
const { sendLineNotificationAlert } = require('./services/lineBotService');
const { sendLineNotificationMission } = require('./services/lineBotService');


function scheduleTask() {
    cron.schedule('*/5 * * * *', async () => {
        console.log('Checking for expired missions at:', new Date().toLocaleString());
        const expiredMissions = await db.findExpiredMissions();
        console.log("expiredMissions", expiredMissions)

        if (expiredMissions.length > 0) {
            console.log("inside first if")

            for (let mission of expiredMissions) {
                await db.completeMissionSession(mission.SessionID);
                const what = await db.getCompletedMissionsForUser(mission.UserID)

                console.log("this is the what", what)
                console.log("this is the what", what.length)

                const completedMissions= what.reduce((count, mission) => mission.Complete ? count + 1 : count, 0);

                console.log("completedmissions", completedMissions)
                await db.updateMissionSessionRating(mission.SessionID, completedMissions);


                const user = await db.getUserLineIdByUserId(mission.UserID);
                console.log("user user user", user)

                if (user) {
                    console.log("inside useer if")
                    const messageText = `Your mission with ID: ${mission.SessionID} has expired!`;
                    console.log("user id is correct?", user)
                    await sendLineNotification(user, messageText, mission.UserID);
                    await db.markNotificationAsSent(mission.SessionID); // Mark the notification as sent
                }
            }
        } else {
            console.log('No expired missions found at this time.');
        }
    });
    cron.schedule('0 * * * *', async () => { // Runs every hour
        console.log('Checking for missions needing reminders:', new Date().toLocaleString());

        const missionsForReminder = await db.findMissionsNeedingReminder();

        for (const mission of missionsForReminder) {
            const user = await db.getUserLineIdByUserId(mission.UserID);
            if (user) {
                const messageText = `Reminder: Your mission started at ${mission.StartDate.toLocaleString()}. Check your progress!`;
                await sendLineNotificationAlert(user, messageText, mission.UserID);
                await db.updateNextReminderTime(mission.SessionID);
            }
        }
    });
    cron.schedule('*/1 * * * *', async () => { // Runs every 5 minutes
        console.log('Checking for upcoming missions at:', new Date().toLocaleString());

    // Define the time range for "due soon" (2 hours before due time)
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Fetch missions that are due within the next 2 hours and haven't been reminded yet
    const missionsDueSoon = await db.findMissionsDueBetween(now, twoHoursLater);

    for (const mission of missionsDueSoon) {
        if (!mission.Reminded) {
            const user = await db.getUserLineIdByUserId(mission.UserID);
            if (user) {
                const messageText = `Reminder: Your mission titled "${mission.Title}" is due in less than 2 hours. Please check your progress!`;
                await sendLineNotificationMission(user, messageText, mission.UserID);
                await db.markMissionAsReminded(mission.Misson_ID);
            }
        }
    }
    });

    
}

module.exports = {
    scheduleTask
};