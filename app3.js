const express = require('express');
const fs = require('fs');
const path = require('path');
const demoinfogo = require('demoinfogo'); // Ensure you have this package installed

const app = express();

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Path to the demo file
const demoFilePath = path.join(__dirname, 'demo/example.dem');

app.get('/extract-movements', async (req, res) => {
    try {
        // Read and parse the demo file
        const demoData = fs.readFileSync(demoFilePath);
        const demo = new demoinfogo.DemoFile(demoData);

        // Extract player movements
        const playerMovements = {};

        demo.on('player_position', (event) => {
            const playerId = event.player_id;
            const playerName = demo.players[playerId].name; // Get player name from ID
            const position = event.position; // This will be the place info

            if (!playerMovements[playerName]) {
                playerMovements[playerName] = [];
            }

            playerMovements[playerName].push(position);
        });

        demo.on('end', () => {
            res.json(playerMovements);
        });

        demo.parse();
    } catch (error) {
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
