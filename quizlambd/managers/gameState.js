function initializeBoard(room) {
  // Example: 3x3 empty board (like for tic-tac-toe)
  room.board = Array(3).fill(null).map(() => Array(3).fill(null));
}

function startGame(room) {
  room.gameState = 'playing';
  initializeBoard(room);
}

function endGame(room) {
  room.gameState = 'ended';
}

module.exports = {
  initializeBoard,
  startGame,
  endGame
};
