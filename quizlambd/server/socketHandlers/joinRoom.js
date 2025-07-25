//Exporting a function to handle joining a room
//This function will be called when a client joins a room
module.exports = function handleJoinRoom(socket, data) {
  console.log(`${data.name} joined room ${data.roomCode}`);
};
