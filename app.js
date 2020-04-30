/**
 * Project  :   noise_pollution
 * Author   :   L.D
 * Version  :   0.0.2
 * Desc.    :   Main app logic, serves Express server with API
 */

// Dependencies
const express = require('express');
const portfinder = require('portfinder');
const fetch = require('node-fetch');
const getDistanceFromLatLonInKm = require('./js/latlon');

// Constants
const frEndpoint = 'https://www.flightradar24.com/_json/airports.php';

// Instantiate web server
const app = express();

// Airports JSON data
let airports = {};

/**
 * Serve airports API
 * @returns json
 */
app.get('/api/airports', (req, res) => {
    // Prepare return data array
    const returnData = {airports: []};

    // Get request data
    const userLat = Number(req.query.lat);
    const userLng = Number(req.query.lng);
    const userDist = Number(req.query.dist);

    // Get airports within distance
    airports.forEach(airport => {
        const distBetweenLocAndAirport = getDistanceFromLatLonInKm(userLat, userLng, airport.lat, airport.lon);
        if (distBetweenLocAndAirport <= userDist) {
            returnData.airports.push({name: airport.name, distance: distBetweenLocAndAirport, lat: airport.lat, lon: airport.lon});
        }
    });
    
    // Return data
    res.json(returnData);
});

// Serve static content
app.use(express.static(__dirname));

// Fetch airports data from Flightradar24 API
fetch(frEndpoint)
    .then((response) => {
        airports = response.json()
            .then((json) => {
                airports = json['rows'];
                console.log('Fetched airports');
            });
    })
    .catch((err) => {
        console.error("Couldn't fetch airports data. Quitting");
        process.exit();
    });

// Listen on first port available
portfinder.getPortPromise()
    .then((foundPort) => {
        let server = app.listen(foundPort, () => {
            const host = server.address().address;
            const port = server.address().port;
            console.log("App listening at http://%s:%s", host, port);
        });
    })
    .catch((err) => {
        console.error("Can't find available port within %s and %s", portfinder.basePort, portfinder.highestPort);
    });