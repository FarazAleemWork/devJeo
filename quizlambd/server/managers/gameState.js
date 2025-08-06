function initializeBoard(objobjRoom) {
  // Example: 3x3 empty board (like for tic-tac-toe)
  objobjRoom.board = Array(3).fill(null).map(() => Array(3).fill(null));
}

function startGame(objRoom) {
  objRoom.gameState.status = 'playing';
  initializeBoard(objRoom);
}

function endGame(objRoom) {
  objRoom.gameState.status = 'ended';
}

module.exports = {
  initializeBoard,
  startGame,
  endGame
};
