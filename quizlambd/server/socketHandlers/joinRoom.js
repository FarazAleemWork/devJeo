module.exports = function handleJoinRoom(socket, data) {
  console.log(`${data.name} joined room ${data.roomCode}`);
  // You can expand this with room logic later
};
