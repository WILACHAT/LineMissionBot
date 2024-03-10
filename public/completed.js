let userId;

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    userId = params.get('userId');

    if (userId) {
        loadCompletedMissions(userId);
    } else {
        console.error('ไม่มีรหัสผู้ใช้งาน.');
    }
});

function loadCompletedMissions(userId) {
    fetch(`/completed/getCompletedMissions?userId=${encodeURIComponent(userId)}`)
        .then(response => response.json())
        .then(data => {
            displayMissions(data.missions);
            displayCompletionStatus(data.missions);
        })
        .catch(error => console.error('เกิดข้อผิดพลาดในการโหลดภารกิจที่เสร็จสิ้น:', error));
}

function displayMissions(missions) {
    const missionsContainer = document.getElementById('missions-container');
    missionsContainer.innerHTML = '';

    missions.forEach(mission => {
        const missionDiv = document.createElement('div');
        missionDiv.classList.add('mission');

        const statusText = mission.Complete ? 'เสร็จสิ้น' : 'ยังไม่เสร็จสิ้น';
        const statusClass = mission.Complete ? 'status-completed' : 'status-not-completed';

        missionDiv.innerHTML = `
            <h2 class="mission-title">${mission.Title}</h2>
            <p class="mission-description">${mission.Description}</p>
            <div class="${statusClass}">สถานะ: ${statusText}</div>
        `;
        missionsContainer.appendChild(missionDiv);
    });
}

 
function displayCompletionStatus(missions) {
    const totalMissions = missions.length;
    const completedMissions = missions.filter(m => m.Complete).length;
    const completionPercentage = (completedMissions / totalMissions) * 100;
    const completionText = document.createElement('div');
    completionText.innerHTML = `
        <p>คุณได้ทำภารกิจเสร็จสิ้น ${completedMissions}/${totalMissions} ภารกิจ.</p>
        <p>นั่นคือ ${completionPercentage}% ของภารกิจทั้งหมดของคุณ.</p>
    `;

    if(completionPercentage === 100) {
        completionText.innerHTML += '<p>ขอแสดงความยินดี, คุณได้ทำภารกิจทั้งหมดเสร็จสิ้นแล้ว!</p>';
    }

    const missionsContainer = document.getElementById('missions-container');
    missionsContainer.appendChild(completionText)
}

function submitReflection() {
    const reflectionText = document.getElementById('reflection').value;
    fetch('/completed/submitReflection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, reflection: reflectionText })
    })
    .then(response => {
        if (response.ok) {
            const historyLink = `history.html?userId=${encodeURIComponent(userId)}`;
            window.location.href = historyLink;
        } else {
            throw new Error('การส่งความคิดเห็นล้มเหลว');
        }
    })
    .catch(error => console.error('เกิดข้อผิดพลาดในการส่งความคิดเห็น:', error));
}

function goToIndex() {
    window.location.href = '/'; // กลับไปยังหน้าแรก
}
