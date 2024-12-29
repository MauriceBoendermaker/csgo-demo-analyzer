const express = require('express');
const app2 = express();
const path = require('path');

// Sample data
const playerStats = {
    player1: {A: 60, B: 40},
    player2: {A: 55, B: 45},
    player3: {A: 70, B: 30}
};

const roundDetails = {
    1: {
        player1: Array.from({length: 150}, (_, i) => `A${i}`),
        player2: Array.from({length: 150}, (_, i) => `B${i}`)
    }
};

// Set up view engine
app2.set('view engine', 'ejs');
app2.set('views', path.join(__dirname, 'views'));

// Static files
app2.use(express.static(path.join(__dirname, 'public')));

app2.get('/round-details', (req, res) => {
    const round = parseInt(req.query.round) || 1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const roundData = roundDetails[round] || {};
    const players = Object.keys(roundData);

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedData = players.reduce((acc, player) => {
        acc[player] = roundData[player].slice(startIndex, endIndex);
        return acc;
    }, {});

    res.render('index', {
        stats: playerStats,
        roundDetails: paginatedData,
        currentPage: page,
        totalPages: Math.ceil(players.reduce((max, player) => Math.ceil(roundData[player].length / limit), 0)),
        round,
        limit
    });
});

// Handle 404 errors
app2.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// Start the server
const PORT = 3000;
app2.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
