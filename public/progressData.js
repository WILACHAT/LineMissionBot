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
function populateMissions(missions, sessionId) {
    // Create or get a unique container for the missions of this particular session
    let sessionMissionsContainer = document.getElementById(`missions-${sessionId}`);
    if (!sessionMissionsContainer) {
        // If the container doesn't exist, create it and append it to the main missions container
        sessionMissionsContainer = document.createElement('div');
        sessionMissionsContainer.id = `missions-${sessionId}`;
        sessionMissionsContainer.classList.add('session-missions-container');
        document.getElementById('missions').appendChild(sessionMissionsContainer);
    }

    // Clear the container to ensure we're not duplicating missions
    sessionMissionsContainer.innerHTML = '';

    // Iterate through each mission and create its DOM elements
    missions.forEach(mission => {
        // Create the container for the individual mission
        const missionDiv = document.createElement('div');
        missionDiv.classList.add('mission');

        // Create and append the mission title element
        const missionTitle = document.createElement('div');
        missionTitle.classList.add('mission-title');
        missionTitle.innerText = mission.Title; // Assuming 'Title' is the correct property
        missionDiv.appendChild(missionTitle);

        // Create and append the mission description element
        const missionDesc = document.createElement('div');
        missionDesc.classList.add('mission-description');
        missionDesc.innerText = mission.Description; // Assuming 'Description' is the correct property
        missionDiv.appendChild(missionDesc);

        // Create and append the checkmark for completed missions
        const missionCheckmark = document.createElement('div');
        missionCheckmark.classList.add('mission-checkmark');
        missionCheckmark.innerHTML = mission.Complete ? '✔' : ''; // Adjust if needed
        missionDiv.appendChild(missionCheckmark);

        // Create and append the Complete/Not Complete button
        const completeButton = document.createElement('button');
        completeButton.classList.add('complete-mission');
        completeButton.setAttribute('data-mission-id', mission.Mission_ID); // Assuming 'Mission_ID' is correct
        completeButton.setAttribute('data-completed', mission.Complete);
        completeButton.innerText = mission.Complete ? 'Not Complete' : 'Complete'; // Toggle button text based on status
        missionDiv.appendChild(completeButton);

        // Add an event listener to the Complete/Not Complete button
        completeButton.addEventListener('click', function() {
            // Toggle the completed status
            const completed = this.getAttribute('data-completed') === 'true';
            updateMissionStatus(mission.Mission_ID, !completed); // Function to update the status
            this.setAttribute('data-completed', !completed);
            this.innerText = !completed ? 'Not Complete' : 'Complete';
            missionDiv.style.backgroundColor = !completed ? '#FFA500' : 'white'; // Change color based on status
            missionCheckmark.style.display = !completed ? 'block' : 'none'; // Show or hide checkmark
        });

        // Append the mission to the session's missions container
        sessionMissionsContainer.appendChild(missionDiv);

        // Set the background color of the mission element based on completion status
        missionDiv.style.backgroundColor = mission.Complete ? '#FFA500' : 'white';
    });

    // Variable to track if missions have been loaded - ensure this is declared and managed appropriately
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

function startCountdown(endDate, sessionId) {

      var sessionContainer = document.getElementById(`session-container-${sessionId}`);
    if (!sessionContainer) {
        // Create the session container if it does not exist
        sessionContainer = document.createElement('div');
        sessionContainer.id = `session-container-${sessionId}`;
        sessionContainer.classList.add('session-container');
        // Append the new session container to the main container, likely where you have 'whatisgoingon'
        document.getElementById('whatisgoingon').prepend(sessionContainer);
    }
    // Create the countdown container dynamically
    var countdownContainer = document.createElement('div');
    countdownContainer.classList.add('countdownclass');
    countdownContainer.id = `countdown-${sessionId}`;

    // Clone the countdown structure for this container
    var countdownBackground = document.createElement('div');
    countdownBackground.id = 'countdown-background';

    var daysBox = document.createElement('div');
    daysBox.id = 'days-box';
    var hoursBox = document.createElement('div');
    hoursBox.id = 'hours-box';
    var minutesBox = document.createElement('div');
    minutesBox.id = 'minutes-box';
    var secondsBox = document.createElement('div');
    secondsBox.id = 'seconds-box';

    var daysLabel = document.createElement('div');
    daysLabel.id = 'days-label';
    daysLabel.textContent = 'วัน';
    var hoursLabel = document.createElement('div');
    hoursLabel.id = 'hours-label';
    hoursLabel.textContent = 'ชั่วโมง';
    var minutesLabel = document.createElement('div');
    minutesLabel.id = 'minutes-label';
    minutesLabel.textContent = 'นาที';
    var secondsLabel = document.createElement('div');
    secondsLabel.id = 'seconds-label';
    secondsLabel.textContent = 'วินาที';

    var daysNumber = document.createElement('div');
    daysNumber.id = 'days-number';
    var hoursNumber = document.createElement('div');
    hoursNumber.id = 'hours-number';
    var minutesNumber = document.createElement('div');
    minutesNumber.id = 'minutes-number';
    var secondsNumber = document.createElement('div');
    secondsNumber.id = 'seconds-number';

    // Append all elements to the countdown background
    countdownBackground.appendChild(daysBox);
    countdownBackground.appendChild(hoursBox);
    countdownBackground.appendChild(minutesBox);
    countdownBackground.appendChild(secondsBox);

    countdownBackground.appendChild(daysLabel);
    countdownBackground.appendChild(hoursLabel);
    countdownBackground.appendChild(minutesLabel);
    countdownBackground.appendChild(secondsLabel);

    countdownBackground.appendChild(daysNumber);
    countdownBackground.appendChild(hoursNumber);
    countdownBackground.appendChild(minutesNumber);
    countdownBackground.appendChild(secondsNumber);

    // Append the countdown background to the countdown container
    countdownContainer.appendChild(countdownBackground);

    // Append the countdown container to the main missions container
    document.getElementById(`missions-${sessionId}`).appendChild(countdownContainer);

    // Start the countdown
    var countdown = setInterval(function() {
        var now = new Date().getTime();
        var distance = endDate.getTime() - now;

        if (distance < 0) {
            clearInterval(countdown);
            daysNumber.textContent = '00';
            hoursNumber.textContent = '00';
            minutesNumber.textContent = '00';
            secondsNumber.textContent = '00';
            countdownContainer.innerHTML += 'EXPIRED';
        } else {
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            daysNumber.textContent = days.toString().padStart(2, '0');
            hoursNumber.textContent = hours.toString().padStart(2, '0');
            minutesNumber.textContent = minutes.toString().padStart(2, '0');
            secondsNumber.textContent = seconds.toString().padStart(2, '0');
        }
    }, 1000);

}

window.onload = async function() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');

    try {
        const sessionsData = await fetchLatestIncompleteSession(userId);
        console.log("data received after fetch", sessionsData);

        if (sessionsData && sessionsData.length > 0) {
            sessionsData.forEach(data => {
                console.log("missions for session", data.session.SessionID, data.missions);
                if (data.session && !data.session.Complete) {
                    populateMissions(data.missions, data.session.SessionID); // Pass SessionID here
                    startCountdown(new Date(data.endDate), data.session.SessionID);
                    setupDeleteSessionButton(data.session.SessionID);
                    document.getElementById('whatisgoingon').style.display = 'block';
                } else {
                    displayNoSessionMessage(userId);
                }
            });
        } else {
            displayNoSessionMessage(userId);
        }
        
    } catch (error) {
        console.error('Error:', error);
        displayNoSessionMessage(userId);
    }
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