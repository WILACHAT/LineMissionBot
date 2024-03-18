// history.js

const params = new URLSearchParams(window.location.search);
const userId = params.get('userId'); 

document.addEventListener('DOMContentLoaded', function() {
    // Extract userId from URL query parameter
   // const params = new URLSearchParams(window.location.search);
    //userId = params.get('userId');

    if (userId) {
        loadSessionHistory(userId);
    } else {
        console.error('No user ID provided.');
    }
});

function formatDate(dateStr) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

function loadSessionHistory(userId) {
    fetch(`/history/getSessionHistory/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        displaySessionHistory(data.sessions);
    })
    .catch(error => console.error('Error loading session history:', error));
}

function displaySessionHistory(sessions) {
    const sessionsContainer = document.getElementById('sessions-container');
    sessionsContainer.innerHTML = '';

    if (sessions.length === 0) {
        // Display the no-session div when there are no sessions
        const noSessionDiv = document.querySelector('.no-session'); // Adjust selector if necessary
        noSessionDiv.style.display = 'block'; // Make the no-session div visible
        return;
    }

    sessions.forEach(session => {
        const formattedStartDate = formatDate(session.StartDate);
        const formattedEndDate = formatDate(session.EndDate);

        const sessionDiv = document.createElement('div');
        sessionDiv.classList.add('session');
        sessionDiv.innerHTML = `
            <div onclick="toggleSessionDetails(this, ${session.SessionID})">
                <h2>Session: ${formattedStartDate} - ${formattedEndDate}</h2>
            </div>
            <div class="session-details" style="display: none;">
                <ul class="custom-ul">
                    <!-- Missions will be inserted here -->
                </ul>
                <p>Rating: ${session.Rating} / 5</p>
                <p>Reflection: ${session.Reflection || 'No reflection submitted'}</p>
            </div>
            <hr>
        `;
        sessionsContainer.appendChild(sessionDiv);
    });
}

// ... existing code ...

function toggleSessionDetails(element, sessionId) {
    const detailsDiv = element.nextElementSibling;
    
    // Check if the details are already loaded
    if (!detailsDiv.classList.contains('loaded')) {
        loadSessionMissions(sessionId, detailsDiv);
        detailsDiv.classList.add('loaded');
    }

    // Toggle the display of the details div
    detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
}

function loadSessionMissions(sessionId, detailsDiv) {
    fetch(`/history/getSessionMissions?sessionId=${sessionId}`)
        .then(response => response.json())
        .then(data => {
            displaySessionMissions(data.missions, detailsDiv);
        })
        .catch(error => console.error('Error loading session missions:', error));
}

function displaySessionMissions(missions, detailsDiv) {
    const missionsList = detailsDiv.querySelector('.custom-ul'); // Find the ul within the detailsDiv
    missionsList.innerHTML = ''; // Clear existing missions if any

    missions.forEach(mission => {
        const missionStatusClass = mission.Complete ? 'session-history-completed' : 'session-history-not-completed';
        const missionItem = document.createElement('li');
        missionItem.classList.add(missionStatusClass); // Add the dynamic class based on mission completion
        missionItem.innerHTML = `
            <strong>Mission:</strong> ${mission.Title}<br>
            <strong>Description:</strong> ${mission.Description}<br>
            <strong>Status:</strong> ${mission.Complete ? 'Completed' : 'Not Completed'}
        `;
        missionsList.appendChild(missionItem);
    });
}