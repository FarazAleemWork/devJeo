// Constants
const BOARD_SIZE = 3;

/**
 * Initializes the game board.
 * @param {Object} objRoom - The room object to initialize the board for.
 */
function initializeBoard(objRoom) {
  if (!objRoom) throw new Error('Invalid room object');
  objRoom.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  return objRoom;
}

/**
 * Starts the game by setting the game state and initializing the board.
 * @param {Object} objRoom - The room object to start the game for.
 */
function startGame(objRoom) {
  if (!objRoom) throw new Error('Invalid room object');
  objRoom.gameState = 'playing';
  initializeBoard(objRoom);
  return objRoom;
}

/**
 * Ends the game by updating the game state.
 * @param {Object} objRoom - The room object to end the game for.
 */
function endGame(objRoom) {
  if (!objRoom) throw new Error('Invalid room object');
  objRoom.gameState = 'ended';
  return objRoom;
}

module.exports = {
  initializeBoard,
  startGame,
  endGame
};