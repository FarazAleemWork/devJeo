//This file registers socket event handlers for the quizlambd server
//It imports individual handler functions and sets them up to listen for specific events
const handleJoinRoom = require('./joinRoom');
const handleDisconnect = require('./disconnect');
const handleCreateRoom = require('./createRoom'); 
const handleAwardPoints = require('./awardPoints');
const handleBuzzIn = require('./buzzIn'); 
const handleStartGame = require('./startGame');
const hadnleTimerExpired = require('./timerExpired');

module.exports = function registerSocketHandlers(socket) {
  socket.on('joinRoom', (data) => handleJoinRoom(socket, data));
  socket.on('disconnect', () => handleDisconnect(socket));
  socket.on('createRoom', (data) => handleCreateRoom(socket, data));
  socket.on('awardPoints', (data) => handleAwardPoints(io, socket, data));
  socket.on('buzzIn', (data) => handleBuzzIn(io, socket, data));
  socket.on('startGame', (data) => handleStartGame(socket, data));
  socket.on('timerExpired', (data) => hadnleTimerExpired(socket, data));
};
