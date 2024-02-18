let userId; 
let missionCount = 0;
let currentMissionIndex = 1;
const titleOptions = ["การเรียน", "งาน", "ออกกำลังกาย", "การทำสมาธิ", "ความสัมพันธ์", "การกิน", "การเงิน" ,"การอ่าน", "อื่นๆ"];

const ThaiLocale = {
    weekdays: {
        shorthand: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
        longhand: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
    },
    months: {
        shorthand: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
        longhand: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
    },
    firstDayOfWeek: 1, 
    ordinal: function (nth) {
        return nth;
    },
    rangeSeparator: ' ถึง ',
    weekAbbreviation: 'สัปดาห์',
    scrollTitle: 'เลื่อนเพื่อเพิ่มหรือลด',
    toggleTitle: 'คลิกเพื่อเปลี่ยน',
};


function initializeFlatpickr() {
    // Initialize Flatpickr only for the end date with initial settings
    flatpickr("#endDateInput", {
        dateFormat: "Y-m-d",
        minDate: new Date().fp_incr(1), // Tomorrow
        maxDate: new Date().fp_incr(30), // One month from today
        locale: ThaiLocale,  // Set the locale to Thai
        disable: [
            function(date) {
                // Disable dates outside of the initial valid range
                return date < new Date().fp_incr(1) || date > new Date().fp_incr(30);
            }
        ]
    });
}




function updateMissionDatePickers(e) {
    const endDateValue = e.target.value; // Get the value of the endDateInput
    const startDateValue = document.getElementById('startDateInput').value; // Get the start date value
    const missionDeadlineInputs = document.querySelectorAll('.mission-deadline-input');

    if (endDateValue) {
        // Enable all mission deadline inputs and update their Flatpickr instances
        missionDeadlineInputs.forEach(input => {
            input.disabled = false;
            input.placeholder = ''; // Remove placeholder text

            const missionNumber = input.id.replace('missionDeadline', '');
            // Update Flatpickr instance with new date range
            initializeDeadlinePicker(missionNumber, startDateValue, endDateValue);
        });
    } else {
        // Disable all mission deadline inputs
        missionDeadlineInputs.forEach(input => {
            input.disabled = true;
            input.placeholder = 'โปรดระบุวันที่สิ้นสุดก่อน'; // Placeholder text in Thai
        });
    }
}


