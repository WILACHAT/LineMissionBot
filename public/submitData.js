function validateDate() {
    const startDateInput = document.getElementById('startDateInput');
    const endDateInput = document.getElementById('endDateInput');
    
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignore the time part

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedTomorrow = formatDate(tomorrow); 

    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    console.log("endDate", endDate)
    console.log("tomorrow", tomorrow)
    console.log("oneMonthLater", oneMonthLater)



    // Check if the end date is within the valid range (tomorrow to one month from today)
    if (endDate < tomorrow || endDate > oneMonthLater) {
        return false;
    }

    return true; // If both dates are valid
}
function setInitialDates() {
   
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Set 'tomorrow' to the next day
    
    // Format the dates to 'YYYY-MM-DD'
    const formattedToday = formatDate(today);
    const formattedTomorrow = formatDate(tomorrow);
    
    // Set 'startDateInput' to only allow today's date to be selected
    document.getElementById('startDateInput').setAttribute('min', formattedToday);
    document.getElementById('startDateInput').setAttribute('max', formattedToday);
    document.getElementById('startDateInput').setAttribute('value', formattedToday);
    
    // Set 'endDateInput' to not allow today's date to be selected
    document.getElementById('endDateInput').setAttribute('min', formattedTomorrow);
    
    // Set a maximum date for 'endDateInput' if needed, for example one month from today
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    const formattedOneMonthLater = formatDate(oneMonthLater);
    document.getElementById('endDateInput').setAttribute('max', formattedOneMonthLater);    
    
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

window.onload = async function() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId'); 
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

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('dataForm');
    form.onsubmit = async function(e) {
        e.preventDefault();
        if (validateDate()) {

        console.log("what is this 2", document.getElementById('endDateInput').value)

        console.log("what is this", document.getElementById('startDateInput').value)


        // Current Date and Time for Start Date
        const now = new Date();
        const startDate = now.toISOString();


        // User-selected Date, Current Time for End Date
        const selectedEndDate = document.getElementById('endDateInput').value; // YYYY-MM-DD format
        const endDate = new Date(selectedEndDate);
        endDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
        const formattedEndDate = endDate.toISOString();
        console.log("what is this 3", startDate)
        console.log("what is this 4", formattedEndDate)
        const params = new URLSearchParams(window.location.search);
        const userId = params.get('userId'); 
            //const userId = 4; // Replace with actual user ID


        // Validate that the end date is after the start date
        if (endDate <= now) {
            console.error('Error: End date must be after the current date and time.');
            return;
        }

        // Assuming `userId` is available in your session or similar

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
            startDate: startDate,
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
                const params = new URLSearchParams(window.location.search);
                const userId = params.get('userId'); 
                window.location.href = `progress?userId=${userId}`; 
            } else {
                throw new Error(responseData.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    else
    {
        alert("Invalid date selected. Please select a valid date.");

    }
}
});
