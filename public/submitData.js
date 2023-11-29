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
    var formattedEndDate = endDate.toLocaleDateString(undefined, options) 

    document.getElementById('todaysDate').textContent = formattedToday;
    document.getElementById('missionEndDate').textContent = formattedEndDate;
};


document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('dataForm');
    form.onsubmit = function(e) {
        console.log("submitteddddd")
        e.preventDefault();

        // Get values from form
        const data = {
            input1: document.getElementById('input1').value,
            input2: document.getElementById('input2').value,
            input3: document.getElementById('input3').value,
            input4: document.getElementById('input4').value,
            input5: document.getElementById('input5').value,
        };

        // Send data to the server at the root endpoint '/'
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            console.log('Response received:', response); // Debugging line
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
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