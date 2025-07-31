function initializeBoard(objobjRoom) {
  // Example: 3x3 empty board (like for tic-tac-toe)
  objobjRoom.board = Array(3).fill(null).map(() => Array(3).fill(null));
}

function startGame(objobjRoom) {
  objRoom.gameState = 'playing';
  initializeBoard(objRoom);
}

function endGame(objRoom) {
  objRoom.gameState = 'ended';
}

module.exports = {
  initializeBoard,
  startGame,
  endGame
};
