const rooms = require('../../data/rooms');
const { playerBuzz } = require('../managers/gameManager');

function handleBuzzIn(io, socket, data, callback) {
  const { roomCode, playerId } = data;
  const room = rooms.getRoom(roomCode);
  //const playerId = socket.id;

  if (!room) {
    socket.emit('buzzRejected', { message: 'Room not found' });
    callback({ error: 'Room not found' });
    console.log(`Buzz in failed: Room ${roomCode} not found`);
    return;
  }

  const result = playerBuzz(room, playerId);

  if (result.error) {
    socket.emit('buzzRejected', { message: result.error });
    callback({ error: result.error });
    console.log(`Buzz in failed for player ${playerId} in room ${roomCode}: ${result.error}`);
    return;
  }

  // Update room and broadcast buzz success
  rooms.setRoom(roomCode, result.objRoom);
  io.in(roomCode).emit('playerBuzzed', { playerId });

  callback({ success: true, playerId });
  console.log(`Player ${playerId} buzzed in room ${roomCode}`);
}

module.exports = handleBuzzIn;
