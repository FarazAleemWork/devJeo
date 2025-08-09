//This file registers socket event handlers for the quizlambd server
//It imports individual handler functions and sets them up to listen for specific events
const handleJoinRoom = require('./joinRoom');
const handleDisconnect = require('./disconnect');
const handleCreateRoom = require('./createRoom'); 
const handleAwardPoints = require('./awardPoints');
const handleBuzzIn = require('./buzzIn'); 
const handleStartGame = require('./startGame');
const handleTimerExpired = require('./timerExpired');
const handleSelectQuestion = require('./selectQuestion');
const handleReconnect = require('./reconnect');



module.exports = function registerSocketHandlers(socket) {
  socket.on('joinRoom', (data, callback) => handleJoinRoom(socket, data, callback));
  socket.on('disconnect', (callback) => handleDisconnect(socket, callback));
  socket.on('createRoom', (data, callback) => handleCreateRoom(socket, data, callback));
  socket.on('awardPoints', (data, callback) => handleAwardPoints(io, socket, data, callback));
  socket.on('buzzIn', (data, callback) => handleBuzzIn(io, socket, data, callback));
  socket.on('startGame', (data, callback) => handleStartGame(socket, data, callback));
  socket.on('timerExpired', (data) => handleTimerExpired(socket, data));
  socket.on('reconnectPlayer', (data) => handleReconnect(socket, data));
  socket.on('selectQuestion', (data, callback) => handleSelectQuestion(io, socket, data, callback))
}; 

