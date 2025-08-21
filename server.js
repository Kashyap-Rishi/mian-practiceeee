

// Import the Express framework for building the web server.
const express = require('express');
// Create an Express application instance.
const app = express();
// Define the port number (3000) for the server to listen on.
const port = 3000;

// Import the handleSSE function from index.js to handle SSE for /log endpoint.
const { handleSSE } = require('./index');

// Define a GET route for the root endpoint (/).
app.get('/', (req, res) => {
    // Log a message to the console for debugging when the root endpoint is accessed.
    console.log('home page req');
    // Send a plain text response "Hello World!" to the client.
    res.send('Hello World!');
});

// Define a GET route for the /log endpoint to stream log updates.
app.get('/log', handleSSE);

// Start the server and listen on the specified port.
app.listen(port, () => {
    // Log a message to confirm the server is running and listening.
    console.log(`Example app listening on port ${port}`);
});