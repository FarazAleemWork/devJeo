const handleJoinRoom = require('./joinRoom');
const handleDisconnect = require('./disconnect');
const handleCreateRoom = require('./createRoom'); 

module.exports = function registerSocketHandlers(socket) {
  socket.on('joinRoom', (data) => handleJoinRoom(socket, data));
  socket.on('disconnect', () => handleDisconnect(socket));
  socket.on('createRoom', (data) => handleCreateRoom(socket, data));
};
