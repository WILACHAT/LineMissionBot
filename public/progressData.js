let countdownLoaded = false;
let missionsLoaded = false;

async function fetchLatestIncompleteSession(userId) {
    const response = await fetch(`/progress/getLatestIncompleteSession?userId=${userId}`);
    if (!response.ok) {
        throw new Error('Session not found or an error occurred.');
    }
    return response.json();
}

function createCountdownTimer(dueDate, countdownTimer, completeButton) {
    let endDate = new Date(dueDate).getTime();

    let countdown = setInterval(function() {
        let now = new Date().getTime();
        let distance = endDate - now;

        if (distance < 0) {
            clearInterval(countdown);
            countdownTimer.innerText = 'Expired';
            completeButton.disabled = true;
        } else {
            let days = Math.floor(distance / (1000 * 60 * 60 * 24));
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownTimer.innerText = `เหลือเวลา: ${days} วัน ${hours} ชั่วโมง ${minutes} นาที ${seconds} วินาที`;
            countdownTimer.style.color = 'white'; // Change the color to red
        }
    }, 1000);
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
        missionDiv.appendChild(missionTitle);

        const missionDesc = document.createElement('div');
        missionDesc.classList.add('mission-description');
        missionDesc.innerText = mission.Description;
        missionDiv.appendChild(missionDesc);

        let missionDueDate;
        if (mission.Due_Date) {
            missionDueDate = document.createElement('div');
            missionDueDate.classList.add('mission-due-date');
            missionDueDate.innerText = `วันที่ครบกำหนด: ${new Date(mission.Due_Date).toLocaleString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}`;
            missionDiv.appendChild(missionDueDate);
        }

        const countdownTimer = document.createElement('div');
        countdownTimer.classList.add('countdown-timer');
        missionDiv.appendChild(countdownTimer);

        const completeButton = document.createElement('button');
        completeButton.classList.add('complete-mission');
        completeButton.setAttribute('data-mission-id', mission.Misson_ID);
        completeButton.setAttribute('data-completed', mission.Complete.toString());
        completeButton.innerText = mission.Complete ? 'ยังไม่เสร็จ' : 'เสร็จแล้ว';
        missionDiv.appendChild(completeButton);

        const missionCheckmark = document.createElement('div');
        missionCheckmark.classList.add('mission-checkmark');
        missionCheckmark.innerHTML = '✔';
        missionCheckmark.style.display = mission.Complete ? 'block' : 'none';
        missionDiv.appendChild(missionCheckmark);

        const isExpired = mission.Due_Date && new Date(mission.Due_Date).getTime() < new Date().getTime();
        if (isExpired) {
            countdownTimer.innerText = 'หมดเวลา';
            completeButton.disabled = true;
            completeButton.classList.add('disabled');
        } else if (mission.Due_Date) {
            createCountdownTimer(mission.Due_Date, countdownTimer, completeButton);
        }

        if (mission.Complete || isExpired) {
            countdownTimer.style.display = 'none';
            if (missionDueDate) missionDueDate.style.display = 'none';
        }

        completeButton.addEventListener('click', function() {
            const currentlyCompleted = this.getAttribute('data-completed') === 'true';
            const newCompletedState = !currentlyCompleted;

            updateMissionStatus(mission.Misson_ID, newCompletedState);
            this.setAttribute('data-completed', newCompletedState.toString());
            this.innerText = newCompletedState ? 'ยังไม่เสร็จ' : 'เสร็จแล้ว';
            missionDiv.style.backgroundColor = newCompletedState ? '#FFA500' : 'white';

            missionCheckmark.style.display = newCompletedState ? 'block' : 'none';
            countdownTimer.style.display = newCompletedState || isExpired ? 'none' : '';
            if (missionDueDate) missionDueDate.style.display = newCompletedState || isExpired ? 'none' : '';
        });

        missionsContainer.appendChild(missionDiv);
        missionDiv.style.backgroundColor = mission.Complete ? '#FFA500' : 'white';
    });

    missionsLoaded = true;
};






function showCustomPopup(message, showButtons = true) {
    const popup = document.getElementById('customConfirm');
    const messageParagraph = popup.getElementsByTagName('p')[0];
    const buttonsContainer = popup.querySelector('.button-container');

    // Update the popup message
    messageParagraph.textContent = message;

    // Optionally show or hide the confirmation buttons
    buttonsContainer.style.display = showButtons ? 'block' : 'none';

    // Display the popup
    popup.style.display = 'block';

    // If not showing buttons, you might want to auto-hide the popup after a delay
    if (!showButtons) {
        setTimeout(() => {
            popup.style.display = 'none';
        }, 800); // Adjust time as needed
    }
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



// Inside the window.onload function
window.onload = async function() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');

    try {
        const data = await fetchLatestIncompleteSession(userId);
        console.log("data received after fetch", data);

        // Check if there is an existing session and it's not complete
        if (data.session && !data.session.Complete) {
            populateMissions(data.missions);
            startCountdown(new Date(data.endDate));
            setupCompleteSessionButton(userId);

            setupDeleteSessionButton(userId);

            document.getElementById('whatisgoingon').style.display = 'block';
        } else {
            // Handle the case where there is no session or missions
            displayNoSessionMessage(userId);
        }
    } catch (error) {
        console.error('Error:', error);
        displayNoSessionMessage(userId); // Display the message in case of an error too
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
    document.getElementById('doneSessionButton').style.display = 'none';

    document.getElementById('whatisgoingon').style.display = 'block';
}
function setupCompleteSessionButton(userId) {
    // Client-side JavaScript
const doneSessionButton = document.getElementById('doneSessionButton');
if (doneSessionButton) {
    doneSessionButton.addEventListener('click', async function() {
        const isConfirmed = confirm("Are you sure you want to mark this session as completed?");
        if (!isConfirmed) return;

        try {
            console.log("hi", userId)
            // Note: userId is appended in the query parameters, not sent in the body
            // Client-side
            const response = await fetch('/progress/completeMissionSession', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userId })
            });


            if (!response.ok) throw new Error('Failed to complete the session.');

            alert('Session marked as completed successfully!');
            window.location.reload(); // or redirect
        } catch (error) {
            console.error('Error completing the session:', error);
            alert('There was an error completing the session.');
        }
    });
}

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