// Set this to your actual backend endpoint!
const BACKEND_URL = "/api/calculate"; // Adjust this as needed

const GREEN_THRESHOLD_MINUTES_BEFORE_PITCH = 60; // Arrive 1 hour or more before first pitch
const YELLOW_THRESHOLD_MINUTES_BEFORE_PITCH = 0;  // Arrive between 59 minutes before and exactly at first pitch

const startLocationInput = document.getElementById('startLocation');
const calculateBtn = document.getElementById('calculateBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const stadiumGrid = document.getElementById('stadiumGrid');

// --- Feature 1: Use My Location Button ---
function addUseLocationButton() {
    const btn = document.createElement('button');
    btn.id = "useLocationBtn";
    btn.className = "ml-4 px-4 py-2 bg-blue-700 text-white rounded shadow hover:bg-blue-900 transition";
    btn.textContent = "Use My Location";
    // Insert right after startLocationInput
    startLocationInput.parentNode.appendChild(btn);

    btn.addEventListener('click', async () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        btn.disabled = true;
        btn.textContent = "Locating...";
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            // Use Google Maps Geocoding API to reverse-geocode lat/lng to address (free for dev, but requires API key)
            // For privacy, you may prefer to use the lat,lng directly
            // Example: fill the input with "lat,lng"
            startLocationInput.value = `${latitude},${longitude}`;
            // Optionally, trigger calculation automatically:
            // calculateBtn.click();
            btn.textContent = "Use My Location";
            btn.disabled = false;
        }, (err) => {
            alert("Unable to retrieve your location.");
            btn.textContent = "Use My Location";
            btn.disabled = false;
        });
    });
}

// Call this once on load
addUseLocationButton();

/**
 * Format a JS Date as a time string like "07:05 PM"
 */
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/**
 * Format a JS Date as a string like "Tuesday, July 23"
 */
function formatDate(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/**
 * Format the time remaining until the game as "2d 3h 15m"
 */
function formatCountdown(msLeft) {
    if (msLeft <= 0) return "Game time!";
    const totalSeconds = Math.floor(msLeft / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    let str = "";
    if (days > 0) str += `${days}d `;
    if (hours > 0 || days > 0) str += `${hours}h `;
    str += `${minutes}m`;
    return str;
}

// --- Feature 3: Countdown Timer storage ---
let countdownIntervals = [];

/**
 * Render all stadium cards with logo, color status, drive time, and game info
 * Feature 2: Card is clickable to open Google Maps directions from start location
 * Feature 3: Live countdown timer to next home game
 */
function renderStadiumCards(stadiumsData) {
    // Clear any previous countdown intervals
    countdownIntervals.forEach(clearInterval);
    countdownIntervals = [];

    stadiumGrid.innerHTML = '';
    const userOrigin = startLocationInput.value.trim();

    stadiumsData.forEach((stadium, idx) => {
        const card = document.createElement('div');
        card.className = 'stadium-card relative cursor-pointer hover:shadow-2xl transition-shadow';
        card.dataset.stadiumId = stadium.id;

        let colorClass = 'bg-gray-400';
        let driveTimeDisplay = 'N/A';
        let gameDetails = 'Next Home Game: Loading...';
        let logoPath = `/logos/${stadium.id.toLowerCase()}.svg`;

        let countdownId = `countdown_${stadium.id}_${idx}`;

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

            // Show drive time in hours if over 60 minutes, else in minutes
            if (stadium.driveDurationMinutes >= 60) {
                driveTimeDisplay = `${(stadium.driveDurationMinutes / 60).toFixed(1)} hrs`;
            } else {
                driveTimeDisplay = `${Math.round(stadium.driveDurationMinutes)} min`;
            }

            // Countdown placeholder span with unique id for each stadium
            gameDetails = `
                <p class="font-semibold">${stadium.team} vs. ${stadium.nextHomeGameOpponent}</p>
                <p>${formatDate(firstPitchTime)} - ${formatTime(firstPitchTime)}</p>
                <p class="mt-2 text-xs text-gray-700">
                    <span id="${countdownId}" class="font-mono bg-gray-100 px-2 py-1 rounded">...</span> until first pitch
                </p>
                <p class="mt-2 text-xs text-gray-400">Est. Arrival: ${formatTime(arrivalTime)}</p>
            `;
        }

        card.innerHTML = `
            <img src="${logoPath}" alt="${stadium.team} logo" class="mx-auto mb-2 w-12 h-12" onerror="this.style.display='none'"/>
            <div class="status-indicator ${colorClass}"></div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1 flex items-center justify-center">
                <span class="baseball-icon">⚾</span> ${stadium.name}
            </h3>
            <p class="text-sm text-gray-600">${stadium.team}</p>
            <p class="text-xs text-gray-500 mb-2">${stadium.address}</p>
            <p class="text-md font-bold text-gray-700 mt-2" data-drive-time>${driveTimeDisplay}</p>
            <div class="mt-2">${gameDetails}</div>
        `;

        // --- Feature 2: Make card clickable to open Google Maps Directions ---
        if (userOrigin && stadium.address) {
            card.onclick = (e) => {
                // Don't trigger if user is highlighting text
                if (window.getSelection().toString()) return;
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(userOrigin)}&destination=${encodeURIComponent(stadium.address)}`;
                window.open(mapsUrl, "_blank");
            };
            card.title = "Click for directions in Google Maps";
            card.style.cursor = "pointer";
        }

        stadiumGrid.appendChild(card);

        // --- Feature 3: Live countdown timer ---
        if (stadium.nextHomeGameFirstPitchTime) {
            const firstPitchTime = new Date(stadium.nextHomeGameFirstPitchTime);
            const updateCountdown = () => {
                const now = new Date();
                const msLeft = firstPitchTime - now;
                const el = document.getElementById(countdownId);
                if (el) {
                    el.textContent = formatCountdown(msLeft);
                }
            };
            updateCountdown();
            const intervalId = setInterval(updateCountdown, 1000);
            countdownIntervals.push(intervalId);
        }
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
        if (!response.ok) {
            throw new Error("Server error");
        }
        const stadiums = await response.json();
        renderStadiumCards(stadiums);
    } catch (err) {
        alert('Error fetching drive times. Please try again.');
    }

    loadingIndicator.classList.add('hidden');
    calculateBtn.disabled = false;
});
