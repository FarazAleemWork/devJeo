const rooms = require('../../data/rooms');
const gameManager = require('../managers/gameManager');

module.exports = function handleStartGame(socket, data, callback) {
  const { roomCode } = data;
  let objRoom = rooms.getRoom(roomCode);

  if (!objRoom) {
    socket.emit('errorMessage', { error: 'Room not found' });
    return;
  }

  const result = gameManager.startGame(objRoom);

  if (result.error) {
    socket.emit('errorMessage', { error: result.error });
  } else {
    objRoom = result.objRoom;
    rooms.setRoom(roomCode, objRoom);
    socket.to(roomCode).emit('gameStarted', objRoom);
    socket.emit('gameStarted', objRoom); // Send to host

    callback({ success: true, room: objRoom });
    console.log(`Game started in room ${roomCode}`);
  }
};
