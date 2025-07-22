// Mapping: Team name -> {abbr, address}
const TEAM_INFO = {
    "Arizona Diamondbacks": { abbr: "ari", address: "401 E Jefferson St, Phoenix, AZ 85004" },
    "Atlanta Braves": { abbr: "atl", address: "755 Battery Ave SE, Atlanta, GA 30339" },
    "Baltimore Orioles": { abbr: "bal", address: "333 W Camden St, Baltimore, MD 21201" },
    "Boston Red Sox": { abbr: "bos", address: "4 Jersey St, Boston, MA 02215" },
    "Chicago Cubs": { abbr: "chc", address: "1060 W Addison St, Chicago, IL 60613" },
    "Chicago White Sox": { abbr: "cws", address: "333 W 35th St, Chicago, IL 60616" },
    "Cincinnati Reds": { abbr: "cin", address: "100 Joe Nuxhall Way, Cincinnati, OH 45202" },
    "Cleveland Guardians": { abbr: "cle", address: "2401 Ontario St, Cleveland, OH 44115" },
    "Colorado Rockies": { abbr: "col", address: "2001 Blake St, Denver, CO 80205" },
    "Detroit Tigers": { abbr: "det", address: "2100 Woodward Ave, Detroit, MI 48201" },
    "Houston Astros": { abbr: "hou", address: "501 Crawford St, Houston, TX 77002" },
    "Kansas City Royals": { abbr: "kc", address: "1 Royal Way, Kansas City, MO 64129" },
    "Los Angeles Angels": { abbr: "laa", address: "2000 E Gene Autry Way, Anaheim, CA 92806" },
    "Los Angeles Dodgers": { abbr: "lad", address: "1000 Vin Scully Ave, Los Angeles, CA 90012" },
    "Miami Marlins": { abbr: "mia", address: "501 Marlins Way, Miami, FL 33125" },
    "Milwaukee Brewers": { abbr: "mil", address: "1 Brewers Way, Milwaukee, WI 53214" },
    "Minnesota Twins": { abbr: "min", address: "1 Twins Way, Minneapolis, MN 55403" },
    "New York Mets": { abbr: "nym", address: "41 Seaver Way, Queens, NY 11368" },
    "New York Yankees": { abbr: "nyy", address: "1 E 161 St, Bronx, NY 10451" },
    "Oakland Athletics": { abbr: "oak", address: "7000 Coliseum Way, Oakland, CA 94621" },
    "Philadelphia Phillies": { abbr: "phi", address: "1 Citizens Bank Way, Philadelphia, PA 19148" },
    "Pittsburgh Pirates": { abbr: "pit", address: "115 Federal St, Pittsburgh, PA 15212" },
    "San Diego Padres": { abbr: "sd", address: "100 Park Blvd, San Diego, CA 92101" },
    "San Francisco Giants": { abbr: "sf", address: "24 Willie Mays Plaza, San Francisco, CA 94107" },
    "Seattle Mariners": { abbr: "sea", address: "1250 1st Ave S, Seattle, WA 98134" },
    "St. Louis Cardinals": { abbr: "stl", address: "700 Clark Ave, St. Louis, MO 63102" },
    "Tampa Bay Rays": { abbr: "tb", address: "1 Tropicana Dr, St. Petersburg, FL 33705" },
    "Texas Rangers": { abbr: "tex", address: "734 Stadium Dr, Arlington, TX 76011" },
    "Toronto Blue Jays": { abbr: "tor", address: "1 Blue Jays Way, Toronto, ON M5V 1J1, Canada" },
    "Washington Nationals": { abbr: "was", address: "1500 S Capitol St SE, Washington, DC 20003" }
};

async function fetchTodaysGames() {
    const resp = await fetch('https://statsapi.mlb.com/api/v1/schedule/games/?sportId=1');
    const data = await resp.json();
    return (data.dates && data.dates.length) ? data.dates[0].games : [];
}

function getStadiumInfo(teamName) {
    return TEAM_INFO[teamName] || { abbr: "", address: "" };
}

async function getDriveTimes(userOrigin, destinations) {
    // POST to your backend, expecting:
    //  { startLocation: "...", destinations: [address1, address2, ...] }
    // Should return [{address, driveDurationMinutes}, ...] in the same order.
    const resp = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startLocation: userOrigin, destinations })
    });
    return await resp.json();
}

async function displayTodaysGamesSortedByDrive() {
    const userOrigin = document.getElementById('startLocation').value.trim();
    const container = document.getElementById('mlbHomeGamesToday');
    container.innerHTML = "<p>Loading today's MLB games...</p>";
    if (!userOrigin) {
        container.innerHTML = "<p>Please enter your starting address or ZIP above.</p>";
        return;
    }

    try {
        // Step 1: Fetch today's games
        const games = await fetchTodaysGames();
        if (!games.length) {
            container.innerHTML = "<p>No MLB games scheduled for today.</p>";
            return;
        }

        // Step 2: For each game, prepare info for drive calculation
        // Each game gets its own tile (even for doubleheaders)
        const gameTiles = games.map(game => {
            const home = game.teams.home.team.name;
            const away = game.teams.away.team.name;
            const venue = game.venue.name;
            const time = new Date(game.gameDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const { abbr, address } = getStadiumInfo(home);
            return {
                home, away, venue, time, abbr, address,
                gameDate: game.gameDate // for possible additional sorting
            };
        });

        // Step 3: Get drive times for each game (by stadium address)
        const addresses = gameTiles.map(tile => tile.address);
        const driveTimes = await getDriveTimes(userOrigin, addresses);

        // Attach drive times to tiles
        gameTiles.forEach((tile, i) => {
            tile.driveDurationMinutes = driveTimes[i]?.driveDurationMinutes ?? null;
        });

        // Step 4: Sort by drive time (ascending; games with no drive time go last)
        gameTiles.sort((a, b) => {
            if (a.driveDurationMinutes == null) return 1;
            if (b.driveDurationMinutes == null) return -1;
            return a.driveDurationMinutes - b.driveDurationMinutes;
        });

        // Step 5: Render tiles
        container.innerHTML = "";
        gameTiles.forEach(tile => {
            const logoPath = tile.abbr ? `/logos/${tile.abbr}.svg` : "";
            const drive = tile.driveDurationMinutes != null
                ? (tile.driveDurationMinutes >= 60
                    ? `${(tile.driveDurationMinutes/60).toFixed(1)} hrs`
                    : `${Math.round(tile.driveDurationMinutes)} min`)
                : "N/A";
            const tileDiv = document.createElement('div');
            tileDiv.className = "p-4 border rounded shadow-md flex flex-col items-center justify-center m-2 bg-white";
            tileDiv.innerHTML = `
                <img src="${logoPath}" alt="${tile.home} logo" class="w-16 h-16 mb-2" onerror="this.style.display='none'">
                <div class="font-bold text-lg mb-1">${tile.home}</div>
                <div class="text-sm mb-1">vs. ${tile.away}</div>
                <div class="text-xs text-gray-600 mb-1">${tile.venue}</div>
                <div class="text-xs text-blue-700 mb-1">${tile.time}</div>
                <div class="text-xs text-gray-500">Drive: ${drive}</div>
            `;
            container.appendChild(tileDiv);
        });
    } catch (err) {
        container.innerHTML = "<p>Failed to load today's games. Please try again later.</p>";
    }
}

// Example: attach to a button
document.getElementById('showMLBHomeGamesBtn').onclick = displayTodaysGamesSortedByDrive;