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
    // Create a unique ID for the countdown elements based on the session ID
    var countdownId = `countdown-${sessionId}`;
    var countdownContainer = document.getElementById(countdownId);

    // If a countdown timer already exists for this session, remove it
    if (countdownContainer) {
        countdownContainer.remove();
    }

    // Create the countdown container
    countdownContainer = document.createElement('div');
    countdownContainer.classList.add('countdownclass');
    countdownContainer.id = countdownId;

    // Create the countdown elements
    ['days', 'hours', 'minutes', 'seconds'].forEach((unit) => {
        var box = document.createElement('div');
        var number = document.createElement('div');
        var label = document.createElement('div');

        // Assign IDs and classes based on the unit and the session ID
        box.id = `${unit}-box-${sessionId}`;
        box.classList.add(`${unit}-box`, 'time-box');
        number.id = `${unit}-number-${sessionId}`;
        number.classList.add(`${unit}-number`);
        label.id = `${unit}-label-${sessionId}`;
        label.classList.add(`${unit}-label`);

        // Set the text content for labels
        label.textContent = unit.charAt(0).toUpperCase() + unit.slice(1);

        // Append the number and label to the box
        box.appendChild(number);
        box.appendChild(label);

        // Append the box to the countdown container
        countdownContainer.appendChild(box);
    });

    // Create or select the session container
    var sessionContainer = document.getElementById(`session-container-${sessionId}`);
    if (!sessionContainer) {
        sessionContainer = document.createElement('div');
        sessionContainer.id = `session-container-${sessionId}`;
        sessionContainer.classList.add('session-container');
        document.getElementById('missions').prepend(sessionContainer); // Assuming 'missions' is the container for all sessions
    }

    // Prepend the countdown to the session container so it appears above the missions
    sessionContainer.prepend(countdownContainer);

    // Start the countdown
    var countdown = setInterval(function() {
        var now = new Date().getTime();
        var distance = endDate - now;

        // If the countdown is over, clear the interval and set the text to 'EXPIRED'
        if (distance < 0) {
            clearInterval(countdown);
            countdownContainer.textContent = 'EXPIRED'; // This can be adjusted as needed
        } else {
            // Update the countdown numbers
            document.getElementById(`days-number-${sessionId}`).textContent = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
            document.getElementById(`hours-number-${sessionId}`).textContent = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
            document.getElementById(`minutes-number-${sessionId}`).textContent = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            document.getElementById(`seconds-number-${sessionId}`).textContent = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
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