// Exporting a function to handle socket disconnections
function handleDisconnect(socket) {
  console.log('Client disconnected:', socket.id);

  // Get the roomCode stored in socket.data 
  const roomCode = socket.data?.roomCode;
  const playerName = socket.data?.playerName;

  if (!roomCode) {
    console.warn('No roomCode found on socket disconnect');
    return;
  }

  // Remove player from playerManager or roomManager
  playerManager.removePlayer(socket.id);           // Optional: If you have a playerManager
  const updatedRoom = roomManager.leaveRoom(roomCode, socket.id);

  // Inform others in the room
  socket.to(roomCode).emit('playerLeft', {
    playerId: socket.id,
    playerName,
    room: updatedRoom,
  });

  rooms.setRoom(roomCode, updatedRoom);
}

module.exports = handleDisconnect;
