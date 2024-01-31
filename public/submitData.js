let userId; 
let missionCount = 0;
let currentMissionIndex = 1;
const titleOptions = ["การเรียน", "งาน", "ออกกำลังกาย", "การทำสมาธิ", "ความสัมพันธ์", "การกิน", "การเงิน" ,"การอ่าน", "อื่นๆ"];

function initializeFlatpickr() {
    // Initialize Flatpickr only for the end date with initial settings
    flatpickr("#endDateInput", {
        dateFormat: "Y-m-d",
        minDate: new Date().fp_incr(1), // Tomorrow
        maxDate: new Date().fp_incr(30), // One month from today
        disable: [
            function(date) {
                // Disable dates outside of the initial valid range
                return date < new Date().fp_incr(1) || date > new Date().fp_incr(30);
            }
        ]
    });
}

function updateEndDatePicker() {
    const startDateInput = document.getElementById('startDateInput');
    const startDate = new Date(startDateInput.value);

    // Update the min and max date for the endDateInput
    const endDatePicker = flatpickr("#endDateInput", {
        dateFormat: "Y-m-d",
        minDate: new Date(startDate).fp_incr(1), // One day after start date
        maxDate: new Date(startDate).fp_incr(30) // One month after start date
    });
}

function createMissionInputGroup(missionNumber) {
    const missionInputGroup = document.createElement('div');
    missionInputGroup.className = 'mission-input-group';
    missionInputGroup.id = `missionGroup${missionNumber}`;
    missionInputGroup.style.display = missionNumber === 1 ? 'block' : 'none';

    let deleteButtonHTML = missionNumber === 1 ? '' : 
        `<button class="delete-mission-button" type="button" onclick="deleteMission(${missionNumber})">ลบเป้าหมายนี้</button>`;

    // Create dropdown for mission titles
    let titleDropdownHTML = `<select id="missiontitle${missionNumber}" class="mission-title-dropdown" required>`;
    titleOptions.forEach(option => {
        titleDropdownHTML += `<option value="${option}">${option}</option>`;
    });
    titleDropdownHTML += `</select>`;

    // Add date and time input for mission deadline
    let deadlineInputHTML = `
        <input type="datetime-local" id="missionDeadline ${missionNumber}" class="mission-deadline-input" required>
    `;

    missionInputGroup.innerHTML = `
        <label class="input-group-title">เป้าหมายที่ ${missionNumber}</label>
        ${titleDropdownHTML}
        <textarea id="missiondes${missionNumber}" placeholder="คำอธิบายเป้าหมาย" required></textarea>
        <label for="missionDeadline${missionNumber}">กำหนดเวลาสำหรับเป้าหมายนี้: (ไม่บังคับ)</label>
        ${deadlineInputHTML}
        ${deleteButtonHTML}
    `;

    // Update the maximum deadline date when the end date changes
    const endDateInput = document.getElementById('endDateInput');
    endDateInput.addEventListener('change', function() {
        const maxDeadlineDate = endDateInput.value;
        document.getElementById(`missionDeadline${missionNumber}`).max = maxDeadlineDate;
    });

    return missionInputGroup;
}


function addMission() {
    missionCount++;
    const missionsContainer = document.getElementById('missionsContainer');
    const newMission = createMissionInputGroup(missionCount);

    // Set the initial state for the new mission
    newMission.style.transform = 'translateX(100%)'; // Start offscreen to the right
    missionsContainer.appendChild(newMission);

    // Slide in the new mission
    setTimeout(() => {
        switchMission(missionCount, true); // Slide in the new mission
    }, 100); // Small delay for DOM update
}

function deleteMission(missionNumber) {
    const missionToDelete = document.getElementById(`missionGroup${missionNumber}`);
    if (missionToDelete) {
        missionToDelete.remove();
        missionCount--;
        updateMissionNumbers();
        switchToPreviousMission(missionNumber);
    }
}

function switchToPreviousMission(deletedMissionNumber) {
    if (deletedMissionNumber === currentMissionIndex && currentMissionIndex > missionCount) {
        currentMissionIndex = missionCount;
    } else if (deletedMissionNumber < currentMissionIndex) {
        currentMissionIndex--;
    }
    switchMission(currentMissionIndex);
}

function updateMissionNumbers() {
    const missionsContainer = document.getElementById('missionsContainer');
    let missionIndex = 1;
    Array.from(missionsContainer.children).forEach(missionGroup => {
        missionGroup.id = `missionGroup${missionIndex}`;
        missionGroup.querySelector('.input-group-title').innerText = `เป้าหมายที่ ${missionIndex}`;
        missionGroup.querySelector('input').id = `missiontitle${missionIndex}`;
        missionGroup.querySelector('textarea').id = `missiondes${missionIndex}`;

        const deleteButton = missionGroup.querySelector('button');
        if (deleteButton) {
            deleteButton.setAttribute('onclick', `deleteMission(${missionIndex})`);
        }
        
        missionIndex++;
    });
}

