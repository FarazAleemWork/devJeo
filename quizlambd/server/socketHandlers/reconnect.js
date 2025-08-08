const rooms = require('../../data/rooms');
const roomManager = require('../managers/roomManager');

const hostReconnectTimers = require('./disconnect').hostReconnectTimers;

function handleReconnect(socket, data) {
  const { roomCode, playerId } = data;

  if (!roomCode || !playerId) {
    socket.emit('error', 'Missing roomCode or playerId');
    return;
  }

  const room = rooms.getRoom(roomCode);
  if (!room) {
    socket.emit('error', 'Room not found');
    return;
  }

  if (room.host.id === playerId) {
    // Host reconnect
    room.hostDisconnected = false;
    if (hostReconnectTimers[roomCode]) {
      clearTimeout(hostReconnectTimers[roomCode]);
      delete hostReconnectTimers[roomCode];
    }
    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    socket.data.playerId = playerId;
    rooms.setRoom(roomCode, room);

    socket.emit('reconnected', { room, role: 'host' });
    socket.to(roomCode).emit('hostReconnected', {
      hostId: playerId,
      message: 'Host has reconnected',
    });
  } else {
    // Player reconnect
    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      socket.emit('error', 'Player not found in room');
      return;
    }
    player.connected = true;

    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    socket.data.playerId = playerId;

    rooms.setRoom(roomCode, room);

    socket.emit('reconnected', { room, role: 'player' });
    socket.to(roomCode).emit('playerReconnected', {
      playerId,
      playerName: player.name,
      message: `${player.name} has reconnected`,
    });
  }
}

module.exports = handleReconnect;
