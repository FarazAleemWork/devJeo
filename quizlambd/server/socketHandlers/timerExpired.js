const rooms = require('../../data/rooms');
const gameManager = require('../managers/gameManager');

module.exports = function handleTimeExpired(socket, data) {
  const { roomCode } = data;
  let objRoom = rooms.getRoom(roomCode);

  if (!objRoom) {
    socket.emit('errorMessage', { error: 'Room not found' });
    return;
  }

  const result = gameManager.timeExpired(objRoom);
  objRoom = result.objRoom;
  rooms.setRoom(roomCode, objRoom);

  socket.to(roomCode).emit('timeExpired', { nextIndex: objRoom.currentQuestionIndex });
  socket.emit('timeExpired', { nextIndex: objRoom.currentQuestionIndex }); // Optional
};