function initializeDeadlinePicker(missionNumber, startDate, endDate) {
    console.log("missionNUMBER", missionNumber)
    //console.log("startDate", startDate)
    //console.log("endDate", endDate)
    const lastDate = new Date(endDate);
    let lastDatee = new Date(lastDate.getTime()); 
 

    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();

    //console.log("currentDate", currentDate)
   // console.log("currentHour", currentHour)
   // console.log("currentMinute", currentMinute)

    // Adjust the current hour by one, considering the day rollover
    const adjustedHour = (currentHour + 1) % 24;
    const adjustedStart = new Date(currentDate);
    adjustedStart.setHours(adjustedHour, currentMinute, 0, 0);

    // If the adjusted start time is before the current time, use the current time instead
    const start = adjustedStart < currentDate ? currentDate : adjustedStart;

   // console.log("Adjusted START", start)

    const what = new Date();
   // console.log("what is what", what)
    const currentTimeStringg = what.toTimeString(); // Converts the current time part of the Date object to a string
    const hour = currentTimeStringg.split(":")[0]; // Extracts the hour
    const minute = currentTimeStringg.split(":")[1]; // Extracts the minute

    const formattedEndDate = lastDatee
    .toISOString().split('T')[0] + 'T' + currentTimeStringg.split(":")[0] + ':' + currentTimeStringg.split(":")[1];

    const end = new Date(new Date(endDate).setHours(hour, minute, 0, 0));
    //console.log("END", end)
    const endOverlay = new Date(formattedEndDate)

    flatpickr(`#missionDeadline${missionNumber}`, {
        dateFormat: "Y-m-d",
        minDate: start, // Now correctly adjusted to be at least 1 hour ahead or the current time
        maxDate: new Date(formattedEndDate), 
        locale: ThaiLocale,
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length > 0) {
                // Using the already computed start and end times from the initializeDeadlinePicker scope
                showOverlay(missionNumber, adjustedHour, currentMinute, hour, minute, start, formattedEndDate, selectedDates);
            }
            
        },
        disable: [
            function(date) {
                // Now unnecessary since minDate and maxDate should handle this
                return false; // Simplified as the minDate and maxDate constraints are now correctly set
            }
        ]
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

    // Adjust the creation of mission deadline input to ensure it doesn't get replaced improperly
    let missionDeadlineInputHTML = `
        <label for="missionDeadline${missionNumber}">กำหนดเวลาสำหรับเป้าหมายนี้: (ไม่บังคับ)</label>
        <input type="text" id="missionDeadline${missionNumber}" class="mission-deadline-input" 
        placeholder="โปรดระบุวันที่สิ้นสุดก่อน" disabled>`;

    missionInputGroup.innerHTML = `
        <label class="input-group-title">เป้าหมายที่ ${missionNumber}</label>
        ${titleDropdownHTML}
        <textarea id="missiondes${missionNumber}" placeholder="คำอธิบายเป้าหมาย" required></textarea>
        ${missionDeadlineInputHTML}
        ${deleteButtonHTML}
    `;

    // Append the new mission input group to the container
    const missionsContainer = document.getElementById('missionsContainer');
    missionsContainer.appendChild(missionInputGroup);

    // Check if the endDateInput has a value and enable the mission deadline input accordingly
    const endDateValue = document.getElementById('endDateInput').value;
    if (endDateValue) {
        const startDateValue = document.getElementById('startDateInput').value;
        const missionDeadlineInput = document.getElementById(`missionDeadline${missionNumber}`);
        missionDeadlineInput.disabled = false; // Enable the input
        missionDeadlineInput.placeholder = ''; // Clear the placeholder
      
        // Initialize Flatpickr with the correct dates
        initializeDeadlinePicker(missionNumber, startDateValue, endDateValue);
    }

    // Return the new mission input group element
    return missionInputGroup;
};

function formatDate(date) {
    if (!(date instanceof Date)) {
        console.error('formatDate: Provided value is not a Date object', date);
        return null;
    }
    return date.toISOString().split('T')[0];
}
function updateSelectedDateDisplay(selectedDate) {
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    selectedDateDisplay.textContent = selectedDate.toLocaleDateString('en-US', options);
}
function populateTimeLists(startHour, endHour, startMinute, endMinute, startDate, endDate, selectedDateArray) {
    const selectedDate = selectedDateArray[0]; // Assuming selectedDateArray holds Date objects
    const selectedHour = selectedDate.getHours(); // Extract the hour from the selected date
    const selectedMinute = selectedDate.getMinutes(); // Extract the minute from the selected date

    // Prepare to populate the hour and minute lists
    const hourList = document.getElementById('hourPicker').querySelector('ul');
    const minuteList = document.getElementById('minutePicker').querySelector('ul');

    // Clear previous list items
    hourList.innerHTML = '';
    minuteList.innerHTML = '';

    // Check if the selected date is the start or end date
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(new Date(endDate));
    const selectedDateStr = formatDate(selectedDate);
    const isStartDate = selectedDateStr === startDateStr;
    const isEndDate = selectedDateStr === endDateStr;

    // Adjust the start and end hours and minutes based on the selected date
    const currentStartHour = isStartDate ? startHour : 0;
    const currentEndHour = isEndDate ? endHour : 23;
    const currentStartMinute = (isStartDate && selectedHour === startHour) ? startMinute : 0;
    const currentEndMinute = (isEndDate && selectedHour === endHour) ? endMinute : 59;

    // Populate hours
    for (let i = currentStartHour; i <= currentEndHour; i++) {
        let li = document.createElement('li');
        li.textContent = i < 10 ? '0' + i : i;
        hourList.appendChild(li);
    }

    // Populate minutes
    for (let i = currentStartMinute; i <= currentEndMinute; i++) {
        let li = document.createElement('li');
        li.textContent = i < 10 ? '0' + i : i;
        minuteList.appendChild(li);
    }

    // Update the display for the selected date
    updateSelectedDateDisplay(selectedDate); // Update the displayed date in the overlay

    // Scroll to the selected hour and minute if necessary
    // ... (existing scrolling code) ...
}


