
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
async function updateFrequencyFunction(mission)
{
    try {
        const response = await fetch('/progress/updateFrequency', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Misson_ID: mission })
        });
        if (!response.ok) {
            throw new Error('Failed to update mission status');
        }
        // Optionally handle the response
    } catch (error) {
        console.error('Error updating mission status:', error);
    }
}

function populateMissions(missions, sessionId) {
    let sessionContainer = document.getElementById(`container-mission-${sessionId}`);
    if (!sessionContainer) {
        sessionContainer = document.createElement('div');
        sessionContainer.id = `container-mission-${sessionId}`;
        sessionContainer.classList.add('container-mission-class');
        document.getElementById('missions').appendChild(sessionContainer);
    }

    let sessionMissionsContainer = document.createElement('div');
    sessionMissionsContainer.id = `missions-${sessionId}`;
    sessionMissionsContainer.classList.add('session-missions-container');
    sessionContainer.appendChild(sessionMissionsContainer);

    sessionMissionsContainer.innerHTML = '';

    missions.forEach(mission => {
        console.log("yoyoyoyoyoyoyoyo", mission)
        console.log(mission.frequency)

        console.log(mission.Frequency)
        const missionDiv = document.createElement('div');
        missionDiv.classList.add('mission');
        missionDiv.style.backgroundColor = 'white';

        const missionContent = document.createElement('div');
        missionContent.classList.add('mission-content');

        const missionTitle = document.createElement('div');
        missionTitle.classList.add('mission-title');
        missionTitle.innerText = mission.Title;
        missionContent.appendChild(missionTitle);

        const missionDesc = document.createElement('div');
        missionDesc.classList.add('mission-description');
        missionDesc.innerText = mission.Description;
        missionContent.appendChild(missionDesc);

  


        missionDiv.appendChild(missionContent);
        const actionContainer = document.createElement('div');
        actionContainer.classList.add('action-container');
    
 

        // Only add the button if the mission is not completed
        if (!mission.Complete) {
            const frequencyText = document.createElement('div');
            frequencyText.classList.add('mission-frequency');
            frequencyText.innerText = `จำนวนครั้งที่เหลือ: ${mission.Frequency}`;
            actionContainer.appendChild(frequencyText);
                  const completeButton = document.createElement('button');
        completeButton.classList.add('complete-mission');
        completeButton.setAttribute('data-mission-id', mission.Misson_ID);
        completeButton.setAttribute('data-completed', mission.Complete);
        completeButton.innerText = 'Complete';
        actionContainer.appendChild(completeButton);

        completeButton.addEventListener('click', async function() {
            if (mission.Frequency > 1) {
                updateFrequencyFunction(mission.Misson_ID);

                    // Start fetch request
                   
                    mission.Frequency -= 1;
                    frequencyText.innerText = `จำนวนครั้งที่เหลือ: ${mission.Frequency}`;
                } else {
                // Show the confirmation dialog
                const customConfirm = document.getElementById('customConfirm2');
                customConfirm.style.display = 'block';
            
                const confirmYes = document.getElementById('confirmYesY');
                const confirmNo = document.getElementById('confirmNoN');
                
               

                function resetModal() {
                    customConfirm.style.display = 'none';
                    confirmYes.removeEventListener('click', confirmAction);
                    confirmNo.removeEventListener('click', cancelAction);
                }

                function showCompletionPopup() {
                    const completionPopup = document.getElementById('completionPopup');
                    completionPopup.classList.remove('hidden');
                    completionPopup.classList.add('popup-show');
                }
                function hideCompletionPopup() {
                    const completionPopup = document.getElementById('completionPopup');
                    completionPopup.classList.add('hidden'); // Add the hidden class to hide the popup
                }
            
                function confirmAction() {

                    resetModal(); // Hide modal and clean up
                    updateFrequencyFunction(mission.Misson_ID)
                    updateMissionStatus(mission.Misson_ID, true);
                    actionContainer.removeChild(completeButton);
                    actionContainer.removeChild(frequencyText);
                    const video = document.querySelector('#completionPopup video');
                    video.play();
                    


                    const completionImage = document.createElement('img');
                    completionImage.classList.add('mission-image-complete'); // Adding class name here
                    completionImage.src = 'https://res.cloudinary.com/linema/image/upload/v1710213702/meerkat_celebrates_exvy6g.png';
                    completionImage.alt = 'Completed';
        
                    missionDiv.appendChild(completionImage);

                    // Show the completion GIF popup
                    showCompletionPopup();
                    missionDiv.style.backgroundColor = '#FDD771';

                }
            
                function cancelAction() {
                    resetModal(); // Hide modal and clean up
                }
            
                confirmYes.addEventListener('click', confirmAction);
                confirmNo.addEventListener('click', cancelAction);

                const goBackButton = document.querySelector('.go-back-button'); // Assuming there's only one, otherwise consider adding specific selectors
                goBackButton.addEventListener('click', hideCompletionPopup);
            }
            });
        } 
        missionDiv.appendChild(actionContainer);

        if (mission.Complete) {
            
            // Mission is already completed, show the image instead of the button
            const completionImage = document.createElement('img');
            completionImage.classList.add('mission-image-complete'); // Adding class name here
            completionImage.src = 'https://res.cloudinary.com/linema/image/upload/v1710213702/meerkat_celebrates_exvy6g.png';
            completionImage.alt = 'Completed';
            missionDiv.style.backgroundColor = '#FDD771';

            missionDiv.appendChild(completionImage);
        }

        sessionMissionsContainer.appendChild(missionDiv);
    });

    const deleteButtonContainer = document.createElement('div');
    deleteButtonContainer.classList.add('abovedeletebtn');

    const deleteSessionButton = document.createElement('button');
    deleteSessionButton.innerText = 'ลบเซสชันนี้';
    deleteSessionButton.classList.add('deletebtn');
    deleteSessionButton.addEventListener('click', function() {
        const customConfirm = document.getElementById('customConfirm');
        customConfirm.style.display = 'block';
        customConfirm.setAttribute('data-session-id', sessionId);
    });

    deleteButtonContainer.appendChild(deleteSessionButton);
    sessionContainer.appendChild(deleteButtonContainer);
};



