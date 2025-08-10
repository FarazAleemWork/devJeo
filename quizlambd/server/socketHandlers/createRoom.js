const { rooms } = require('../../data/rooms'); // your in-memory rooms store
const generateRoomId = require('../../utils/idGenerator');

const roomManager = require('../managers/roomManager');

function handleCreateRoom(socket, data, callback) {
  console.log(data)
  const room = roomManager.createRoom(data.playerName,socket.id);
  room.hostSocketId = socket.id;
  console.log('host socket id', room.hostSocketId);
  socket.join(room.roomCode);
  socket.emit('roomCreated', { roomId: room.roomCode }); 

  callback({ room, player: room.host });
  console.log(`Room created: ${room.roomCode} by ${socket.id}`);
  console.log('Generated Room Code:', room.roomCode);
}


module.exports = handleCreateRoom;
