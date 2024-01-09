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

        const missionTitle = document.createElement('div');
        missionTitle.classList.add('mission-title');
        missionTitle.innerText = mission.Title;

        const missionDesc = document.createElement('div');
        missionDesc.classList.add('mission-description');
        missionDesc.innerText = mission.Description;

        const completeButton = document.createElement('button');
        completeButton.classList.add('complete-mission');
        completeButton.setAttribute('data-mission-id', mission.Misson_ID);
        completeButton.setAttribute('data-completed', mission.Complete);
        completeButton.innerText = mission.Complete ? 'Not Complete' : 'Complete';

        missionDiv.appendChild(missionTitle);
        missionDiv.appendChild(missionDesc);
        missionDiv.appendChild(completeButton);

        completeButton.addEventListener('click', function() {
            const completed = this.getAttribute('data-completed') === 'true';
            updateMissionStatus(mission.Misson_ID, !completed);
            this.setAttribute('data-completed', !completed);
            this.textContent = !completed ? 'Not Complete' : 'Complete';
            missionDiv.style.backgroundColor = !completed ? '#77dd77' : 'white';
        });

        missionsContainer.appendChild(missionDiv);

        // Apply the initial background color
        missionDiv.style.backgroundColor = mission.Complete ? '#77dd77' : 'white';
    });

    missionsLoaded = true;
    //checkAndDisplayContent();
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





/*function checkAndDisplayContent() {
    if (countdownLoaded && missionsLoaded) {
        displayLoading(false);
    }
}
*/

/*
function displayLoading(show) {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (!loadingIndicator) {
        console.error('Loading indicator element not found');
        return;
    }
    loadingIndicator.style.display = show ? 'block' : 'none';
}
*/

// Inside the window.onload function
window.onload = async function() {
    const userId = 4; // Replace with actual user ID
   // displayLoading(true);
    const what = document.getElementById("whatisgoingon")
    const what2 = document.getElementById("whatisgoingon")


    try {
        const data = await fetchLatestIncompleteSession(userId);
        if (data.session) {
            if (!data.session.Complete) {
                // If session is ongoing (Complete = False)
                populateMissions(data.missions);
                startCountdown(new Date(data.endDate));
                setupDeleteSessionButton(userId);
                what.style.display = 'block';

            } else {
                // If session is not ongoing (Complete = True)
                document.getElementById('missions').innerHTML = `
                <div class="no-session">
                    <p>No active session. You can start a new mission.</p>
                    <a href="index.html" class="start-new-mission">Start New Mission</a>
                </div>`;
            document.getElementById('countdown').style.display = 'none';
            document.getElementById('deleteSessionButton').style.display = 'none';
            what2.style.display = 'block';

            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
       // displayLoading(false);
    }
};


function setupDeleteSessionButton(userId) {
    const deleteSessionButton = document.getElementById('deleteSessionButton');
    if (deleteSessionButton) {
        deleteSessionButton.addEventListener('click', async function() {
            const confirmDelete = confirm("Are you sure you want to delete your current session? This cannot be undone.");
            if (confirmDelete) {
                try {
                    const response = await fetch(`/deleteCurrentSession?userId=${userId}`, { method: 'DELETE' });
                    if (response.ok) {
                        alert('Current session has been deleted.');
                        window.location.reload(); // Reload the page
                    } else {
                        throw new Error('Failed to delete session');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        });
    }
}
