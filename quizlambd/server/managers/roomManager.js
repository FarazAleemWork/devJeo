const rooms = require('../../data/rooms');
const { generateRoomCode, generatePlayerId } = require('../../utils/idGenerator');
const { createRoom: createRoomModel } = require('../../models/room');
const gameManager = require('./gameManager'); // Needed for endGame()

/**
 * Create a new room with a host and initial config
 */
function createRoom(hostName) {
  let roomCode;
  do {
    roomCode = generateRoomCode();
  } while (rooms.getRoom(roomCode));

  const hostId = generatePlayerId();
  const objRoom = createRoomModel(roomCode, hostId, hostName);

  // Add extra properties for tracking disconnections
  objRoom.hostDisconnected = false;

  rooms.setRoom(roomCode, objRoom);
  return objRoom;
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
    score: 0,
    connected: true // New players are connected by default
  };

  room.players.push(newPlayer);
  rooms.setRoom(roomCode, room);
  return { room, player: newPlayer };
}

/**
 * Mark a player as disconnected (soft disconnect)
 */
function markPlayerDisconnected(roomCode, playerId) {
  const room = rooms.getRoom(roomCode);
  if (!room) return;

  if (room.host.id === playerId) {
    room.hostDisconnected = true;
  } else {
    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.connected = false;
    }
  }
  rooms.setRoom(roomCode, room);
}

/**
 * Remove a player from the room permanently (full leave)
 */
function leaveRoom(roomCode, playerId) {
  const room = rooms.getRoom(roomCode);
  if (!room) return null;

  // If host leaves, delete the room immediately
  if (room.host.id === playerId) {
    rooms.deleteRoom(roomCode);
    return null;
  }

  // Remove the player fully
  room.players = room.players.filter(p => p.id !== playerId);

  // If no players remain, end game and delete room
  if (room.players.length === 0) {
    gameManager.endGame(room);
    rooms.deleteRoom(roomCode);
    return null;
  }

  rooms.setRoom(roomCode, room);
  return room;
}

/**
 * Handle player reconnect by playerId
 */
function reconnectPlayer(roomCode, playerId) {
  const room = rooms.getRoom(roomCode);
  if (!room) return { error: 'Room not found' };

  if (room.host.id === playerId) {
    room.hostDisconnected = false; // Host has returned
    rooms.setRoom(roomCode, room);
    return { room, role: 'host', player: room.host };
  }

  const player = room.players.find(p => p.id === playerId);
  if (!player) return { error: 'Player not found' };

  player.connected = true; // Mark player reconnected
  rooms.setRoom(roomCode, room);
  return { room, role: 'player', player };
}

/**
 * Check if host is disconnected
 */
function isHostDisconnected(roomCode) {
  const room = rooms.getRoom(roomCode);
  return room ? room.hostDisconnected === true : false;
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
  markPlayerDisconnected,
  leaveRoom,
  reconnectPlayer,
  isHostDisconnected,
  getRoomState
};