function updateNavigationButtons() {
    const leftButton = document.getElementById('navigateLeft');
    const rightButton = document.getElementById('navigateRight');

    // Hide left button on the first mission
    leftButton.style.display = currentMissionIndex > 1 ? 'block' : 'none';

    // Hide right button if there's only one mission or on the last mission
    rightButton.style.display = (missionCount > 1 && currentMissionIndex < missionCount) ? 'block' : 'none';
}

function switchMission(missionNumber, direction) {
    for (let i = 1; i <= missionCount; i++) {
        const mission = document.getElementById(`missionGroup${i}`);
        if (mission) {
            if (i === missionNumber) {
                mission.style.display = 'block';
                mission.style.opacity = 1;
                mission.style.transform = 'translateX(0)';
            } else {
                mission.style.opacity = 0;
                mission.style.transform = direction === 'left' ? 'translateX(100%)' : 'translateX(-100%)';
                setTimeout(() => { mission.style.display = 'none'; }, 500); // Hide after animation
            }
        }
    }
    currentMissionIndex = missionNumber;
    updateNavigationButtons();
}

function navigateMission(direction) {
    if (direction === 'left' && currentMissionIndex > 1) {
        switchMission(currentMissionIndex - 1, 'left');
    } else if (direction === 'right' && currentMissionIndex < missionCount) {
        switchMission(currentMissionIndex + 1, 'right');
    }
}


function setInitialDates() {
    const today = new Date();
    const formattedToday = today.toLocaleDateString('en-CA');

    const startDateInput = document.getElementById('startDateInput');
    startDateInput.value = formattedToday;
    startDateInput.readOnly = true;

    updateEndDateInput();
}

function updateEndDateInput() {
    const startDateInput = document.getElementById('startDateInput');
    const endDateInput = document.getElementById('endDateInput');
    
    const startDate = new Date(startDateInput.value);
    
    // Setting the minimum end date (the day after the start date)
    const minEndDate = new Date(startDate);
    minEndDate.setDate(minEndDate.getDate() + 1);
    endDateInput.min = minEndDate.toISOString().split('T')[0];

    // Setting the maximum end date (one month after the start date)
    const maxEndDate = new Date(startDate);
    maxEndDate.setMonth(maxEndDate.getMonth() + 1);
    maxEndDate.setDate(maxEndDate.getDate() - 1); // Set one day before a month to ensure it's within a month
    endDateInput.max = maxEndDate.toISOString().split('T')[0];
}
document.getElementById('startDateInput').addEventListener('change', updateEndDateInput);
window.onload = setInitialDates;

