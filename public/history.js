// history.js

let userId = 4;

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
    fetch(`/history/getSessionHistory`, {
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

    sessions.forEach(session => {
        const formattedStartDate = formatDate(session.StartDate);
        const formattedEndDate = formatDate(session.EndDate);

        const sessionDiv = document.createElement('div');
        sessionDiv.classList.add('session');
        sessionDiv.innerHTML = `
            <div onclick="toggleSessionDetails(this, ${session.SessionID})">
                <h2>Session: ${formattedStartDate} - ${formattedEndDate}</h2>
                <p>Rating: ${session.Rating || 'Not rated'}</p>
                <div>Status: ${session.Complete ? 'Completed' : 'Not Completed'}</div>
            </div>
            <div class="session-details" style="display: none;">
                <p>Reflection: ${session.Reflection || 'No reflection submitted'}</p>
                <!-- Add more session details here -->
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
    const missionsList = document.createElement('ul');
    missions.forEach(mission => {
        const missionItem = document.createElement('li');
        missionItem.textContent = `Mission: ${mission.Title} - Status: ${mission.Complete ? 'Completed' : 'Not Completed'}`;
        missionsList.appendChild(missionItem);
    });
    detailsDiv.appendChild(missionsList);
}