document.getElementById('confirmYes').addEventListener('click', async function() {
    const customConfirm = document.getElementById('customConfirm');
    const sessionId = customConfirm.getAttribute('data-session-id');
    try {
        // Update the fetch URL as needed for your application context
        const response = await fetch(`/deleteCurrentSession?sessionId=${sessionId}`, { method: 'DELETE' });
        if (response.ok) {
            window.location.reload(); // Reload the page
        } else {
            throw new Error('Failed to delete session');
        }
    } catch (error) {
        console.error('Error:', error);
    }
    customConfirm.style.display = 'none'; // Hide the dialog after processing
});

document.getElementById('confirmNo').addEventListener('click', function() {
    const customConfirm = document.getElementById('customConfirm');
    customConfirm.style.display = 'none'; // Hide the dialog if the user cancels
});


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
    let sessionContainer = document.getElementById(`container-mission-${sessionId}`);
    if (!sessionContainer) {
        sessionContainer = document.createElement('div');
        sessionContainer.id = `container-mission-${sessionId}`;
        sessionContainer.classList.add('container-mission-class');
        document.getElementById('missions').prepend(sessionContainer);
    }

    var countdownContainer = document.createElement('div');
    countdownContainer.classList.add('countdownclass');
    countdownContainer.id = `countdown-${sessionId}`;
    sessionContainer.prepend(countdownContainer);

    // Adjusting the structure to match your provided format
    const timeSections = ['days', 'hours', 'minutes', 'seconds'];
    const timeLabels = ['วัน', 'ชั่วโมง', 'นาที', 'วินาที'];

    timeSections.forEach((section, index) => {
        const timeSection = document.createElement('div');
        timeSection.classList.add('time-section');

        const numberSpan = document.createElement('span');
        numberSpan.id = `${section}-number-${sessionId}`;
        numberSpan.classList.add('days-number');
        // Make ID unique to each session
        numberSpan.textContent = '00'; // Default text

        const labelSpan = document.createElement('span');
        labelSpan.classList.add('time-label');
        labelSpan.textContent = timeLabels[index];

        timeSection.appendChild(numberSpan);
        timeSection.appendChild(labelSpan);
        countdownContainer.appendChild(timeSection);
    });

    // Adding divider
    const divider = document.createElement('hr');
    divider.classList.add('divider-btw-clock-missions');
    sessionContainer.insertBefore(divider, countdownContainer.nextSibling);

    var countdown = setInterval(function() {
        var now = new Date().getTime();
        var distance = endDate.getTime() - now;

        if (distance < 0) {
            clearInterval(countdown);
            countdownContainer.textContent = 'EXPIRED';
        } else {
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
                    startCountdown(new Date(data.endDate), data.session.SessionID, data.session.SessionName);
                   // setupDeleteSessionButton(data.session.SessionID);
                    document.getElementById('whatisgoingon').style.display = 'block';
                } else {
                    displayNoSessionMessage(userId);
                }
            });
        } else {
            displayNoSessionMessage(userId);
        }
        
    } catch (error) {
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
    document.getElementById('whatisgoingon').style.display = 'block';

}