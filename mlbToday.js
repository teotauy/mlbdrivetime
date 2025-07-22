// Utility: Map team names to logo file names (using your /public/logos/ convention)
const TEAM_ABBR_MAP = {
    "Arizona Diamondbacks": "ari",
    "Atlanta Braves": "atl",
    "Baltimore Orioles": "bal",
    "Boston Red Sox": "bos",
    "Chicago Cubs": "chc",
    "Chicago White Sox": "cws",
    "Cincinnati Reds": "cin",
    "Cleveland Guardians": "cle",
    "Colorado Rockies": "col",
    "Detroit Tigers": "det",
    "Houston Astros": "hou",
    "Kansas City Royals": "kc",
    "Los Angeles Angels": "laa",
    "Los Angeles Dodgers": "lad",
    "Miami Marlins": "mia",
    "Milwaukee Brewers": "mil",
    "Minnesota Twins": "min",
    "New York Mets": "nym",
    "New York Yankees": "nyy",
    "Oakland Athletics": "oak",
    "Philadelphia Phillies": "phi",
    "Pittsburgh Pirates": "pit",
    "San Diego Padres": "sd",
    "San Francisco Giants": "sf",
    "Seattle Mariners": "sea",
    "St. Louis Cardinals": "stl",
    "Tampa Bay Rays": "tb",
    "Texas Rangers": "tex",
    "Toronto Blue Jays": "tor",
    "Washington Nationals": "was"
};

// Fetch today's MLB games and render home team tiles
async function displayTodaysHomeTeamTiles() {
    const container = document.getElementById('mlbHomeTeamsToday');
    container.innerHTML = "<p>Loading today's MLB games...</p>";

    try {
        // Fetch today's games
        const response = await fetch('https://statsapi.mlb.com/api/v1/schedule/games/?sportId=1');
        const data = await response.json();
        const games = (data.dates && data.dates.length > 0) ? data.dates[0].games : [];

        if (!games.length) {
            container.innerHTML = "<p>No MLB games scheduled for today.</p>";
            return;
        }

        // Map: home team -> game info (if multiple games at same park, show first game)
        const homeTeams = {};
        games.forEach(game => {
            const home = game.teams.home.team.name;
            if (!homeTeams[home]) homeTeams[home] = game;
        });

        // Render tiles
        container.innerHTML = "";
        Object.values(homeTeams).forEach(game => {
            const home = game.teams.home.team.name;
            const away = game.teams.away.team.name;
            const venue = game.venue.name;
            const time = new Date(game.gameDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const abbr = TEAM_ABBR_MAP[home] || "";
            const logoPath = abbr ? `/logos/${abbr}.svg` : "";

            const tile = document.createElement('div');
            tile.className = "p-4 border rounded shadow-md flex flex-col items-center justify-center m-2 bg-white";
            tile.innerHTML = `
                <img src="${logoPath}" alt="${home} logo" class="w-16 h-16 mb-2" onerror="this.style.display='none'">
                <div class="font-bold text-lg mb-1">${home}</div>
                <div class="text-sm mb-1">vs. ${away}</div>
                <div class="text-xs text-gray-600 mb-1">${venue}</div>
                <div class="text-xs text-blue-700 mb-1">${time}</div>
            `;
            container.appendChild(tile);
        });
    } catch (err) {
        container.innerHTML = "<p>Failed to load today's games. Please try again later.</p>";
    }
}

// Call this function on page load or when you want to show today's games
displayTodaysHomeTeamTiles();