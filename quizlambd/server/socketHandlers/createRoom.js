const { rooms } = require('../../data/rooms'); // your in-memory rooms store
const generateRoomId = require('../../utils/idGenerator');

const roomManager = require('../managers/roomManager');

function handleCreateRoom(socket, data, callback) {
  console.log(socket.id)
  const room = roomManager.createRoom(socket.id, data.playerName);

  socket.join(room.roomCode);
  socket.emit('roomCreated', { roomId: room.roomCode });

  callback({ room, player: room.host });
  console.log(`Room created: ${room.roomCode} by ${socket.id}`);
  console.log('Generated Room Code:', room.roomCode);
}


module.exports = handleCreateRoom;
