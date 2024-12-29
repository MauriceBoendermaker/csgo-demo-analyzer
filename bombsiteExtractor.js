const fs = require('fs');
const demofile = require('demofile');

function extractBombsiteBoundaries(demoPath) {
    return new Promise((resolve, reject) => {
        fs.readFile(demoPath, (err, buffer) => {
            if (err) {
                return reject(err);
            }

            const demoFile = new demofile.DemoFile();
            let map = null;
            const bombsiteCenters = {};
            const bombsites = {};

            demoFile.on('start', () => {
                map = demoFile.header.mapName;
            });

            demoFile.gameEvents.on('bomb_planted', (e) => {
                try {
                    const data = bombsiteData(e.site);

                    bombsites[data.name] = data.vectors;

                    if (bombsites.a && bombsites.b) {
                        demoFile.cancel();
                        resolve({map, bombsites});
                    }
                } catch (error) {
                    console.error('Error processing bomb_planted event:', error);
                    reject(error);
                }
            });

            demoFile.entities.on('change', (e) => {
                if (e.tableName !== 'DT_CSPlayerResource') return;

                if (e.varName === 'm_bombsiteCenterA') bombsiteCenters.a = e.newValue;
                else if (e.varName === 'm_bombsiteCenterB') bombsiteCenters.b = e.newValue;
            });

            demoFile.on('error', (error) => {
                console.error('Error parsing demo file:', error);
                reject(error);
            });

            demoFile.parse(buffer);

            demoFile.on('end', () => {
                resolve({map, bombsites});
            });
        });
    });
}

module.exports = {extractBombsiteBoundaries};
