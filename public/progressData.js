let countdownLoaded = false;
let missionsLoaded = false;

async function fetchLatestIncompleteSession(userId) {
    const response = await fetch(`/progress/getLatestIncompleteSession?userId=${userId}`);
    console.log("this is the response", response)
    if (!response.ok) {
        throw new Error('Session not found or an error occurred.');
    }
    return response.json();
}
function populateMissions(missions) {
    const missionsContainer = document.getElementById('missions');
    missionsContainer.innerHTML = '';

    missions.forEach(mission => {
        // Create mission container
        const missionDiv = document.createElement('div');
        missionDiv.classList.add('mission');

        // Mission title
        const missionTitle = document.createElement('div');
        missionTitle.classList.add('mission-title');
        missionTitle.innerText = mission.Title;
        missionDiv.appendChild(missionTitle);

        // Mission description
        const missionDesc = document.createElement('div');
        missionDesc.classList.add('mission-description');
        missionDesc.innerText = mission.Description;
        missionDiv.appendChild(missionDesc);

        // Checkmark for completed missions
        const missionCheckmark = document.createElement('div');
        missionCheckmark.classList.add('mission-checkmark');
        missionCheckmark.innerHTML = '✔';
        missionCheckmark.style.display = mission.Complete ? 'block' : 'none';
        missionDiv.appendChild(missionCheckmark);

        // Complete/Not Complete button
        const completeButton = document.createElement('button');
        completeButton.classList.add('complete-mission');
        completeButton.setAttribute('data-mission-id', mission.Mission_ID);
        completeButton.setAttribute('data-completed', mission.Complete);
        completeButton.innerText = mission.Complete ? 'Not Complete' : 'Complete';
        missionDiv.appendChild(completeButton);

        completeButton.addEventListener('click', function() {
            const completed = this.getAttribute('data-completed') === 'true';
            updateMissionStatus(mission.Misson_ID, !completed);
            this.setAttribute('data-completed', !completed);
            this.textContent = !completed ? 'Not Complete' : 'Complete';
            missionDiv.style.backgroundColor = !completed ? '#FFA500' : 'white';
            missionCheckmark.style.display = !completed ? 'block' : 'none'; // Toggle checkmark
        });
        

        missionsContainer.appendChild(missionDiv);

        missionDiv.style.backgroundColor = mission.Complete ? '#FFA500' : 'white';
    });

    missionsLoaded = true;
}

async function updateMissionStatus(missionId, completed) {
    console.log("in update mission")
    console.log("in update mission", missionId)
    console.log("in update completed", completed)


    try {
        const response = await fetch('/progress/updateMissionStats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ missionId, completed })
        });
        if (!response.ok) {
            throw new Error('Failed to update mission status');
        }
        // Optionally handle the response
    } catch (error) {
        console.error('Error updating mission status:', error);
    }
}
/*
function startCountdown(endDate) {
    var countdownContainer = document.getElementById('countdown');
    // Make sure we don't overwrite our countdown structure
    var daysElem = document.getElementById('days-number');
    var hoursElem = document.getElementById('hours-number');
    var minutesElem = document.getElementById('minutes-number');
    var secondsElem = document.getElementById('seconds-number');

    var countdown = setInterval(function() {
        var now = new Date().getTime();
        var distance = endDate - now;

        if (distance < 0) {
            clearInterval(countdown);
            daysElem.innerText = '00';
            hoursElem.innerText = '00';
            minutesElem.innerText = '00';
            secondsElem.innerText = '00';
            countdownContainer.innerHTML += 'EXPIRED';
        } else {
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            daysElem.innerText = days.toString().padStart(2, '0');
            hoursElem.innerText = hours.toString().padStart(2, '0');
            minutesElem.innerText = minutes.toString().padStart(2, '0');
            secondsElem.innerText = seconds.toString().padStart(2, '0');
        }
    }, 1000);
    countdownLoaded = true;
   // checkAndDisplayContent();
}

*/
// Inside the window.onload function
window.onload = async function() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');

try {
    const data = await fetchLatestIncompleteSessions(userId); // Assume this now fetches multiple sessions
    console.log("Data received after fetch", data);

    if (data && data.length > 0) {
        data.forEach(sessionData => {
            if (sessionData.session && !sessionData.session.Complete) {
                populateMissions(sessionData.missions);
                // Assuming startCountdown and setupDeleteSessionButton can handle session-specific data
                // You might need to adjust these functions to be able to handle multiple sessions
                startCountdown(new Date(sessionData.endDate), sessionData.session.SessionID); // Modified to pass SessionID
                setupDeleteSessionButton(sessionData.session.SessionID);
                
                // Make sure to adjust how you display sessions
                // For example, append session-specific content to a parent element
                const sessionElement = document.createElement('div');
                sessionElement.id = `session-${sessionData.session.SessionID}`;
                sessionElement.style.display = 'block';
                // Populate sessionElement with session-specific information...
                document.body.appendChild(sessionElement); // Adjust as necessary to insert into the correct location
            }
        });
    } else {
        // Handle the case where there are no sessions or missions
        displayNoSessionMessage(userId);
    }
} catch (error) {
    console.error('Error:', error);
    displayNoSessionMessage(userId); // Display the message in case of an error too
};

};

function displayNoSessionMessage(userId) {
    const startNewMissionLink = `<a href="index.html?userId=${userId}" class="start-new-mission">เริ่มเซสชันภารกิจใหม่</a>`;
    document.getElementById('missions').innerHTML = `
        <div class="no-session">
            <p>คุณไม่มีเซสชันที่ใช้งานอยู่ในขณะนี้ คุณสามารถเริ่มภารกิจใหม่ได้</p>
            ${startNewMissionLink}
        </div>`;
    document.getElementById('countdown').style.display = 'none';
    document.getElementById('deleteSessionButton').style.display = 'none';
    document.getElementById('whatisgoingon').style.display = 'block';
}


function setupDeleteSessionButton(userId) {
    const deleteSessionButton = document.getElementById('deleteSessionButton');
    const customConfirm = document.getElementById('customConfirm');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');

    deleteSessionButton.addEventListener('click', function() {
        customConfirm.style.display = 'block';
    });

    confirmYes.addEventListener('click', async function() {
        try {
            const response = await fetch(`/deleteCurrentSession?userId=${userId}`, { method: 'DELETE' });
            if (response.ok) {
                //alert('Current session has been deleted.');
                window.location.reload(); // Reload the page
            } else {
                throw new Error('Failed to delete session');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        customConfirm.style.display = 'none';
    });

    confirmNo.addEventListener('click', function() {
        customConfirm.style.display = 'none';
    });
}