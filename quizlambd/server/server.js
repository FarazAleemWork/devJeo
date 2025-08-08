// Dependencies
console.log('✅ Server starting...');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pingRoute = require('./routes/ping');
const registerSocketHandlers = require('./socketHandlers'); 

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

const path = require('path');

 
const frontendPath = path.join(__dirname, '..', '..', 'quizlamfd');


// Serve static files from the frontend directory
app.use(express.static(frontendPath));

// // Serve index.html for the root route
// app.get('*', (req, res) => {
//    console.log('Fallback hit:', req.url);
//   res.sendFile(path.join(frontendPath, 'index.html'));
// });

app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.send('Test route works');
});

app.get('/{*any}', (req, res, next) => {
  try {
   console.log('Resolved index.html path:', path.join(frontendPath, 'index.html'));
    res.sendFile(path.join(frontendPath, 'index.html'));
  } catch (err) {
    console.error('Error sending index.html:', err);
    res.status(500).send('Internal Server Error');
  }
});


// Start the server
serverhttp.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');

  // Run test after server starts
  if (process.env.NODE_ENV === 'test') {
    require('../test');
  }
});
