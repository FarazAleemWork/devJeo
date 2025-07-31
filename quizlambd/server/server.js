// Dependencies
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pingRoute = require('./routes/ping');
const registerSocketHandlers = require('./socketHandlers'); // New!

// Initialize express app and http server
const app = express();
const serverhttp = http.createServer(app);

// Initialize socket.io
const io = new Server(serverhttp, {
  cors: {
    origin: '*',
  }
});

// Make io accessible to handlers that need it (optional global or module export)
global.io = io;

// Routes
app.use('/api/ping', pingRoute);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  registerSocketHandlers(socket); // Load all socket events
});

// Start the server
serverhttp.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');

  // Run test after server starts
  if (process.env.NODE_ENV === 'test') {
    require('../test'); // Make sure this is your testGameFlow.js or similar
  }
});
