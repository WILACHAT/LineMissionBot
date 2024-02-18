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
    // Check if there's already a countdown for this session, remove it if there is
    var existingCountdown = document.getElementById(`countdown-${sessionId}`);
    if (existingCountdown) {
        existingCountdown.remove();
    }

    // Create the countdown container dynamically
    var countdownContainer = document.createElement('div');
    countdownContainer.classList.add('countdownclass');
    countdownContainer.id = `countdown-${sessionId}`;

    // Create the structure for the countdown
    var daysBox = document.createElement('div');
    daysBox.classList.add('days-box');
    var hoursBox = document.createElement('div');
    hoursBox.classList.add('hours-box');
    var minutesBox = document.createElement('div');
    minutesBox.classList.add('minutes-box');
    var secondsBox = document.createElement('div');
    secondsBox.classList.add('seconds-box');

    var daysLabel = document.createElement('div');
    daysLabel.classList.add('days-label');
    daysLabel.textContent = 'วัน';
    var hoursLabel = document.createElement('div');
    hoursLabel.classList.add('hours-label');
    hoursLabel.textContent = 'ชั่วโมง';
    var minutesLabel = document.createElement('div');
    minutesLabel.classList.add('minutes-label');
    minutesLabel.textContent = 'นาที';
    var secondsLabel = document.createElement('div');
    secondsLabel.classList.add('seconds-label');
    secondsLabel.textContent = 'วินาที';

    var daysNumber = document.createElement('div');
    daysNumber.classList.add('days-number');
    var hoursNumber = document.createElement('div');
    hoursNumber.classList.add('hours-number');
    var minutesNumber = document.createElement('div');
    minutesNumber.classList.add('minutes-number');
    var secondsNumber = document.createElement('div');
    secondsNumber.classList.add('seconds-number');

    // Append the number and label divs to the corresponding box divs
    daysBox.appendChild(daysNumber);
    daysBox.appendChild(daysLabel);
    hoursBox.appendChild(hoursNumber);
    hoursBox.appendChild(hoursLabel);
    minutesBox.appendChild(minutesNumber);
    minutesBox.appendChild(minutesLabel);
    secondsBox.appendChild(secondsNumber);
    secondsBox.appendChild(secondsLabel);

    // Append the box divs to the countdown container
    countdownContainer.appendChild(daysBox);
    countdownContainer.appendChild(hoursBox);
    countdownContainer.appendChild(minutesBox);
    countdownContainer.appendChild(secondsBox);

    // Find the session container
    var sessionContainer = document.getElementById(`session-container-${sessionId}`);
    if (!sessionContainer) {
        sessionContainer = document.createElement('div');
        sessionContainer.id = `session-container-${sessionId}`;
        sessionContainer.classList.add('session-container');
        document.getElementById('whatisgoingon').prepend(sessionContainer);
    }

    // Prepend the countdown to the session container so it appears above the missions
    sessionContainer.prepend(countdownContainer);

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
            countdownContainer.innerHTML = 'EXPIRED'; // You might want to adjust this to match your UI design
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