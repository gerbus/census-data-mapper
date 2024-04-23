const fs = require('fs');
const parseString = require('xml2js').parseString;
const proj4 = require('proj4');

const gmlFilePath = '../../lda_000a21g_e/lda_000a21g_e.gml';
const jsonFilePath = '../../canada-census-2021-boundary-data.json'


// Function to parse GML file into a JSON object
function parseGMLFile(inputFilePath, outputFilePath) {
    let data = []

    // Read
    process.stdout.write("Reading in GML...")
    let fileData
    try {
        fileData = fs.readFileSync(inputFilePath, 'utf8')
    } catch (err) {
        console.error('Error parsing GML file:', err);
        return;
    }
    console.log("done")

    // Parse
    process.stdout.write("Parsing GML...")
    parseString(fileData, { explicitArray: false }, (err, result) => {
        if (err) {
            console.error('Error parsing GML file:', err);
            return;
        } else {
            console.log("done")
        }

        // Transform
        process.stdout.write("Transforming GML to JSON...")
        // Definitions below looked up at https://epsg.io/4326 and https://epsg.io/3347 (see Export section at bottom of page)
        proj4.defs("EPSG:3347","+proj=lcc +lat_0=63.390675 +lon_0=-91.8666666666667 +lat_1=49 +lat_2=77 +x_0=6200000 +y_0=3000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
        proj4.defs("EPSG:4326","+proj=longlat +datum=WGS84 +no_defs +type=crs");

        const featureMembers = result["gml:FeatureCollection"]['gml:featureMember']
        data = featureMembers.map((featureMember) => {
            const dauid = featureMember["fme:lda_000a21g_e"]["fme:DAUID"]
            process.stdout.write(".")

            const coordinates = []
            try {
                const posList = featureMember["fme:lda_000a21g_e"]["gml:surfaceProperty"]["gml:Surface"]["gml:patches"]["gml:PolygonPatch"]["gml:exterior"]["gml:LinearRing"]["gml:posList"]

                const coordinateStrings = posList.split(" ")

                // Iterate through each coordinate string and parse it into [latitude, longitude] format
                for (let i = 0; i < coordinateStrings.length; i += 2) {
                    const easting = parseFloat(coordinateStrings[i])
                    const northing = parseFloat(coordinateStrings[i+1])
                    const lonlat = proj4('EPSG:3347', 'EPSG:4326', [easting, northing])

                    coordinates.push([lonlat[1], lonlat[0]]);
                }
            } catch (err) {
                console.warn("\nfailed to parse: " + dauid, err)
            }

            return ({
                dauid: dauid,
                coordinates: coordinates
            })
        })
        console.log("done")
    });

    // Write
    process.stdout.write("\nWriting JSON...")
    const writeStream = fs.createWriteStream(jsonFilePath)

    writeStream.write('[\n', 'utf8')
    writeStream.on('finish', () => {
        console.log("done")
    })
    let commaString = ""
    data.forEach(item => {
        writeStream.write(commaString + JSON.stringify(item,null,2), 'utf8')
        commaString = ",\n"
        process.stdout.write(".")
    })
    writeStream.write('\n]', 'utf8')
    writeStream.end()
}


parseGMLFile(gmlFilePath, jsonFilePath);
