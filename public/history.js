const params = new URLSearchParams(window.location.search);
const userId = params.get('userId');

document.addEventListener('DOMContentLoaded', function() {
    if (userId) {
        loadSessionHistory(userId);
    } else {
        console.error('ไม่มีรหัสผู้ใช้ที่ให้มา');
    }
});

function formatDate(dateStr) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('th-TH', options); // Change locale to Thai
}

function loadSessionHistory(userId) {
    fetch(`/history/getSessionHistory/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        displaySessionHistory(data.sessions);
    })
    .catch(error => console.error('เกิดข้อผิดพลาดในการโหลดประวัติการใช้งาน:', error));
}

function displaySessionHistory(sessions) {
    const sessionsContainer = document.getElementById('sessions-container');
    sessionsContainer.innerHTML = '';

    if (sessions.length === 0) {
        const noSessionDiv = document.querySelector('.no-session');
        noSessionDiv.style.display = 'block';
        return;
    }

    sessions.forEach(session => {
        const formattedStartDate = formatDate(session.StartDate);
        const formattedEndDate = formatDate(session.EndDate);

        const sessionDiv = document.createElement('div');
        sessionDiv.classList.add('session');
        
        let sessionHeader;
        if (session.SessionName) {
            // If SessionName exists, center it in an <h2> tag.
            sessionHeader = `<h2 style="text-align: center;">${session.SessionName}</h2>
                             <h3 style="text-align: center;">เริ่ม: ${formattedStartDate}<br>ถึง: ${formattedEndDate}</h3>`;
        } else {
            // If SessionName does not exist, display the date range in an <h2> tag and center it.
            // Each date on a separate line, centered.
            sessionHeader = `<h2 style="text-align: center;">เริ่ม: ${formattedStartDate}<br>ถึง: ${formattedEndDate}</h2>`;
        }

        sessionDiv.innerHTML = `
            <div onclick="toggleSessionDetails(this, ${session.SessionID})">
                ${sessionHeader}
            </div>
            <div class="session-details" style="display: none;">
                <ul class="custom-ul">
                    <!-- ข้อมูลภารกิจจะถูกแทรกที่นี่ -->
                </ul>
                <p>คะแนน: ${session.Rating} / 100</p>
                <p>สะท้อนความคิด: ${session.Reflection || 'ไม่มีการส่งสะท้อนความคิด'}</p>
            </div>
            <hr>
        `;
        sessionsContainer.appendChild(sessionDiv);
    });
}



function toggleSessionDetails(element, sessionId) {
    const detailsDiv = element.nextElementSibling;
    
    if (!detailsDiv.classList.contains('loaded')) {
        loadSessionMissions(sessionId, detailsDiv);
        detailsDiv.classList.add('loaded');
    }

    detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
}

function loadSessionMissions(sessionId, detailsDiv) {
    fetch(`/history/getSessionMissions?sessionId=${sessionId}`)
        .then(response => response.json())
        .then(data => {
            displaySessionMissions(data.missions, detailsDiv);
        })
        .catch(error => console.error('เกิดข้อผิดพลาดในการโหลดภารกิจของช่วงเวลา:', error));
}

function displaySessionMissions(missions, detailsDiv) {
    const missionsList = detailsDiv.querySelector('.custom-ul');
    missionsList.innerHTML = '';

    missions.forEach(mission => {
        const missionItem = document.createElement('li');
        missionItem.classList.add('mission-item');
        
        let missionContentHTML = `
            <div class="mission-content">
                <strong>ภารกิจ:</strong> ${mission.Title}<br>
                <strong>รายละเอียด:</strong> ${mission.Description}<br>
                <strong>สถานะ:</strong> ${mission.Complete ? 'เสร็จสิ้น' : 'ไม่เสร็จสิ้น'}
            </div>
        `;
        
        if (!mission.Complete) {
            missionContentHTML += `<img src="https://res.cloudinary.com/linema/image/upload/v1710803287/Meerkatsad_ctaqgf.png" class="not-completed-img" alt="ไม่เสร็จสิ้น">`;
            missionItem.classList.add('session-history-not-completed');
        } else {
            missionItem.classList.add('session-history-completed');
        }

        missionItem.innerHTML = missionContentHTML;
        missionsList.appendChild(missionItem);
    });
}
