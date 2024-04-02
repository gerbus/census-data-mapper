const fs = require('fs');
const csv = require('csv-parser');

// Input CSV file path
const inputFilePath = '../../canada-census-2021-bc-filtered.csv'; // Provide the path to your CSV file

// Output JSON file path
const outputFilePath = '../../canada-census-2021-bc-filtered.json'; // Provide the desired path for the JSON output

// Function to parse CSV, parse rows into arrays of objects, and write to a new JSON file
function transformData(inputFilePath, outputFilePath) {
    console.log("Starting parse")
    const data = {};

    fs.createReadStream(inputFilePath)
        .pipe(csv())
        .on('data', (row) => {
            const topLevelKey = row['ALT_GEO_CODE']
            const geoLevel = row['GEO_LEVEL']
            const geoName = row['GEO_NAME']

            if (!data[topLevelKey]) {
              data[topLevelKey] = {
                GEO_LEVEL: geoLevel,
                GEO_NAME: geoName,
              };
              console.log(geoName)
            }

            const nextLevelKey = row['CHARACTERISTIC_ID']
            const characteristicName = row['CHARACTERISTIC_NAME']
            const c1CountTotal = row['C1_COUNT_TOTAL']

            data[topLevelKey][nextLevelKey] = {
              CHARACTERISTIC_NAME: characteristicName,
              C1_COUNT_TOTAL: c1CountTotal
            }
        })
        .on('end', () => {
            console.log("\nWriting to file")
            const jsonData = JSON.stringify(data, null, 2)

            fs.writeFileSync(outputFilePath, jsonData, (err) => {
                if (err) {
                    console.error('Error writing JSON to file:', err);
                    return;
                }
                console.log('JSON object has been written to file successfully');
            });
        });
}

// Call the function to filter the CSV
transformData(inputFilePath, outputFilePath);
