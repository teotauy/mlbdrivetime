// --- MLB Stadium Info Lookup with Ticket URLs ---
const STADIUMS = {
  "Arizona Diamondbacks": { abbr: "ari", stadium: "Chase Field", address: "401 E Jefferson St, Phoenix, AZ 85004", tickets: "https://www.mlb.com/dbacks/tickets" },
  "Atlanta Braves": { abbr: "atl", stadium: "Truist Park", address: "755 Battery Ave SE, Atlanta, GA 30339", tickets: "https://www.mlb.com/braves/tickets" },
  "Baltimore Orioles": { abbr: "bal", stadium: "Oriole Park at Camden Yards", address: "333 W Camden St, Baltimore, MD 21201", tickets: "https://www.mlb.com/orioles/tickets" },
  "Boston Red Sox": { abbr: "bos", stadium: "Fenway Park", address: "4 Jersey St, Boston, MA 02215", tickets: "https://www.mlb.com/redsox/tickets" },
  "Chicago Cubs": { abbr: "chc", stadium: "Wrigley Field", address: "1060 W Addison St, Chicago, IL 60613", tickets: "https://www.mlb.com/cubs/tickets" },
  "Chicago White Sox": { abbr: "cws", stadium: "Guaranteed Rate Field", address: "333 W 35th St, Chicago, IL 60616", tickets: "https://www.mlb.com/whitesox/tickets" },
  "Cincinnati Reds": { abbr: "cin", stadium: "Great American Ball Park", address: "100 Joe Nuxhall Way, Cincinnati, OH 45202", tickets: "https://www.mlb.com/reds/tickets" },
  "Cleveland Guardians": { abbr: "cle", stadium: "Progressive Field", address: "2401 Ontario St, Cleveland, OH 44115", tickets: "https://www.mlb.com/guardians/tickets" },
  "Colorado Rockies": { abbr: "col", stadium: "Coors Field", address: "2001 Blake St, Denver, CO 80205", tickets: "https://www.mlb.com/rockies/tickets" },
  "Detroit Tigers": { abbr: "det", stadium: "Comerica Park", address: "2100 Woodward Ave, Detroit, MI 48201", tickets: "https://www.mlb.com/tigers/tickets" },
  "Houston Astros": { abbr: "hou", stadium: "Minute Maid Park", address: "501 Crawford St, Houston, TX 77002", tickets: "https://www.mlb.com/astros/tickets" },
  "Kansas City Royals": { abbr: "kc", stadium: "Kauffman Stadium", address: "1 Royal Way, Kansas City, MO 64129", tickets: "https://www.mlb.com/royals/tickets" },
  "Los Angeles Angels": { abbr: "laa", stadium: "Angel Stadium", address: "2000 E Gene Autry Way, Anaheim, CA 92806", tickets: "https://www.mlb.com/angels/tickets" },
  "Los Angeles Dodgers": { abbr: "lad", stadium: "Dodger Stadium", address: "1000 Vin Scully Ave, Los Angeles, CA 90012", tickets: "https://www.mlb.com/dodgers/tickets" },
  "Miami Marlins": { abbr: "mia", stadium: "loanDepot Park", address: "501 Marlins Way, Miami, FL 33125", tickets: "https://www.mlb.com/marlins/tickets" },
  "Milwaukee Brewers": { abbr: "mil", stadium: "American Family Field", address: "1 Brewers Way, Milwaukee, WI 53214", tickets: "https://www.mlb.com/brewers/tickets" },
  "Minnesota Twins": { abbr: "min", stadium: "Target Field", address: "1 Twins Way, Minneapolis, MN 55403", tickets: "https://www.mlb.com/twins/tickets" },
  "New York Mets": { abbr: "nym", stadium: "Citi Field", address: "41 Seaver Way, Queens, NY 11368", tickets: "https://www.mlb.com/mets/tickets" },
  "New York Yankees": { abbr: "nyy", stadium: "Yankee Stadium", address: "1 E 161 St, Bronx, NY 10451", tickets: "https://www.mlb.com/yankees/tickets" },
  "Oakland Athletics": { abbr: "oak", stadium: "Oakland Coliseum", address: "7000 Coliseum Way, Oakland, CA 94621", tickets: "https://www.mlb.com/athletics/tickets" },
  "Philadelphia Phillies": { abbr: "phi", stadium: "Citizens Bank Park", address: "1 Citizens Bank Way, Philadelphia, PA 19148", tickets: "https://www.mlb.com/phillies/tickets" },
  "Pittsburgh Pirates": { abbr: "pit", stadium: "PNC Park", address: "115 Federal St, Pittsburgh, PA 15212", tickets: "https://www.mlb.com/pirates/tickets" },
  "San Diego Padres": { abbr: "sd", stadium: "Petco Park", address: "100 Park Blvd, San Diego, CA 92101", tickets: "https://www.mlb.com/padres/tickets" },
  "San Francisco Giants": { abbr: "sf", stadium: "Oracle Park", address: "24 Willie Mays Plaza, San Francisco, CA 94107", tickets: "https://www.mlb.com/giants/tickets" },
  "Seattle Mariners": { abbr: "sea", stadium: "T-Mobile Park", address: "1250 1st Ave S, Seattle, WA 98134", tickets: "https://www.mlb.com/mariners/tickets" },
  "St. Louis Cardinals": { abbr: "stl", stadium: "Busch Stadium", address: "700 Clark Ave, St. Louis, MO 63102", tickets: "https://www.mlb.com/cardinals/tickets" },
  "Tampa Bay Rays": { abbr: "tb", stadium: "Tropicana Field", address: "1 Tropicana Dr, St. Petersburg, FL 33705", tickets: "https://www.mlb.com/rays/tickets" },
  "Texas Rangers": { abbr: "tex", stadium: "Globe Life Field", address: "734 Stadium Dr, Arlington, TX 76011", tickets: "https://www.mlb.com/rangers/tickets" },
  "Toronto Blue Jays": { abbr: "tor", stadium: "Rogers Centre", address: "1 Blue Jays Way, Toronto, ON M5V 1J1, Canada", tickets: "https://www.mlb.com/bluejays/tickets" },
  "Washington Nationals": { abbr: "was", stadium: "Nationals Park", address: "1500 S Capitol St SE, Washington, DC 20003", tickets: "https://www.mlb.com/nationals/tickets" }
};

