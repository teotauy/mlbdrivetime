// Set this to your actual backend endpoint!
const BACKEND_URL = "https://your-backend-url/api/calculate"; // CHANGE THIS

const GREEN_THRESHOLD_MINUTES_BEFORE_PITCH = 60; // Arrive 1 hour or more before first pitch
const YELLOW_THRESHOLD_MINUTES_BEFORE_PITCH = 0;  // Arrive between 59 minutes before and exactly at first pitch

const startLocationInput = document.getElementById('startLocation');
const calculateBtn = document.getElementById('calculateBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const stadiumGrid = document.getElementById('stadiumGrid');

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function formatDate(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
function renderStadiumCards(stadiumsData) {
    stadiumGrid.innerHTML = '';
    stadiumsData.forEach(stadium => {
        const card = document.createElement('div');
        card.className = 'stadium-card relative';
        card.dataset.stadiumId = stadium.id;

        let colorClass = 'bg-gray-400';
        let driveTimeDisplay = 'N/A';
        let gameDetails = 'Next Home Game: Loading...';

        if (stadium.driveDurationMinutes !== undefined && stadium.nextHomeGameFirstPitchTime) {
            const currentTime = new Date();
            const firstPitchTime = new Date(stadium.nextHomeGameFirstPitchTime);
            const arrivalTime = new Date(currentTime.getTime() + stadium.driveDurationMinutes * 60 * 1000);
            const minutesDifference = (firstPitchTime.getTime() - arrivalTime.getTime()) / (1000 * 60);

            if (minutesDifference >= GREEN_THRESHOLD_MINUTES_BEFORE_PITCH) {
                colorClass = 'status-green';
            } else if (minutesDifference >= YELLOW_THRESHOLD_MINUTES_BEFORE_PITCH) {
                colorClass = 'status-yellow';
            } else {
                colorClass = 'status-red';
            }

            driveTimeDisplay = `${Math.round(stadium.driveDurationMinutes)} min`;
            if (stadium.driveDurationMinutes >= 60) {
                driveTimeDisplay = `${(stadium.driveDurationMinutes / 60).toFixed(1)} hrs`;
            }

            gameDetails = `
                <p class="font-semibold">${stadium.team} vs. ${stadium.nextHomeGameOpponent}</p>
                <p>${formatDate(firstPitchTime)} - ${formatTime(firstPitchTime)}</p>
                <p class="mt-2 text-xs text-gray-400">Est. Arrival: ${formatTime(arrivalTime)}</p>
            `;
        }

        card.innerHTML = `
            <div class="status-indicator ${colorClass}"></div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1 flex items-center justify-center">
                <span class="baseball-icon">⚾</span> ${stadium.name}
            </h3>
            <p class="text-sm text-gray-600">${stadium.team}</p>
            <p class="text-xs text-gray-500 mb-2">${stadium.address}</p>
            <p class="text-md font-bold text-gray-700 mt-2" data-drive-time>${driveTimeDisplay}</p>
            <div class="mt-2">${gameDetails}</div>
        `;
        stadiumGrid.appendChild(card);
    });
}

calculateBtn.addEventListener('click', async () => {
    const startLocation = startLocationInput.value.trim();
    if (!startLocation) {
        alert('Please enter your starting address or ZIP!');
        return;
    }
    loadingIndicator.classList.remove('hidden');
    calculateBtn.disabled = true;

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startLocation })
        });
        const stadiums = await response.json();
        renderStadiumCards(stadiums);
    } catch (err) {
        alert('Error fetching drive times. Please try again.');
    }

    loadingIndicator.classList.add('hidden');
    calculateBtn.disabled = false;
});