// Exporting a function to handle socket disconnections
// This function will be called when a client disconnects from the server
module.exports = function handleDisconnect(socket) {
  console.log('Client disconnected:', socket.id);
};
