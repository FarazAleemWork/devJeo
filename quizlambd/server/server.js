const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pingRoute = require('./routes/ping');
const registerSocketHandlers = require('./socketHandlers'); // New!

const app = express();
const serverhttp = http.createServer(app);

const io = new Server(serverhttp, {
  cors: {
    origin: '*',
  }
});

// Routes
app.use('/api/ping', pingRoute);

// Sockets
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  registerSocketHandlers(socket); // Loads all handlers

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

serverhttp.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
