const express = require('express');
const fs = require('fs');
const JSONStream = require('JSONStream')
const path = require('path')
const compression = require("compression")
const helmet = require("helmet")
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({     // Set up rate limiter: maximum of twenty requests per minute
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});

const app = express();
const PORT = parseInt(process.env.PORT,10) || 3000;

app.set("trust proxy", true)

// Sample JSON file path (replace with the path to your JSON file)
const boundaryDataFilePath = 'assets/canada-census-2021-boundary-data.json';
const censusDerivedDataFilePath = 'assets/canada-census-2021-bc-derived.json';

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            "script-src": ["'self'", "unpkg.com"],
            "script-src-attr": ["'self'", "'unsafe-inline'"],
            "img-src": ["'self'", "*.openstreetmap.org", "data:"]
        },
    }),
)

// Apply rate limiter to all requests
app.use(limiter);

// Middleware to parse JSON request body
app.use(express.json());

app.use(compression()); // Compress all routes

// Middleware to serve assets
app.use(express.static(__dirname + '/assets'))

// Endpoint to handle the search request
app.post('/boundary-data', (req, res) => {
    // Read the array of IDs from the request body
    const { ids } = req.body;

    // Check if IDs array is provided
    if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: 'Invalid input. IDs array is missing or not an array.' });
    }

    // Read the large JSON file
    console.log("/boundary-data: start read")
    const stream = fs.createReadStream(boundaryDataFilePath, { encoding: 'utf8' });
    const parser = JSONStream.parse('*');

    stream.pipe(parser);

    const matchingObjects = []
    console.log("/boundary-data: start filter json based on params");
    parser.on('data', (jsonData) => {
        // Find objects matching the provided IDs
        if (ids.includes(jsonData.dauid)) {
            matchingObjects.push(jsonData)
            console.log("/boundary-data: found id " + jsonData.dauid)
        }
    });
    parser.on('error', (err) => {
        console.error('Error parsing JSON:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
    stream.on('error', (err) => {
        console.error('Error reading JSON file:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
    stream.on('end', () => {
        // Return the matching objects
        console.log("/boundary-data: response");
        res.json(matchingObjects);
    })
});
app.get('/census-data', (req, res) => {
    res.sendFile(path.join(__dirname, censusDerivedDataFilePath), (err) => {
        if (err) {
            // If an error occurs while sending the file
            console.error(err);
            res.status(err.status).end();
        } else {
            console.log('File sent successfully');
        }
    });
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
