// /models/room.js
function createRoom(roomCode, hostId, hostName) {
  return {
    roomCode,
    host: {
      id: hostId,
      name: hostName,
    },
    players: [],
    gameState: 'waiting',
    board: [],
    gameStarted: false,
    currentQuestionIndex: 0,
    questions: [],
    currentTurn: null,
    chat: [],
    maxPlayers: 5,
    status: 'waiting'
  };
}

module.exports = { createRoom };
/**
 * This module manages game rooms, allowing players to create, join, and leave rooms.
 * It also handles room state and player management.
 */