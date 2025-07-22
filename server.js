const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// MLB stadiums with addresses
const MLB_STADIUMS = [
  { id: 'ATL', name: 'Truist Park', team: 'Atlanta Braves', address: '755 Battery Ave SE, Atlanta, GA 30339' },
  { id: 'BAL', name: 'Oriole Park at Camden Yards', team: 'Baltimore Orioles', address: '333 W Camden St, Baltimore, MD 21201' },
  { id: 'BOS', name: 'Fenway Park', team: 'Boston Red Sox', address: '4 Jersey St, Boston, MA 02215' },
  { id: 'CHC', name: 'Wrigley Field', team: 'Chicago Cubs', address: '1060 W Addison St, Chicago, IL 60613' },
  { id: 'CWS', name: 'Guaranteed Rate Field', team: 'Chicago White Sox', address: '333 W 35th St, Chicago, IL 60616' },
  { id: 'CIN', name: 'Great American Ball Park', team: 'Cincinnati Reds', address: '100 Joe Nuxhall Way, Cincinnati, OH 45202' },
  { id: 'CLE', name: 'Progressive Field', team: 'Cleveland Guardians', address: '2401 Ontario St, Cleveland, OH 44115' },
  { id: 'COL', name: 'Coors Field', team: 'Colorado Rockies', address: '2001 Blake St, Denver, CO 80205' },
  { id: 'DET', name: 'Comerica Park', team: 'Detroit Tigers', address: '2100 Woodward Ave, Detroit, MI 48201' },
  { id: 'HOU', name: 'Minute Maid Park', team: 'Houston Astros', address: '501 Crawford St, Houston, TX 77002' },
  { id: 'KC', name: 'Kauffman Stadium', team: 'Kansas City Royals', address: '1 Royal Way, Kansas City, MO 64129' },
  { id: 'LAA', name: 'Angel Stadium', team: 'Los Angeles Angels', address: '2000 E Gene Autry Way, Anaheim, CA 92806' },
  { id: 'LAD', name: 'Dodger Stadium', team: 'Los Angeles Dodgers', address: '1000 Vin Scully Ave, Los Angeles, CA 90012' },
  { id: 'MIA', name: 'loanDepot Park', team: 'Miami Marlins', address: '501 Marlins Way, Miami, FL 33125' },
  { id: 'MIL', name: 'American Family Field', team: 'Milwaukee Brewers', address: '1 Brewers Way, Milwaukee, WI 53214' },
  { id: 'MIN', name: 'Target Field', team: 'Minnesota Twins', address: '1 Twins Way, Minneapolis, MN 55403' },
  { id: 'NYM', name: 'Citi Field', team: 'New York Mets', address: '41-01 126th St, Flushing, NY 11368' },
  { id: 'NYY', name: 'Yankee Stadium', team: 'New York Yankees', address: '1 E 161 St, Bronx, NY 10451' },
  { id: 'OAK', name: 'Oakland Coliseum', team: 'Oakland Athletics', address: '7000 Coliseum Way, Oakland, CA 94621' },
  { id: 'PHI', name: 'Citizens Bank Park', team: 'Philadelphia Phillies', address: '1 Citizens Bank Way, Philadelphia, PA 19148' },
  { id: 'PIT', name: 'PNC Park', team: 'Pittsburgh Pirates', address: '115 Federal St, Pittsburgh, PA 15212' },
  { id: 'SD', name: 'Petco Park', team: 'San Diego Padres', address: '100 Park Blvd, San Diego, CA 92101' },
  { id: 'SEA', name: 'T-Mobile Park', team: 'Seattle Mariners', address: '1250 1st Ave S, Seattle, WA 98134' },
  { id: 'SF', name: 'Oracle Park', team: 'San Francisco Giants', address: '24 Willie Mays Plaza, San Francisco, CA 94107' },
  { id: 'STL', name: 'Busch Stadium', team: 'St. Louis Cardinals', address: '700 Clark St, St. Louis, MO 63102' },
  { id: 'TB', name: 'Tropicana Field', team: 'Tampa Bay Rays', address: '1 Tropicana Dr, St. Petersburg, FL 33705' },
  { id: 'TEX', name: 'Globe Life Field', team: 'Texas Rangers', address: '734 Stadium Dr, Arlington, TX 76011' },
  { id: 'TOR', name: 'Rogers Centre', team: 'Toronto Blue Jays', address: '1 Blue Jays Way, Toronto, ON M5V 1J1, Canada' },
  { id: 'WAS', name: 'Nationals Park', team: 'Washington Nationals', address: '1500 S Capitol St SE, Washington, DC 20003' },
  { id: 'ARI', name: 'Chase Field', team: 'Arizona Diamondbacks', address: '401 E Jefferson St, Phoenix, AZ 85004' }
];

// Helper: Get drive time in minutes
async function getDriveTime(origin, destination) {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.routes && data.routes[0]) {
    return Math.round(data.routes[0].legs[0].duration.value / 60); // minutes
  }
  return undefined;
}

// Simulated: Next home game (replace with real API if needed)
function getNextHomeGame(team) {
  // Just simulate a game 2-5 days from now, 7:05 PM, random MLB opponent
  const now = new Date();
  now.setDate(now.getDate() + Math.floor(Math.random() * 4) + 2);
  now.setHours(19, 5, 0, 0);

  const opponents = MLB_STADIUMS.map(s => s.team).filter(t => t !== team);
  const opponent = opponents[Math.floor(Math.random() * opponents.length)];
  return {
    firstPitchDate: now.toISOString(),
    opponent
  };
}

app.post('/api/calculate', async (req, res) => {
  const { startLocation } = req.body;
  if (!startLocation) {
    return res.status(400).json({ error: "Missing startLocation" });
  }

  const results = [];
  for (const stadium of MLB_STADIUMS) {
    try {
      const driveDurationMinutes = await getDriveTime(startLocation, stadium.address);
      const { firstPitchDate, opponent } = getNextHomeGame(stadium.team);
      results.push({
        id: stadium.id,
        name: stadium.name,
        team: stadium.team,
        address: stadium.address,
        driveDurationMinutes,
        nextHomeGameFirstPitchTime: firstPitchDate,
        nextHomeGameOpponent: opponent
      });
    } catch (err) {
      results.push({
        id: stadium.id,
        name: stadium.name,
        team: stadium.team,
        address: stadium.address,
        driveDurationMinutes: undefined,
        error: err.message
      });
    }
  }
  res.json(results);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`MLB Drive Time backend running on port ${PORT}`);
});