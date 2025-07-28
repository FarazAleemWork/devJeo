const rooms = require('../data/rooms');
const roomManager = require('../managers/roomManager');
const gameManager = require('../managers/gameManager');

const HOST_RECONNECT_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes
const hostReconnectTimers = {};

/**
 * Handle socket disconnect event
 * Marks player/host disconnected, starts host timeout if needed
 */
function handleDisconnect(socket) {
  const roomCode = socket.data?.roomCode;
  const playerId = socket.data?.playerId;

  if (!roomCode || !playerId) {
    console.warn('Disconnect: missing roomCode or playerId');
    return;
  }

  const room = rooms.getRoom(roomCode);
  if (!room) return;

  // Mark player or host disconnected
  roomManager.markPlayerDisconnected(roomCode, playerId);

  if (room.host.id === playerId) {
    // Start host reconnect timer
    if (hostReconnectTimers[roomCode]) {
      clearTimeout(hostReconnectTimers[roomCode]);
    }

    hostReconnectTimers[roomCode] = setTimeout(() => {
      if (roomManager.isHostDisconnected(roomCode)) {
        console.log(`Host did not reconnect to room ${roomCode}, ending game`);

        gameManager.endGame(room);
        rooms.deleteRoom(roomCode);

        // Notify remaining players that game ended due to host disconnect
        socket.to(roomCode).emit('gameEnded', { reason: 'hostDisconnected' });
      }
      delete hostReconnectTimers[roomCode];
    }, HOST_RECONNECT_TIMEOUT_MS);

    // Notify players host disconnected
    socket.to(roomCode).emit('hostDisconnected', {
      hostId: playerId,
      message: 'Host has disconnected but may reconnect soon',
    });
  } else {
    // Notify players a player disconnected
    socket.to(roomCode).emit('playerDisconnected', {
      playerId,
      message: 'A player has disconnected but may reconnect soon',
    });
  }
}

module.exports = {
  handleDisconnect,
  hostReconnectTimers,
};
