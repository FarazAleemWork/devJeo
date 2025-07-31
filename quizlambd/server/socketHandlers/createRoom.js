const { rooms } = require('../../data/rooms'); // your in-memory rooms store
const generateRoomId = require('../../utils/idGenerator');

const roomManager = require('../managers/roomManager');

function handleCreateRoom(socket, data) {
  const room = roomManager.createRoom(data.playerName, socket.id);

  socket.join(room.code);
  socket.emit('roomCreated', { roomId: room.code });

  console.log(`Room created: ${room.code} by ${socket.id}`);
}


module.exports = handleCreateRoom;
