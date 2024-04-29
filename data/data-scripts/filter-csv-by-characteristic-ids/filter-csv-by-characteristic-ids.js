const fs = require('fs');
const csv = require('csv-parser');

// Array of IDs to match against
const idsToMatch = ["CHARACTERISTIC_ID","8","10","11","19","41","42","100","103","260","276","277","278","279","312","393","396","735","738","1698","1699","1709","1718","1949","1950","1951","2014","2024"]; // Add your desired IDs here

// Input CSV file path
const inputFilePath = '../../98-401-X2021006_BC_CB_eng_CSV/98-401-X2021006_English_CSV_data_BritishColumbia.csv'; // Provide the path to your CSV file

// Output CSV file path
const outputFilePath = '../../canada-census-2021-bc-filtered.csv'; // Provide the desired path for the filtered CSV file

// Function to check if a cell value matches any ID in the array
function doesMatchID(cellValue) {
    return idsToMatch.includes(cellValue);
}

// Function to parse CSV, filter rows, and write to a new CSV file
function filterCSV(inputFilePath, outputFilePath) {
    console.log("Starting parse")
    const filteredRows = [];

    fs.createReadStream(inputFilePath)
        .pipe(csv())
        .on('data', (row) => {
            // Assuming the 9th column contains the IDs
            const cellValue = row[Object.keys(row)[8]]; // Get the value of the 9th cell

            // Check if the cell value matches any ID in the array
            if (doesMatchID(cellValue)) {
                process.stdout.write(".")
                filteredRows.push(row);
            }
        })
        .on('end', () => {
            console.log("\nWriting to file")
            // Write filtered rows to a new CSV file
            const csvWriter = require('csv-writer').createObjectCsvWriter({
                path: outputFilePath,
                header: Object.keys(filteredRows[0]).map(key => ({ id: key, title: key }))
            });

            csvWriter
                .writeRecords(filteredRows)
                .then(() => console.log('Filtered CSV file created successfully'))
                .catch(err => console.error('Error writing CSV:', err));
        });
}

// Call the function to filter the CSV
filterCSV(inputFilePath, outputFilePath);
