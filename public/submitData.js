function setInitialDates() {
   // const today = new Date();

    // Allow past dates for testing
  //  document.getElementById('startDateInput').setAttribute('min', formatDate(today));
   // document.getElementById('endDateInput').setAttribute('min', formatDate(today));

    // Optional: Set a maximum date if needed
    // const oneYearLater = new Date(today);
    // oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    // document.getElementById('endDateInput').setAttribute('max', formatDate(oneYearLater));
}

window.onload = function() {
    setInitialDates();
};

function formatDate(date) {
    return date.toISOString().split('T')[0]; // Format date as 'yyyy-mm-dd'
}


document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('dataForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        console.log("submiteddddddddddd")


        const startDate = document.getElementById('startDateInput').value;
        const endDate = document.getElementById('endDateInput').value;

        // Validation if needed
        if (new Date(startDate) >= new Date(endDate)) {
            console.error('Error: End date must be after start date.');
            return;
        }

        // Assuming `userId` is available in your session or similar
        //const userId = req.session.userId;
        const userId = 4;


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

        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };
});


