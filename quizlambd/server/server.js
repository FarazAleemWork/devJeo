//Dependencies
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pingRoute = require('./routes/ping');
const registerSocketHandlers = require('./socketHandlers'); // New!

//Initialize express app and http server
const app = express();
const serverhttp = http.createServer(app);

// Initialize socket.io with the http server
// This allows socket.io to listen for incoming connections on the same port as the HTTP server
const io = new Server(serverhttp, {
  cors: {
    origin: '*',
  }
});

// Routes
app.use('/api/ping', pingRoute);

// Socket.io connection handler
// This function will be called whenever a new client connects to the server
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  registerSocketHandlers(socket); // Loads all handlers
});

// Start the server
serverhttp.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
