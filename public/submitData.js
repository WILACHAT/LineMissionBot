let userId; 

function setInitialDates() {
    const today = new Date();
    const formattedToday = today.toLocaleDateString('en-CA'); // 'YYYY-MM-DD' format

    // Create a 'tomorrow' date based on today and format it
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedTomorrow = tomorrow.toLocaleDateString('en-CA');

    // Set the startDateInput to today's date and make it read-only
    const startDateInput = document.getElementById('startDateInput');
    startDateInput.value = formattedToday;
    startDateInput.readOnly = true;

    // Set the endDateInput to allow dates from tomorrow onwards
    const endDateInput = document.getElementById('endDateInput');
    endDateInput.setAttribute('min', formattedTomorrow);
}

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
    //const params = new URLSearchParams(window.location.search);
   // userId = params.get('userId'); 
    //const userId = 4; // Replace with actual user ID
    await checkAndDisplaySession(userId);

    // Now set the href for the "View Your Current Progress" link
    const viewProgressLink = document.getElementById('viewProgressLink');
    if (userId && viewProgressLink) {
        viewProgressLink.href = `/progress?userId=${userId}`;
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
    if (deleteSessionButton) {
        deleteSessionButton.addEventListener('click', async function() {
            // Confirmation dialog
            const confirmDelete = confirm("Are you sure you want to delete your current mission? It will not be saved in history.");
            
            if (confirmDelete) {
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
                }
            } else {
                console.log('Session deletion cancelled.');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function(req) {
    const form = document.getElementById('dataForm');

    form.onsubmit = async function(e) {
        e.preventDefault();
        console.log("check for req", req)
        const startDateInput = document.getElementById('startDateInput').value;
        const endDateInput = document.getElementById('endDateInput').value;
        const today = new Date().toISOString().split('T')[0];


        // Combine the date and time for both start and end dates
       
        let startDate = new Date(startDateInput + 'T' + currentTime);
        let endDate = new Date(endDateInput + 'T' + currentTime);

        // Convert to UTC
        let utcStartDate = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000));
        let utcEndDate = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000));

        const formattedStartDate = utcStartDate.toISOString();
        const formattedEndDate = utcEndDate.toISOString();
        const currentTime = new Date().toISOString().split('T')[1]; // Gets current time in ISO format

        // Combine the date and time for start date (in UTC)
     
        console.log("formattedStartDate", formattedStartDate)
        console.log("formattedEndDate", formattedEndDate)
        console.log("currentTime", currentTime)

        console.log("today", today)



    
        // Validate that the start date is today and the end date is no earlier than the day after
        if (endDate.getTime() > startDate.getTime()) {
           
          
           
            console.log("check startdate", formattedStartDate)
            console.log("check enddate", formattedEndDate)


       
    
            // Assuming `userId` is available in your session or similar
            console.log("what is this what is this", userId)
    
            const data = {
                userId: userId,
                missiontitle1: document.getElementById('missiontitle1').value,
                missiontitle2: document.getElementById('missiontitle2').value,
                missiontitle3: document.getElementById('missiontitle3').value,
                missiontitle4: document.getElementById('missiontitle4').value,
                missiontitle5: document.getElementById('missiontitle5').value,
                missiondes1: document.getElementById('missiondes1').value,
                missiondes2: document.getElementById('missiondes2').value,
                missiondes3: document.getElementById('missiondes3').value,
                missiondes4: document.getElementById('missiondes4').value,
                missiondes5: document.getElementById('missiondes5').value,
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