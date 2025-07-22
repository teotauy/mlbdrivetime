async function fetchTodaysMLBGames() {
    const response = await fetch('http://statsapi.mlb.com/api/v1/schedule/games/?sportId=1');
    const data = await response.json();
    return data.dates?.[0]?.games || [];
}

async function displayTodaysMLBGames() {
    const games = await fetchTodaysMLBGames();
    const container = document.getElementById('mlbGamesToday');
    if (!games.length) {
        container.innerHTML = "<p>No MLB games scheduled for today.</p>";
        return;
    }
    container.innerHTML = games.map(game => {
        const home = game.teams.home.team.name;
        const away = game.teams.away.team.name;
        const venue = game.venue.name;
        const time = new Date(game.gameDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `<div class="mb-2">
            <strong>${away}</strong> at <strong>${home}</strong> (${venue}) — ${time}
        </div>`;
    }).join("");
}

// Call this on page load or when you want to update the list
displayTodaysMLBGames();