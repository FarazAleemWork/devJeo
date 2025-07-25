//Import express and create a router
const express = require('express');
const router = express.Router();

// Define a simple ping route
// This route will respond with a message to confirm the server is running
router.get('/', (req, res) => {
  res.send('PONG! Server is running.');
});

// Export the router to be used in the main server file
// This allows the main server file to include this route
module.exports = router;
