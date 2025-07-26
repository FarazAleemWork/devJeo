const roomManager = require('../managers/roomManager');

function handleJoinRoom(socket, data) {
  const joinResult = roomManager.joinRoom(data.roomCode, data.name, socket.id);

  if (joinResult.error) {
    socket.emit('error', { message: joinResult.error });
    return;
  }

  const { room, player } = joinResult;


  socket.join(data.roomCode);
  socket.emit('joinedRoom', { room, player });
  socket.to(data.roomCode).emit('playerJoined', { player });
  socket.to(data.roomCode).emit('roomUpdated', { room });

  socket.data.roomCode = data.roomCode;
  socket.data.playerName = data.name;
  
  console.log(`${data.name} successfully joined room ${data.roomCode}`);
}

module.exports = handleJoinRoom;
