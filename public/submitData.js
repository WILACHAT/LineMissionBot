function setInitialDates() {
    const today = new Date();
    document.getElementById('startDateInput').setAttribute('min', formatDate(today));
    document.getElementById('endDateInput').setAttribute('min', formatDate(today));

    // Optional: Set a maximum date if needed
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    document.getElementById('endDateInput').setAttribute('max', formatDate(oneMonthLater));
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
    //const userId = req.session.userId;
    const userId = 4; // Replace with actual user ID
    await checkAndDisplaySession(userId);

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
        console.log("Form Submitted");

        const startDate = document.getElementById('startDateInput').value;
        const endDate = document.getElementById('endDateInput').value;

        if (new Date(startDate) >= new Date(endDate)) {
            console.error('Error: End date must be after start date.');
            return;
        }

        const userId = 4; // Assuming `userId` is available in your session or similar

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
            missionEndDate: endDate
        };

        try {
            const response = await fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();
            if (response.ok) {
                console.log('Success:', responseData);
                window.location.href = '/progress'; // Redirect to progress page
            } else {
                throw new Error(responseData.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
});
