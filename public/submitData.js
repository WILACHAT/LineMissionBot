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
    const now = new Date();
    const minDatee = new Date(now.getTime() + (60 * 60 * 1000));
    // Initialize Flatpickr
    flatpickr("#endDateInput", {
        enableTime: true, // Enable time picker
        dateFormat: "Y-m-d H:i", // Include time in the date format
        defaultDate: now, // Set default date and time to the current time
        minDate: new Date(now.getTime() + (60 * 60 * 1000)), // Set minimum date and time to +1 hour from now
        maxDate: new Date().fp_incr(30), // Maximum date one month from today
        locale: ThaiLocale, // Set the locale to Thai
        time_24hr: true, // Use 24-hour format for time picker

        disable: [
            function(date) {
                // Disable dates outside of the initial valid range
                return date > new Date().fp_incr(30);
            }
        ],
        onOpen: function(selectedDates, dateStr, instance) {
            document.getElementById("timeFormatMessage").style.display = 'block';
        },
        onClose: function(selectedDates, dateStr, instance) {
            document.getElementById("timeFormatMessage").style.display = 'none';
        },
       
        
    });
};



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

    // Add the new dropdown for number of times in this session
    let timesDropdownHTML = `<label for="missiontimes${missionNumber}">จำนวนครั้งในเซสชันนี้:</label>
                              <select id="missiontimes${missionNumber}" class="mission-times-dropdown" required>`;
    for (let i = 1; i <= 10; i++) {
        timesDropdownHTML += `<option value="${i}">${i}</option>`;
    }
    timesDropdownHTML += `</select>`;

    let additionalOptionsContainer = `<div id="additionalOptionsContainer${missionNumber}" style="display:none;"></div>`;

    missionInputGroup.innerHTML = `
        <label class="input-group-title">เป้าหมายที่ ${missionNumber}</label>
        ${titleDropdownHTML}
        <textarea id="missiondes${missionNumber}" placeholder="คำอธิบายเป้าหมาย" maxlength="256" required></textarea>
        ${timesDropdownHTML}
        ${deleteButtonHTML}
    `;

    return missionInputGroup;
};

function onTitleChange(selectElement, missionNumber) {
    console.log("missionnumber fak off", missionNumber)
    const additionalOptionsContainer = document.getElementById(`additionalOptionsContainer${missionNumber}`);
    let optionsHTML = '';

    switch (selectElement.value) {
        case "ออกกำลังกาย": // "Exercise"
            optionsHTML = createExerciseOptions(missionNumber);
            break;
        case "การทำสมาธิ": // "Meditation"
            optionsHTML = createMeditationOptions(missionNumber);
            break;
        // Add more cases for other mission types as needed
        default:
            additionalOptionsContainer.style.display = 'none';
            additionalOptionsContainer.innerHTML = '';
            return; // Exit the function if no additional options are needed
    }

    additionalOptionsContainer.innerHTML = optionsHTML;
    additionalOptionsContainer.style.display = 'block';
}

function createExerciseOptions(missionNumber) {
    let html = `<label for="workoutIntensity${missionNumber}">คุณต้องการออกกำลังกายกี่ครั้งในช่วงเวลานี้?:</label>
                <select id="workoutIntensity${missionNumber}" required>`;
    for (let i = 1; i <= 10; i++) {
        html += `<option value="${i}">${i}</option>`;
    }
    html += `</select>`;
    return html;
}


