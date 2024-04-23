const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const JSONStream = require('JSONStream')

const uri = 'mongodb://localhost:27017/neighbourhoodfinder';
const boundaryDataFilePath = '../../canada-census-2021-boundary-data.json';

// Connect to db
MongoClient.connect(uri, function(err, client) {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
        return;
    }

    console.log('Connected to MongoDB');
    const db = client.db('neighbourhoodfinder');
    const collection = db.collection('boundarydata2021das');

    // Open read stream
    const stream = fs.createReadStream(boundaryDataFilePath, { encoding: 'utf8' });
    const parser = JSONStream.parse('*');

    stream.pipe(parser);
    process.stdout.write("Parsing JSON data from file and adding to db...");
    parser.on('data', async (object) => {
        try {
            // Insert object into db
            await collection.insertOne(object)
            process.stdout.write('.')
        } catch (err) {
            console.error('Error inserting JSON object:', err)
        }
    });
    parser.on('error', (err) => {
        console.error('Error parsing JSON:', err);
        return
    });
    stream.on('error', (err) => {
        console.error('Error reading JSON file:', err);
        return
    });
    parser.on('end', () => {
        process.stdout.write('done')
        client.close()
    })

    // Create Index
    const indexDefinition = { dauid: 1 }
    collection.createIndex(indexDefinition, (err, result) => {
        if (err) {
            console.error('Error creating index:', err);
            return;
        }

        console.log('Index created:', result);
        client.close();
    });
});

