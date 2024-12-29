const fs = require('fs');
const path = require('path');
const {parseEvents, listGameEvents} = require('@laihoe/demoparser2');

// Path to the demo file
const pathToDemo = path.join(__dirname, 'demo/example.dem');
const outputPath = 'output_demo.json';

(async () => {
    try {
        // Get the list of all event names
        let eventNames = listGameEvents(pathToDemo);

        // Extract all events
        let allEvents = parseEvents(pathToDemo, eventNames);

        // Convert events to JSON
        let jsonData = JSON.stringify(allEvents, null, 2);

        // Write JSON data to file
        fs.writeFileSync(outputPath, jsonData, 'utf8');

        console.log('Events have been successfully written to JSON file.');
    } catch (error) {
        console.error('Error processing demo file:', error);
    }
})();
