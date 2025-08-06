const rooms = require('../../data/rooms');

function handleAwardPoints(io, socket, data, callback) {
  const { roomCode, playerId, points } = data;
  const room = rooms.getRoom(roomCode);
  if (!room) return;
  console.log('host id:', room.hostId, 'data playerId:', data.playerId);
  // Ensure only host can award points
  // if (room.hostId !== data.playerId) {
  //   socket.emit('error', { message: 'Only the host can award points.' });
  //   return;
  // }

  // Update scores
  room.gameState.scores = room.gameState.scores || {};
  room.gameState.scores[playerId] = (room.gameState.scores[playerId] || 0) + points;

  // Save and emit update
  rooms.setRoom(roomCode, room);
  io.in(roomCode).emit('gameStateUpdate', room.gameState.status);

  callback({ success: true, playerId, points });
  console.log(`Awarded ${points} points to player ${playerId} in room ${roomCode}`);
  socket.emit('pointsAwarded', { playerId, points });
}

module.exports = handleAwardPoints;