async function getLatestSession(userId) {
    try {
        const response = await fetch(`/checkLatestSession?userId=${userId}`);
        if (!response.ok) {
            throw new Error('Session not found or an error occurred.');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

function formatDate(date) {
    return date.toISOString().split('T')[0]; // Format date as 'yyyy-mm-dd'
}

window.onload = async function(req) {
    const params = new URLSearchParams(window.location.search);
    userId = params.get('userId');  // Obtain userId from query parameter
    console.log("wtf is the userId", userId)
    initializeFlatpickr();


    //const params = new URLSearchParams(window.location.search);
   // userId = params.get('userId'); 
    //const userId = 4; // Replace with actual user ID
    await checkAndDisplaySession(userId);

    // Now set the href for the "View Your Current Progress" link
    const viewProgressLink = document.getElementById('viewProgressLink');
    if (userId && viewProgressLink) {
        viewProgressLink.href = `/progress?userId=${userId}`;
    }

    const viewOngoingProgressLink = document.getElementById('viewOngoingProgressLink');
    if (userId && viewOngoingProgressLink) {
        viewOngoingProgressLink.href = `/progress?userId=${userId}`;
    }
};

async function checkAndDisplaySession(userId) {
    const latestSessionData = await getLatestSession(userId);
    const missionForm = document.getElementById('missionForm');
    const ongoingSessionMessage = document.getElementById('ongoingSessionMessage');

    if (latestSessionData && !latestSessionData.Complete) {
        ongoingSessionMessage.style.display = 'block';
        missionForm.style.display = 'none';
        setupDeleteSessionButton(userId);
    } else {
        ongoingSessionMessage.style.display = 'none';
        missionForm.style.display = 'block';
        setInitialDates();
    }
}

function setupDeleteSessionButton(userId) {
    const deleteSessionButton = document.getElementById('deleteSessionButton');
    const customConfirm = document.getElementById('customConfirm'); // Custom confirm dialog
    const confirmNo = document.getElementById('confirmNo'); // No button
    const confirmYes = document.getElementById('confirmYes'); // Yes button

    if (deleteSessionButton) {
        deleteSessionButton.addEventListener('click', function() {
            // Display the custom confirmation dialog
            customConfirm.style.display = 'block';
        });

        confirmNo.addEventListener('click', function() {
            // Hide the custom confirmation dialog on "No"
            customConfirm.style.display = 'none';
            console.log('Session deletion cancelled.');
        });

        confirmYes.addEventListener('click', async function() {
            // Perform delete action on "Yes"
            try {
                const response = await fetch(`/deleteCurrentSession?userId=${userId}`, { method: 'DELETE' });
                if (response.ok) {
                    console.log('Session deleted successfully');
                    // Hide ongoing session message and show form
                    document.getElementById('ongoingSessionMessage').style.display = 'none';
                    document.getElementById('missionForm').style.display = 'block';
                    setInitialDates();
                } else {
                    throw new Error('Failed to delete session');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                // Hide the custom confirmation dialog
                customConfirm.style.display = 'none';
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', function(req) {
    const form = document.getElementById('dataForm');

    const addMissionButton = document.getElementById('addMissionButton');
    addMissionButton.addEventListener('click', addMission);

    // Initially add the first mission
    addMission();
    updateNavigationButtons();

    form.onsubmit = async function(e) {
        e.preventDefault();

        let allMissionsFilled = true;
        for (let i = 1; i <= missionCount; i++) {
            const title = document.getElementById(`missiontitle${i}`).value.trim();
            const description = document.getElementById(`missiondes${i}`).value.trim();
            if (!title || !description) {
                allMissionsFilled = false;
                break;
            }
        }
    
        if (!allMissionsFilled) {
            alert("Please fill in both the title and description for each mission.");
            return;
        }
        
        console.log("check for req", req)
        const startDateInput = document.getElementById('startDateInput').value;
        const endDateInput = document.getElementById('endDateInput').value;
        const today = new Date().toISOString().split('T')[0];
        console.log("startDateInput", startDateInput)
        console.log("endDateInput", endDateInput)
        console.log("today", today)
        console.log("walouch", new Date())

        const currentDateUTC = new Date().toISOString().split('T')[0];
        console.log("Current UTC Date:", currentDateUTC);



        // Combine the date and time for both start and end dates
        const currentTime = new Date().toISOString().split('T')[1]; // Gets current time in ISO format

       
        let startDate = new Date(startDateInput + 'T' + currentTime);
        let endDate = new Date(endDateInput + 'T' + currentTime);
        const inputStartDate = new Date(startDateInput);
        const inputEndDate = new Date(endDateInput);
        
        // Calculate the difference in days
        const timeDiff = inputEndDate - inputStartDate;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        // Create UTC start date
        let startDatee = new Date(currentDateUTC + 'T' + currentTime);
        
        // Create UTC end date by adding the difference in days
        let endDatee = new Date(startDatee.getTime() + daysDiff * (1000 * 60 * 60 * 24));
        
        // Format start and end dates to ISO strings
        const formattedStartDate = startDatee.toISOString().split('T')[0] + 'T' + currentTime;
        const formattedEndDate = endDatee.toISOString().split('T')[0] + 'T' + currentTime;
     

        console.log("formattedStartDate", formattedStartDate)
        console.log("formattedEndDate", formattedEndDate)
        console.log("currentTime", currentTime)

        console.log("today", today)


    
        // Validate that the start date is today and the end date is no earlier than the day after
        if (endDate.getTime() >= startDate.getTime()) {
           
          
           
            console.log("check startdate", formattedStartDate)
            console.log("check enddate", formattedEndDate)


            console.log("what is this what is this", userId)

            const missionData = [];
            for (let i = 1; i <= missionCount; i++) {
                const title = document.getElementById(`missiontitle${i}`).value;
                const description = document.getElementById(`missiondes${i}`).value;
                missionData.push({ title, description });
    }
    
            const data = {
                userId: userId,
                missions: missionData,
                startDate: formattedStartDate,
                missionEndDate: formattedEndDate
            };

    
            try {
                const response = await fetch('/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
    
                const responseData = await response.json();
                if (response.ok) {
                    console.log('Success:', responseData);
                   // const params = new URLSearchParams(window.location.search);
                    //const userId = params.get('userId'); 
                    console.log("check for userId in submit2", userId)

                    window.location.href = `progress?userId=${userId}`; 
                } else {
                    throw new Error(responseData.message || 'Submission failed');
                }

                
            } catch (error) {
                console.log("hehe")
            }
        } else {
            // If dates are invalid, show an alert and stop form submission
            alert("Invalid date selected. Please select a valid date.");
            return;
        }
    };
    
});