const startLocationInput = document.getElementById('startLocation');
const calculateBtn = document.getElementById('calculateBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const stadiumGrid = document.getElementById('stadiumGrid');

const GREEN_THRESHOLD = 60;
const YELLOW_THRESHOLD = 0;

function addUseLocationButton() {
  if (document.getElementById('useLocationBtn')) return;
  const btn = document.createElement('button');
  btn.id = "useLocationBtn";
  btn.className = "ml-4 px-4 py-2 bg-blue-700 text-white rounded shadow hover:bg-blue-900 transition";
  btn.textContent = "Use My Location";
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
      startLocationInput.value = `${latitude},${longitude}`;
      btn.textContent = "Use My Location";
      btn.disabled = false;
    }, () => {
      alert("Unable to retrieve your location.");
      btn.textContent = "Use My Location";
      btn.disabled = false;
    });
  });
}
addUseLocationButton();

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function fetchTodaysHomeGames() {
  const resp = await fetch('https://statsapi.mlb.com/api/v1/schedule/games/?sportId=1');
  const data = await resp.json();
  if (!data.dates || !data.dates.length) return [];
  return data.dates[0].games.filter(g => !!STADIUMS[g.teams.home.team.name]);
}

async function getDriveTimes(userOrigin, destinations) {
  const resp = await fetch('/api/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startLocation: userOrigin, destinations })
  });
  return await resp.json();
}

function getBorderColorClass(minutesBeforeFirstPitch) {
  if (minutesBeforeFirstPitch >= GREEN_THRESHOLD) return "border-green-600";
  if (minutesBeforeFirstPitch >= YELLOW_THRESHOLD) return "border-yellow-500";
  return "border-red-600";
}

