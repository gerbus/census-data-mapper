const fs = require('fs');
const { Parser } = require('json2csv');

// Function to read JSON file and parse its content into an object
function readJSONFile(filePath) {
    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return null;
    }
}

// JSON file path
const inputFilePath = '../../canada-census-2021-bc-filtered.json'; // Provide the path to your JSON file

const outputCSVFilePath = '../../canada-census-2021-bc-derived.csv';
const outputJSONFilePath = '../../canada-census-2021-bc-derived.json';

// Call the function to read JSON file into an object
const data = readJSONFile(inputFilePath);

// Check if the JSON file was successfully read and parsed
if (data !== null) {
    console.log('JSON object read from file');
} else {
    console.log('Failed to read JSON file or JSON parsing failed.');
}

// Build two-level object of names for levels
// so that we can do names[geoLevel][topLevelKey] to fetch a name
const names = {}
Object.keys(data).forEach((topLevelKey) => {
  const geoObject = data[topLevelKey]
  const geoLevel = geoObject.GEO_LEVEL
  const geoName = geoObject.GEO_NAME

  if (!names[geoLevel]) {
    names[geoLevel] = {}
  }
  names[geoLevel][topLevelKey] = geoName
})

// Calculate desired ratios from census data
const derivedData = Object.keys(data).map((topLevelKey) => {
  const geoObject = data[topLevelKey]
  const geoLevel = geoObject.GEO_LEVEL
  const geoName = geoObject.GEO_NAME
  const geoDivisionCode = topLevelKey.length > 4 ? topLevelKey.substring(0,4) : null

  const derivedObject = {
    ALT_GEO_CODE: topLevelKey,
    GEO_NAME: geoName,
    GEO_LEVEL: geoLevel,
    CENSUS_DIVISION_NAME: geoDivisionCode ? names["Census division"][geoDivisionCode] : null,
    age_0to4_pct: geoObject["10"].C1_COUNT_TOTAL / geoObject["8"].C1_COUNT_TOTAL,
    age_5to9_pct: geoObject["11"].C1_COUNT_TOTAL / geoObject["8"].C1_COUNT_TOTAL,
    age_40to44_pct: geoObject["19"].C1_COUNT_TOTAL / geoObject["8"].C1_COUNT_TOTAL,
    housingType_singleDetached_pct: geoObject["42"].C1_COUNT_TOTAL / geoObject["41"].C1_COUNT_TOTAL,
    householdType_withChildren_pct: geoObject["103"].C1_COUNT_TOTAL / geoObject["100"].C1_COUNT_TOTAL,
    householdIncome_100kPlus_pct: geoObject["276"].C1_COUNT_TOTAL / geoObject["260"].C1_COUNT_TOTAL,
    familySize_couplesWithChildren_avg: geoObject["312"].C1_COUNT_TOTAL,
    motherTongue_english_pct: geoObject["396"].C1_COUNT_TOTAL / geoObject["393"].C1_COUNT_TOTAL,
    ethnicOrigin_canadian_pct: geoObject["1699"].C1_COUNT_TOTAL / geoObject["1698"].C1_COUNT_TOTAL,
    ethnicOrigin_dutch_pct: geoObject["1709"].C1_COUNT_TOTAL / geoObject["1698"].C1_COUNT_TOTAL,
    ethnicOrigin_euro_pct: geoObject["1718"].C1_COUNT_TOTAL / geoObject["1698"].C1_COUNT_TOTAL,
    religion_buddhist_pct: geoObject["1950"].C1_COUNT_TOTAL / geoObject["1949"].C1_COUNT_TOTAL,
    religion_christian_pct: geoObject["1951"].C1_COUNT_TOTAL / geoObject["1949"].C1_COUNT_TOTAL,
    highestDegree_bachelor_pct: geoObject["2024"].C1_COUNT_TOTAL / geoObject["2014"].C1_COUNT_TOTAL,
    age_0to4: geoObject["10"].C1_COUNT_TOTAL,
    age_5to9: geoObject["11"].C1_COUNT_TOTAL,
    age_40to44: geoObject["19"].C1_COUNT_TOTAL,
    housingType_singleDetached: geoObject["42"].C1_COUNT_TOTAL,
    householdType_withChildren: geoObject["103"].C1_COUNT_TOTAL,
    householdIncome_100kPlus: geoObject["276"].C1_COUNT_TOTAL,
    motherTongue_english: geoObject["396"].C1_COUNT_TOTAL,
    ethnicOrigin_canadian: geoObject["1699"].C1_COUNT_TOTAL,
    ethnicOrigin_dutch: geoObject["1709"].C1_COUNT_TOTAL,
    ethnicOrigin_euro: geoObject["1718"].C1_COUNT_TOTAL,
    religion_buddhist: geoObject["1950"].C1_COUNT_TOTAL,
    religion_christian: geoObject["1951"].C1_COUNT_TOTAL,
    highestDegree_bachelor: geoObject["2024"].C1_COUNT_TOTAL,
  }

  return derivedObject
})

try {
  const json2csvParser = new Parser({ header: true });
  const csv = json2csvParser.parse(derivedData);

  fs.writeFileSync(outputCSVFilePath, csv, 'utf8');
  console.log('CSV file has been created successfully');
} catch (error) {
  console.error('Error writing array to CSV:', error);
}

try {
  const jsonData = JSON.stringify(derivedData, null, 2)

  fs.writeFileSync(outputJSONFilePath, jsonData, (err) => {
    if (err) {
      console.error('Error writing JSON to file:', err);
      return;
    }
    console.log('JSON object has been written to file successfully');
  });
} catch (error) {
  console.error('Error writing array to JSON:', error);
}

//console.log(JSON.stringify(derivedData,null,2))
