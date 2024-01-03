let countdownLoaded = false;
let missionsLoaded = false;

async function fetchLatestIncompleteSession(userId) {
    const response = await fetch(`/progress/getLatestIncompleteSession?userId=${userId}`);
    if (!response.ok) {
        throw new Error('Session not found or an error occurred.');
    }
    return response.json();
}
function populateMissions(missions) {
    const missionsContainer = document.getElementById('missions');
    missionsContainer.innerHTML = '';

    missions.forEach(mission => {
        const missionDiv = document.createElement('div');
        missionDiv.classList.add('mission');
        const buttonLabel = mission.Complete ? 'Not Complete' : 'Complete';
        const backgroundColor = mission.Complete ? 'green' : 'initial';

        missionDiv.innerHTML = `
            <h2 class="mission-title">${mission.Title}</h2>
            <p class="mission-description">${mission.Description}</p>
            <button class="complete-mission" data-mission-id="${mission.Misson_ID}" data-completed="${mission.Complete}">${buttonLabel}</button>
        `;
        missionsContainer.appendChild(missionDiv);

        const completeButton = missionDiv.querySelector('.complete-mission');
        completeButton.addEventListener('click', function() {
            const completed = this.getAttribute('data-completed') === 'true';
            updateMissionStatus(mission.Misson_ID, !completed);
            this.setAttribute('data-completed', !completed);
            this.textContent = !completed ? 'Not Complete' : 'Complete';
            missionDiv.style.backgroundColor = !completed ? 'green' : 'initial';
        });

        // Apply the initial background color
        missionDiv.style.backgroundColor = backgroundColor;
    });

    missionsLoaded = true;
    checkAndDisplayContent();
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

function startCountdown(endDate) {
    var countdownContainer = document.getElementById('countdown');
    countdownContainer.innerHTML = 'Loading countdown...';

    var countdown = setInterval(function() {
        var now = new Date().getTime();
        var distance = endDate.getTime() - now;

        if (distance < 0) {
            clearInterval(countdown);
            document.getElementById('countdown').innerHTML = 'EXPIRED';
        } else {
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('countdown').innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
    }, 1000);
    countdownLoaded = true;
    checkAndDisplayContent();
}





function checkAndDisplayContent() {
    if (countdownLoaded && missionsLoaded) {
        displayLoading(false);
    }
}

function displayLoading(show) {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (!loadingIndicator) {
        console.error('Loading indicator element not found');
        return;
    }
    loadingIndicator.style.display = show ? 'block' : 'none';
}

window.onload = async function() {
    const userId = 4;
    displayLoading(true);

    try {
        const data = await fetchLatestIncompleteSession(userId);
        populateMissions(data.missions);
        console.log("in loadd", data.missions)
        startCountdown(new Date(data.endDate));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        displayLoading(false);
    }
};