//Only host can award points to players

//This function handles awarding points to players in a room
function handleAwardPoints(socket, data) {
  const { roomId, playerId, points } = data;
  const room = rooms[roomId];
  if (!room) return;

  //Update score manually, no auto-checking
  room.gameState.scores = room.gameState.scores || {};
  room.gameState.scores[playerId] = (room.gameState.scores[playerId] || 0) + points;

  //Emit updated scores to all players in the room
  io.in(roomId).emit('gameStateUpdate', room.gameState);
}
