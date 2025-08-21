// Import Express to create an HTTP server
// Search query: "Node.js express setup"
const express = require('express');

// Initialize Express application
// Search query: "Express.js create app"
const app = express();

// Define the port number for the server to listen on
const port = 3000;

// Import functions from app.js to handle browser operations
// Note: Using 'clear_cache_and_history' from revised app.js (not 'cleanUp')
// Search query: "Node.js require module"
const { open_browser, kill_browser, clear_cache_and_history } = require('./app');

// Root endpoint to serve a simple welcome message
// Search query: "Express.js handle GET request"
app.get('/', (req, res) => {
    // Log request for debugging
    console.log('Home page request received');
    // Send a plain text response
    res.send('Hello World!');
});

// API to open a URL in the specified browser
// Endpoint: /open?app=firefox&url=https://www.google.com
// Search query: "Express.js query parameters"
app.get('/open', async (req, res) => {
    // Log request for debugging
    console.log('/open request received');
    // Log query parameters (e.g., { app: 'firefox', url: 'https://www.google.com' })
    console.log('Query parameters:', req.query);

    // Extract browser and URL from query parameters (using 'app' to match requirements)
    const browser = req.query.app;
    const url = req.query.url;

    // Validate query parameters
    if (!browser || !url) {
        console.error('Missing required query parameters: app and url');
        return res.status(400).json({
            success: false,
            message: 'Missing required query parameters: app and url'
        });
    }

    try {
        // Call open_browser function from app.js
        const result = await open_browser(browser, url);
        // Send JSON response with success status and message
        res.status(result.code === 1 ? 200 : 500).json({
            success: result.code === 1,
            message: result.status || 'Browser opened successfully'
        });
    } catch (error) {
        // Handle unexpected errors (e.g., app.js throws an exception)
        console.error('Error in /open:', error.message);
        res.status(500).json({
            success: false,
            message: `Server error: ${error.message}`
        });
    }
});

// API to close the specified browser
// Endpoint: /close?app=chrome
app.get('/close', async (req, res) => {
    // Log request for debugging
    console.log('/close request received');
    // Log query parameters (e.g., { app: 'chrome' })
    console.log('Query parameters:', req.query);

    // Extract browser from query parameters
    const browser = req.query.app;

    // Validate query parameter
    if (!browser) {
        console.error('Missing required query parameter: app');
        return res.status(400).json({
            success: false,
            message: 'Missing required query parameter: app'
        });
    }

    try {
        // Call kill_browser function from app.js
        const result = await kill_browser(browser);
        // Send JSON response with success status and message
        res.status(result.code === 1 ? 200 : 500).json({
            success: result.code === 1,
            message: result.status || 'Browser closed successfully'
        });
    } catch (error) {
        // Handle unexpected errors
        console.error('Error in /close:', error.message);
        res.status(500).json({
            success: false,
            message: `Server error: ${error.message}`
        });
    }
});

// API to clear cache and history for the specified browser
// Endpoint: /clear?app=firefox
app.get('/clear', async (req, res) => {
    // Log request for debugging
    console.log('/clear request received');
    // Log query parameters (e.g., { app: 'firefox' })
    console.log('Query parameters:', req.query);

    // Extract browser from query parameters
    const browser = req.query.app;

    // Validate query parameter
    if (!browser) {
        console.error('Missing required query parameter: app');
        return res.status(400).json({
            success: false,
            message: 'Missing required query parameter: app'
        });
    }

    try {
        // Call clear_cache_and_history function from app.js
        const result = await clear_cache_and_history(browser);
        // Send JSON response with success status and message
        res.status(result.code === 1 ? 200 : 500).json({
            success: result.code === 1,
            message: result.status || 'Cache and history cleared successfully'
        });
    } catch (error) {
        // Handle unexpected errors
        console.error('Error in /clear:', error.message);
        res.status(500).json({
            success: false,
            message: `Server error: ${error.message}`
        });
    }
});

// Start the server and listen on the specified port
// Search query: "Express.js start server"
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});