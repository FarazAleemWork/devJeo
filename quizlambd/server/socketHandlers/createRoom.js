const { rooms } = require('../../data/rooms'); // your in-memory rooms store
const generateRoomId = require('../../utils/idGenerator');

function handleCreateRoom(socket, data) {
  // Generate a unique room ID
  const roomId = generateRoomId();

  // Create the new room object with initial state
  const newRoom = {
    id: roomId,
    hostId: socket.id,
    players: [],
    gameState: {}, // or whatever initial game state you want
  };

  // Store the new room
  rooms[roomId] = newRoom;

  // Let the creator join the room immediately
  socket.join(roomId);
  newRoom.players.push({ id: socket.id, name: data.playerName });

  // Emit confirmation to the creator with the new room ID
  socket.emit('roomCreated', { roomId });

  console.log(`Room created: ${roomId} by ${socket.id}`);
}

module.exports = handleCreateRoom;
