const rooms = require('../../data/rooms');
const { playerBuzz } = require('../managers/gameManager');

function handleBuzzIn(io, socket, data) {
  const { roomId } = data;
  const playerId = socket.id;

  const room = rooms.getRoom(roomId);
  if (!room) {
    socket.emit('buzzRejected', { message: 'Room not found' });
    return;
  }

  const result = playerBuzz(room, playerId);

  if (result.error) {
    socket.emit('buzzRejected', { message: result.error });
    return;
  }

  // Update room and broadcast buzz success
  rooms.setRoom(roomId, result.objRoom);
  io.in(roomId).emit('playerBuzzed', { playerId });
}

module.exports = handleBuzzIn;