function createMeditationOptions(missionNumber) {
    // Generate HTML for meditation options
    // This is just an example, replace it with actual options needed for meditation
    let html = `<label for="meditationDuration${missionNumber}">Meditation Duration:</label>
                <select id="meditationDuration${missionNumber}" required>`;
    // Assuming you want to let users select durations
    ["5 min", "10 min", "15 min", "20 min"].forEach(duration => {
        html += `<option value="${duration}">${duration}</option>`;
    });
    html += `</select>`;
    return html;
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
    console.log("missionsContainer mee rai", missionsContainer)
    let missionIndex = 1;
    Array.from(missionsContainer.children).forEach(missionGroup => {
        console.log("each missionGroup", missionGroup)
        console.log("each missionGroup ID", missionGroup.id)
        console.log("what it the missionIndex", missionIndex)

        missionGroup.id = `missionGroup${missionIndex}`;
        
        missionGroup.querySelector('.input-group-title').innerText = `เป้าหมายที่ ${missionIndex}`;
        missionGroup.querySelector('select').id = `missiontitle${missionIndex}`;
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
    console.log("are you in the setInitialDates")
    const today = new Date();
    const formattedToday = today.toLocaleDateString('en-CA');

    const startDateInput = document.getElementById('startDateInput');
    startDateInput.value = formattedToday;
    startDateInput.readOnly = true;
    //updateEndDateInput();
}


/*
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
*/
//document.getElementById('startDateInput').addEventListener('change', updateEndDateInput);

window.onload = setInitialDates;

function formatDate(date) {
    return date.toISOString().split('T')[0]; // Format date as 'yyyy-mm-dd'
}


window.onload = async function(req) {
    const params = new URLSearchParams(window.location.search);
    userId = params.get('userId');  // Obtain userId from query parameter
    console.log("wtf is the userId", userId)
    const today = new Date();
    const formattedToday = today.toLocaleDateString('en-CA');

    const startDateInput = document.getElementById('startDateInput');
    startDateInput.value = formattedToday;
    startDateInput.readOnly = true;
    
    initializeFlatpickr();


    console.log("startdateinput",document.getElementById('startDateInput').value )

    //const params = new URLSearchParams(window.location.search);
   // userId = params.get('userId'); 
    //const userId = 4; // Replace with actual user ID

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
            // Prevent form submission
            
            // Show the modal
            document.getElementById("customConfirm2").style.display = "block";
            document.getElementById("fuck").addEventListener("click", function() {
                // Hide the modal and allow the user to adjust the form as needed
                document.getElementById("customConfirm2").style.display = "none";
            });
    
            return
        }
 
        console.log("check for req", req)
        const startDateInput = document.getElementById('startDateInput').value;
        const endDateInput = document.getElementById('endDateInput').value;
        const today = new Date().toISOString().split('T')[0];
        console.log("startDateInput", startDateInput)
        console.log("endDateInput", endDateInput)
        //alert("enddateeee")

        console.log("today", today)
        console.log("walouch", new Date())

        const currentDateUTC = new Date().toISOString().split('T')[0];
        console.log("Current UTC Date:", currentDateUTC);

        const [endDate, endTime] = endDateInput.split(' ');
        const [hours, minutes] = endTime.split(':');
        const endDateLocal = new Date(endDate + 'T' + hours + ':' + minutes + ':00');
        const formattedEndDateUTC = endDateLocal.getUTCFullYear() + '-' +
        String(endDateLocal.getUTCMonth() + 1).padStart(2, '0') + '-' + // Months are 0-indexed
        String(endDateLocal.getUTCDate()).padStart(2, '0') + 'T' +
        String(endDateLocal.getUTCHours()).padStart(2, '0') + ':' +
        String(endDateLocal.getUTCMinutes()).padStart(2, '0') + ':' +
        '00'; // Adding '00' for seconds to match the desired format


        // Convert endDate to the desired format, which is already in YYYY-MM-DD format
        // Combine it with the time part to get the full dateTime in ISO format

        // Combine the date and time for both start and end dates
        const currentTime = new Date().toISOString().split('T')[1]; // Gets current time in ISO format

 
        const inputStartDate = new Date(startDateInput);
        const inputEndDate = new Date(endDateInput);
        const inputEndDatee = new Date(endDate);


        //alert("inputStartDate" + inputStartDate)
       //alert("inputEndDate" + inputEndDate)

        // Calculate the difference in days
        const timeDiff = inputEndDate - inputStartDate;

        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

        let startDatee = new Date(currentDateUTC + 'T' + currentTime);

        // Create UTC end date by adding the difference in days
        let endDatee = new Date(startDatee.getTime() + daysDiff * (1000 * 60 * 60 * 24));

        const formattedStartDate = startDatee.toISOString().split('T')[0] + 'T' + currentTime;
        console.log("formatted starttime", formattedStartDate)
       
       // alert("formattedStartDate" + formattedStartDate)

        const formattedEndDate = endDatee.toISOString().split('T')[0] + 'T' + currentTime;
        const formattedEndDatee = inputEndDatee.toISOString() + 'T' + endTime + ':00'; 
        
       // const formattedEndDatee = inputEndDate.toISOString().split('T')[0] + 'T' + currentTime;
        console.log("first format enddate", formattedEndDate)
        console.log("second format enddate", formattedEndDateUTC)
       // alert("formattedEndDate" + formattedEndDate)
        console.log("formattedStartDate", formattedStartDate)
        console.log("formattedEndDate", formattedEndDate)
        console.log("currentTime", currentTime)

        console.log("today", today)
        
            console.log("check startdate", formattedStartDate)
            console.log("check enddate", formattedEndDate)


            console.log("what is this what is this", userId)
            const additionalInputsMap = {
                "ออกกำลังกาย": ["workoutIntensity"], // For "Exercise"
                "การทำสมาธิ": ["meditationDuration"], // For "Meditation"
                // Add more as necessary
            };

            const missionData = [];
            const missionsContainer = document.getElementById('missionsContainer');
            const missionElements = missionsContainer.children;
            const times = 1;
            for (let i = 0; i < missionElements.length; i++) {
                
                const title = document.getElementById(`missiontitle${i + 1}`).value;

                const description = document.getElementById(`missiondes${i + 1}`).value;

                const timesElement = document.getElementById(`missiontimes${i + 1}`);

                // Declare 'times' variable; default it to 1 (or any default value you see fit)
                let times = 1;
                
                // Check if the element exists and its value is not empty
                if (timesElement && timesElement.value !== "") {
                    times = timesElement.value; // Use the element's value if it's available
                } 
                let additionalData = {};
                if (additionalInputsMap[title]) {
                    console.log("additionalInputsMap[title]", additionalInputsMap[title])
                    // Loop through each additional input ID associated with this title
                    additionalInputsMap[title].forEach(inputId => {
                        // Construct the full input ID with the current mission number
                        const fullInputId = `${inputId}${i}`;
                        console.log("inside the fullInputId", fullInputId)

                        const inputElement = document.getElementById(fullInputId);
                        const inputElementt = document.getElementById('workoutIntensity1');

                        console.log("inside the inputElement", inputElement)
                        console.log("inside the inputElement2", inputElementt)

                        // If the element exists, add its value to the additionalData object
                        if (inputElement) {
                            additionalData[inputId] = inputElement.value;
                            console.log("fucking alues", inputElement.value)

                        }
                    });
                }
               // alert("hii", times)
                // Get the due date and time from the input
                // Assuming duedateInput is in the format "YYYY-MM-DDTHH:MM" (ISO local date-time format)
             
                // Push the data with the UTC date and time

                missionData.push({ title, description, additionalData, times: parseInt(times) }); 
                
            }
             console.log("missionData", missionData)
            const sessionName = document.getElementById('sessionNameId').value;


    
            const data = {
                userId: userId,
                missions: missionData,
                startDate: formattedStartDate,
                missionEndDate: formattedEndDateUTC,
                sessionName:sessionName
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