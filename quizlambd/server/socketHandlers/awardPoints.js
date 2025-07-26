const rooms = require('../../data/rooms');

function handleAwardPoints(io, socket, data) {
  const { roomId, playerId, points } = data;
  const room = rooms.getRoom(roomId);
  if (!room) return;

  // Ensure only host can award points
  if (room.hostId !== socket.id) {
    socket.emit('error', { message: 'Only the host can award points.' });
    return;
  }

  // Update scores
  room.gameState.scores = room.gameState.scores || {};
  room.gameState.scores[playerId] = (room.gameState.scores[playerId] || 0) + points;

  // Save and emit update
  rooms.setRoom(roomId, room);
  io.in(roomId).emit('gameStateUpdate', room.gameState);
}

module.exports = handleAwardPoints;
