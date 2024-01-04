// completed.js

let userId;

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    userId = params.get('userId');

    if (userId) {
        loadCompletedMissions(userId);
    } else {
        console.error('No user ID provided.');
    }
});

function loadCompletedMissions(userId) {
    fetch(`/completed/getCompletedMissions?userId=${encodeURIComponent(userId)}`)
        .then(response => response.json())
        .then(data => {
            displayMissions(data.missions);
            displayCompletionStatus(data.missions);
        })
        .catch(error => console.error('Error loading completed missions:', error));
}

function displayMissions(missions) {
    const missionsContainer = document.getElementById('missions-container');
    missionsContainer.innerHTML = '';

    missions.forEach(mission => {
        const missionDiv = document.createElement('div');
        missionDiv.classList.add('mission');
        missionDiv.innerHTML = `
            <h2 class="mission-title">${mission.Title}</h2>
            <p class="mission-description">${mission.Description}</p>
            <div>Status: ${mission.Complete ? 'Completed' : 'Not Completed'}</div>
        `;
        missionsContainer.appendChild(missionDiv);
    });
}

function displayCompletionStatus(missions) {
    const totalMissions = missions.length;
    const completedMissions = missions.filter(m => m.Complete).length;
    const completionPercentage = (completedMissions / totalMissions) * 100;
    const completionText = document.createElement('div');
    completionText.innerHTML = `
        <p>You have completed ${completedMissions}/${totalMissions} missions.</p>
        <p>That's ${completionPercentage}% of your missions.</p>
    `;

    if(completionPercentage === 100) {
        completionText.innerHTML += '<p>Congratulations, you finished all your tasks!</p>';
    }

    const missionsContainer = document.getElementById('missions-container');
    missionsContainer.appendChild(completionText);
}

function submitReflection() {
    const reflectionText = document.getElementById('reflection').value;
    fetch('/completed/submitReflection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, reflection: reflectionText })
    })
    .then(response => {
        if (response.ok) {
            console.log('Reflection submitted successfully');
        } else {
            throw new Error('Reflection submission failed');
        }
    })
    .catch(error => console.error('Error submitting reflection:', error));
}
