/**
 * @fileoverview A simple Express application that integrates with the HubSpot API.
 * Fetches custom object data (e.g., pet details) and allows updating them via a form.
 * @module
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

// Environment variable for HubSpot API authorization
const privateAppAccess = process.env.PRIVATE_APP_ACCESS_TOKEN;

// The custom object ID used in HubSpot CRM API
const customObjectId = '2-42445264';

// Base URL for HubSpot API
const baseUrl = 'https://api.hubapi.com';

// HTTP headers required for making API requests to HubSpot
const headers = {
    Authorization: `Bearer ${privateAppAccess}`,
    'Content-Type': 'application/json'
};

// URL endpoint for fetching and updating the custom object
const url = `${baseUrl}/crm/v3/objects/${customObjectId}/?limit=100`;

// Port for the Express server to listen on
const port = process.env.PORT || 3000;

// Setting up Express view engine (Pug)
app.set('view engine', 'pug');

// Middleware to serve static files and parse request bodies
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * @function
 * @name getPets
 * @description Fetches pet data from HubSpot CRM using the HubSpot API and renders it in a homepage.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
app.get('/', async (req, res) => {
    const params = {
        properties: 'name,type,bio'  // Properties to fetch
    };
    try {
        // Fetching data from the HubSpot API
        const response = await axios.get(url, { params, headers });
        const pets = response.data.results;

        // Rendering homepage with the fetched pet data
        res.render('homepage', { pets });
    } catch (error) {
        console.error(error);
        res.send('Error fetching data');
    }
});

/**
 * @function
 * @name updatePetForm
 * @description Renders the update custom object form for updating pet details.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
app.get('/update-cobj', (req, res) => {
    res.render('updates', { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum' });
});

/**
 * @function
 * @name updatePetDetails
 * @description Receives updated pet data from the form and posts it to HubSpot API.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
app.post('/update-cobj', async (req, res) => {
    const data = {
        properties: req.body  // Data from the form
    };

    try {
        // Posting the updated data to HubSpot API
        await axios.post(url, data, { headers });
        res.redirect('/');  // Redirecting to the homepage after update
    } catch (error) {
        console.error(error);
        res.send('Error updating data');
    }
});

// Starting the Express server
app.listen(port, () => {
    console.log(`'Listening on http://localhost:${port}`);
});
