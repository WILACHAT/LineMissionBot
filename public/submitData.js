window.onload = function() {
    var today = new Date();
    var endDate = new Date();
    endDate.setDate(today.getDate() + 7); // Add 7 days to today

    var options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };

    var formattedToday = today.toLocaleDateString(undefined, options) 
    var formattedEndDate = endDate.toLocaleDateString(undefined, options) + ' ' + endDate.toLocaleTimeString(undefined, options);

    document.getElementById('todaysDate').textContent = formattedToday;
    document.getElementById('missionEndDate').textContent = formattedEndDate;
};


document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('dataForm');
    form.onsubmit = function(e) {
        console.log("submitteddddd")
        e.preventDefault();
        var today = new Date();
        var endDate = new Date();
        endDate.setDate(today.getDate() + 7);

        // Get values from form
        const data = {
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
            todaysDate: today,
            missionEndDate: endDate,


        };

        // Send data to the server at the root endpoint '/'
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
    
        .then(response => response.json()) // Convert the response to JSON
        .then(data => {
            console.log('Success:', data);
            // Handle success
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle errors
        });
        
    };
});