async function renderTodaysMLBStadiumCards() {
  const userOrigin = startLocationInput.value.trim();
  stadiumGrid.innerHTML = "";
  if (!userOrigin) {
    stadiumGrid.innerHTML = "<p class='text-center py-4'>Please enter your starting address or ZIP above.</p>";
    return;
  }
  loadingIndicator.classList.remove('hidden');
  calculateBtn.disabled = true;

  try {
    const games = await fetchTodaysHomeGames();
    if (!games.length) {
      stadiumGrid.innerHTML = "<p class='text-center py-4'>No MLB home games scheduled for today.</p>";
      loadingIndicator.classList.add('hidden');
      calculateBtn.disabled = false;
      return;
    }

    const gameTiles = games.map(game => {
      const homeTeam = game.teams.home.team.name;
      const awayTeam = game.teams.away.team.name;
      const info = STADIUMS[homeTeam];
      const firstPitch = new Date(game.gameDate);
      return {
        home: homeTeam,
        away: awayTeam,
        stadium: info.stadium,
        abbr: info.abbr,
        address: info.address,
        firstPitch,
        tickets: info.tickets
      };
    });

    const addresses = gameTiles.map(tile => tile.address);
    const driveTimes = await getDriveTimes(userOrigin, addresses);

    const now = new Date();
    gameTiles.forEach((tile, i) => {
      tile.driveDurationMinutes = driveTimes[i]?.driveDurationMinutes ?? null;
      tile.driveDistanceMiles = driveTimes[i]?.driveDistanceMiles ?? null;
      const arrival = new Date(now.getTime() + (tile.driveDurationMinutes || 0) * 60000);
      tile.arrivalTime = formatTime(arrival);
      tile.minutesBeforeFirstPitch = Math.round((tile.firstPitch - arrival) / 60000);
      tile.borderColor = getBorderColorClass(tile.minutesBeforeFirstPitch);
    });
    gameTiles.sort((a, b) => {
      if (a.driveDurationMinutes == null) return 1;
      if (b.driveDurationMinutes == null) return -1;
      return a.driveDurationMinutes - b.driveDurationMinutes;
    });

    stadiumGrid.innerHTML = "";
    gameTiles.forEach(tile => {
      const logoPath = tile.abbr ? `/logos/${tile.abbr}.svg` : "";
      const driveDistance = tile.driveDistanceMiles != null ? `${tile.driveDistanceMiles.toFixed(1)} miles` : "N/A";
      const driveTime = tile.driveDurationMinutes != null ? (
        tile.driveDurationMinutes >= 60
          ? `${(tile.driveDurationMinutes/60).toFixed(1)} hrs`
          : `${Math.round(tile.driveDurationMinutes)} min`
      ) : "N/A";
      const matchup = `${tile.away} at ${tile.home}`;
      const borderClass = tile.borderColor + " border-4";

      const card = document.createElement('div');
      card.className = `stadium-card max-w-xs w-full mx-2 mb-6 p-4 rounded-lg shadow-md flex flex-col items-center bg-white hover:shadow-2xl transition ${borderClass}`;
      card.innerHTML = `
        <img src="${logoPath}" alt="${tile.home} logo" class="mx-auto mb-2 w-16 h-16" onerror="this.style.display='none'"/>
        <h3 class="text-lg font-bold text-gray-800 mb-1 text-center">${tile.stadium}</h3>
        <div class="mb-1 text-base font-semibold">${matchup}</div>
        <div class="text-sm mb-1">First pitch: ${formatTime(tile.firstPitch)}</div>
        <div class="text-xs text-gray-700 mb-1">Distance: ${driveDistance}</div>
        <div class="text-xs text-gray-700 mb-1">Time: ${driveTime}</div>
        <div class="text-xs text-gray-700 mb-2">Arrival time: ${tile.arrivalTime}</div>
        <div class="mt-1 text-xs text-gray-400">Arrives ${tile.minutesBeforeFirstPitch >= 0 ? tile.minutesBeforeFirstPitch + " min" : Math.abs(tile.minutesBeforeFirstPitch) + " min late"} before first pitch</div>
        <a href="${tile.tickets}" target="_blank" rel="noopener" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-800 transition shadow">Get Tickets</a>
      `;
      stadiumGrid.appendChild(card);
    });

  } catch (err) {
    stadiumGrid.innerHTML = "<p class='text-center py-4'>Failed to load drive times or games. Please try again.</p>";
  }
  loadingIndicator.classList.add('hidden');
  calculateBtn.disabled = false;
}

calculateBtn.addEventListener('click', renderTodaysMLBStadiumCards);
startLocationInput.addEventListener('keydown', e => {
  if (e.key === "Enter") renderTodaysMLBStadiumCards();
});
stadiumGrid.innerHTML = "<p class='text-center py-4'>Enter your starting address or ZIP, then click 'Calculate'.</p>";