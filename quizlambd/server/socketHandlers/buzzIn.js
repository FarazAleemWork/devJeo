//Function to handle buzz-in events
function handleBuzzIn(socket, data) {
  const { roomId, playerId } = data;
  const room = rooms[roomId];
  if (!room) return;

  //Check if anotherer player has already buzzed in
  if (room.currentBuzz) {
    socket.emit('buzzRejected', { message: 'Someone already buzzed' });
    return;
  }

  //Set the current player as the one who buzzed in
  room.currentBuzz = playerId;
  io.in(roomId).emit('playerBuzzed', { playerId });
}
