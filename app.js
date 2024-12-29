const express = require('express');
const path = require('path');
const {parseEvent, parseTicks, parsePlayerInfo} = require('@laihoe/demoparser2');

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Path to the demo file
const demoFilePath = path.join(__dirname, 'demo/example.dem');

// Home route to display player movements and scoreboard
app.get('/', async (req, res) => {
    try {
        // Extract scoreboard
        const roundEndEvent = await parseEvent(demoFilePath, 'round_end');
        const gameEndTick = Math.max(...roundEndEvent.map(x => x.tick));

        const scoreboardFields = ["kills_total", "deaths_total", "mvps", "headshot_kills_total", "ace_rounds_total", "score"];
        const scoreboard = await parseTicks(demoFilePath, scoreboardFields, [gameEndTick]);

        // Extract player movements for the first round
        const playerInfo = await parsePlayerInfo(demoFilePath);
        const ctPlayers = playerInfo.filter(player => player.team_number === 2).map(player => player.name);

        const ticks = await parseTicks(demoFilePath, ["X", "Y", "last_place_name"]);
        const playerMovements = {};

        ticks.forEach(tick => {
            if (tick.round === 1 && ctPlayers.includes(tick.name)) {
                const playerName = tick.name;
                const position = tick.last_place_name;

                if (!playerMovements[playerName]) {
                    playerMovements[playerName] = [];
                }

                const timestamp = Math.floor(tick.tick / 1000);
                if (!playerMovements[playerName][timestamp]) {
                    playerMovements[playerName][timestamp] = [];
                }
                playerMovements[playerName][timestamp].push(position);
            }
        });

        const intervals = [];
        const maxInterval = Math.max(...Object.values(playerMovements).flatMap(m => Object.keys(m).map(Number)));

        for (let i = 0; i <= maxInterval; i++) {
            const interval = {time: i, positions: {}};
            for (const player in playerMovements) {
                interval.positions[player] = playerMovements[player][i] ? playerMovements[player][i].join(', ') : '';
            }
            intervals.push(interval);
        }

        res.render('index', {intervals, scoreboard});
    } catch (error) {
        console.error('Error processing demo file:', error);
        res.status(500).send('Error processing demo file.');
    }
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
