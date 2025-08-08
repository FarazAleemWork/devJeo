const rooms = require('../../data/rooms');
const { generateRoomCode, generatePlayerId } = require('../../utils/idGenerator');
const { createRoom: createRoomModel } = require('../../models/room');
const gameManager = require('./gameManager'); // Needed for endGame()

/**
 * Retrieves a room by its code.
 * @param {string} roomCode - The code of the room to retrieve.
 * @returns {Object|null} - The room object or null if not found.
 */
function getRoom(roomCode) {
  return rooms.getRoom(roomCode) || null;
}

/**
 * Creates a new room with a host and initial configuration.
 * @param {string} hostName - The name of the host.
 * @returns {Object} - The created room object.
 */
function createRoom(hostName) {
  let roomCode;
  do {
    roomCode = generateRoomCode();
  } while (rooms.getRoom(roomCode));

  const hostId = generatePlayerId();
  const room = createRoomModel(roomCode, hostId, hostName);

  // Add extra properties for tracking disconnections
  room.hostDisconnected = false;

  rooms.setRoom(roomCode, room);
  return room;
}

/**
 * Adds a player to a room.
 * @param {string} roomCode - The code of the room.
 * @param {string} name - The name of the player.
 * @returns {Object} - The updated room and player details, or an error object.
 */
function joinRoom(roomCode, name) {
  const room = getRoom(roomCode);
  if (!room) return { error: 'Room not found' };

  if (room.host.name === name) {
    return { error: 'Name already taken by host' };
  }

  const isNameTaken = room.players.some(p => p.name === name);
  if (isNameTaken) {
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
 * Marks a player as disconnected (soft disconnect).
 * @param {string} roomCode - The code of the room.
 * @param {string} playerId - The ID of the player to mark as disconnected.
 * @returns {Object|null} - The updated room or null if the room is not found.
 */
function markPlayerDisconnected(roomCode, playerId) {
  const room = getRoom(roomCode);
  if (!room) return null;

  if (room.host.id === playerId) {
    room.hostDisconnected = true;
  } else {
    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.connected = false;
    }
  }
  rooms.setRoom(roomCode, room);
  return room;
}

/**
 * Removes a player from the room permanently (full leave).
 * @param {string} roomCode - The code of the room.
 * @param {string} playerId - The ID of the player to remove.
 * @returns {Object|null} - The updated room or null if the room is deleted.
 */
function leaveRoom(roomCode, playerId) {
  const room = getRoom(roomCode);
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
 * Handles player reconnect by playerId.
 * @param {string} roomCode - The code of the room.
 * @param {string} playerId - The ID of the player reconnecting.
 * @returns {Object} - The updated room and player details, or an error object.
 */
function reconnectPlayer(roomCode, playerId) {
  const room = getRoom(roomCode);
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
 * Checks if the host is disconnected.
 * @param {string} roomCode - The code of the room.
 * @returns {boolean} - True if the host is disconnected, false otherwise.
 */
function isHostDisconnected(roomCode) {
  const room = getRoom(roomCode);
  return room ? room.hostDisconnected === true : false;
}

/**
 * Retrieves the current room state.
 * @param {string} roomCode - The code of the room.
 * @returns {Object} - The room state or an error object.
 */
function getRoomState(roomCode) {
  const room = getRoom(roomCode);
  return room ? room : { error: 'Room not found' };
}

/**
 * Get room details by room code
 */
function getRoom(roomCode) {
  return rooms.getRoom(roomCode); // Delegate to rooms.js
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
