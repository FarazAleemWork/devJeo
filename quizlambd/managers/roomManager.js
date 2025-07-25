const rooms = require('../../data/rooms');
const { generateRoomCode, generatePlayerId } = require('../../utils/idGenerator');

/**
 * Create a new room with a non-playing host
 */
function createRoom(hostName) {
  let roomCode;
  do {
    roomCode = generateRoomCode();
  } while (rooms.getRoom(roomCode));

  const room = {
    code: roomCode,
    host: {
      id: generatePlayerId(),
      name: hostName
    },
    players: [],
    gameState: 'waiting',
    board: []
  };

  rooms.setRoom(roomCode, room);
  return room;
}

/**
 * Player joins a room
 */
function joinRoom(roomCode, name) {
  const room = rooms.getRoom(roomCode);
  if (!room) return { error: 'Room not found' };

  if (room.host.name === name) {
    return { error: 'Name already taken by host' };
  }

  const isDuplicate = room.players.find(p => p.name === name);
  if (isDuplicate) {
    return { error: 'Name already taken' };
  }

  const newPlayer = {
    id: generatePlayerId(),
    name,
    score: 0
  };

  room.players.push(newPlayer);
  rooms.setRoom(roomCode, room);
  return { room, player: newPlayer };
}

/**
 * Player or host leaves room
 */
function leaveRoom(roomCode, playerId) {
  const room = rooms.getRoom(roomCode);
  if (!room) return;

  // If host leaves, delete the room
  if (room.host.id === playerId) {
    rooms.deleteRoom(roomCode);
    return;
  }

  room.players = room.players.filter(p => p.id !== playerId);

  if (room.players.length === 0) {
    rooms.deleteRoom(roomCode);
  } else {
    rooms.setRoom(roomCode, room);
  }
}

/**
 * Get the current room state
 */
function getRoomState(roomCode) {
  const room = rooms.getRoom(roomCode);
  return room ? room : { error: 'Room not found' };
}

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomState
};
