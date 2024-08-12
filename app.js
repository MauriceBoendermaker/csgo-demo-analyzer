const express = require('express');
const path = require('path');
const fs = require('fs');
const { DemoFile } = require('demofile');

const app = express();
const port = 3000;

// Set up view engine and static files
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Hardcoded path to the demo file for testing
const demoPath = path.join(__dirname, 'demo', 'example.dem');

app.get('/', (req, res) => {
    const demoFile = new DemoFile();
    const playerPositions = {};

    demoFile.on('start', () => {
        demoFile.players.forEach(player => {
            if (player.teamNumber === 3) { // CT side
                playerPositions[player.steamId] = {
                    name: player.name,
                    positions: { A: 0, B: 0, unknown: 0 },
                    total: 0
                };
            }
        });
    });

    demoFile.on('tick', () => {
        demoFile.players.forEach(player => {
            if (player.teamNumber === 3 && playerPositions[player.steamId]) {
                const pos = player.position;
                if (pos.x > 0) {
                    playerPositions[player.steamId].positions.A += 1;
                } else if (pos.x < 0) {
                    playerPositions[player.steamId].positions.B += 1;
                } else {
                    playerPositions[player.steamId].positions.unknown += 1;
                }
                playerPositions[player.steamId].total += 1;
            }
        });
    });

    demoFile.on('end', () => {
        const playerStats = {};
        Object.keys(playerPositions).forEach(steamId => {
            const stats = playerPositions[steamId];
            playerStats[stats.name] = {
                A: (stats.positions.A / stats.total) * 100,
                B: (stats.positions.B / stats.total) * 100,
            };
        });

        res.render('index', { playerStats });
    });

    demoFile.parse(fs.readFileSync(demoPath));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