function showOverlay(missionNumber, startHour, startMinute, endHour, endMinute, startDate, endDate, selected) {
    const overlay = document.getElementById('overlay');
    updateSelectedDateDisplay(selected[0]);

    if (overlay) {
        overlay.style.display = 'flex'; // This will make the overlay and its content visible
        populateTimeLists(startHour, endHour, startMinute, endMinute, startDate, endDate, selected); // Populate the time selection lists
    }
}

function hideOverlay() {
    document.getElementById('overlay').style.display = 'none';
}

// Event listener for closing the overlay
document.getElementById('closeOverlay').addEventListener('click', hideOverlay);



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

       
      
        const inputStartDate = new Date(startDateInput);
        const inputEndDate = new Date(endDateInput);

        alert("inputStartDate" + inputStartDate)
        alert("inputEndDate" + inputEndDate)



        
        // Calculate the difference in days
        const timeDiff = inputEndDate - inputStartDate;

        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

        alert("timeDiff" + timeDiff)
        alert("daysDiff" + daysDiff)



        
        // Create UTC start date
        let startDatee = new Date(currentDateUTC + 'T' + currentTime);

        // Create UTC end date by adding the difference in days
        let endDatee = new Date(startDatee.getTime() + daysDiff * (1000 * 60 * 60 * 24));

        alert("startDatee" + startDatee)
        alert("endDatee" + endDatee)


        const formattedStartDate = startDatee.toISOString().split('T')[0] + 'T' + currentTime;
       
        alert("formattedStartDate" + formattedStartDate)

        const formattedEndDate = endDatee.toISOString().split('T')[0] + 'T' + currentTime;
        alert("formattedEndDate" + formattedEndDate)


     

        console.log("formattedStartDate", formattedStartDate)
        console.log("formattedEndDate", formattedEndDate)
        console.log("currentTime", currentTime)

        console.log("today", today)


    
        // Validate that the start date is today and the end date is no earlier than the day after
           
        
            console.log("check startdate", formattedStartDate)
            console.log("check enddate", formattedEndDate)


            console.log("what is this what is this", userId)

            const missionData = [];
            for (let i = 1; i <= missionCount; i++) {
                const title = document.getElementById(`missiontitle${i}`).value;
                const description = document.getElementById(`missiondes${i}`).value;
                
                // Get the due date and time from the input
                // Assuming duedateInput is in the format "YYYY-MM-DDTHH:MM" (ISO local date-time format)
                const duedateInput = document.getElementById(`missionDeadline${i}`).value;
                console.log("this is the duedate before save", duedateInput);
            
                // Create a Date object from the input string
                let duedateUTC = null;

                // Check if duedateInput is not null and not an empty string
                if (duedateInput) {
                    // Create a Date object from the input string
                    let duedateLocal = new Date(duedateInput);
                    
                    // Convert the local Date object to a UTC string
                    duedateUTC = duedateLocal.toISOString();
                    
                    console.log("this is the duedate after conversion to UTC", duedateUTC);
                }
            
                console.log("this is the duedate after conversion to UTC", duedateUTC);
            
                // Push the data with the UTC date and time
                missionData.push({ title, description, duedate: duedateUTC });
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
      
    };
    
});