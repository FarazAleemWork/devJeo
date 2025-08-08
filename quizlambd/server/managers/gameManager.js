// Constants
const BUZZ_TIMEOUT_MS = 7000;
const QUESTION_TIMEOUT_MS = 30000;

/**
 * Generates a set of questions for the game.
 * @returns {Array} - Array of question objects.
 */
function generateQuestions() {
  return [
    { question: "What is the capital of France?", options: ["Paris", "Berlin", "Rome", "Madrid"], correctAnswer: "Paris" },
    { question: "What is 2 + 2?", options: ["3", "4", "5", "6"], correctAnswer: "4" },
    { question: "What color is the sky?", options: ["Blue", "Green", "Red", "Yellow"], correctAnswer: "Blue" }
  ];
}

/**
 * Resets the buzz state for the room.
 * @param {Object} objRoom - The room object.
 */
function resetBuzzState(objRoom) {
  objRoom.buzzOpen = false;
  objRoom.buzzedPlayerId = null;
  objRoom.buzzedPlayers = [];
  objRoom.buzzAnswerStartTime = null;
}

/**
 * Starts the game by initializing the room state.
 * @param {Object} objRoom - The room object.
 * @returns {Object} - Updated room object or error.
 */
function startGame(objRoom) {
  objRoom.questions = generateQuestions();
  objRoom.gameStarted = true;
  objRoom.currentQuestionIndex = 0;

  if (objRoom.players.length === 0) {
    objRoom.status = 'waiting';
    return { error: 'No players in room' };
  }

  objRoom.status = 'playing';
  objRoom.currentTurn = null;
  objRoom.questionStartTime = null;
  objRoom.buzzTimeoutMs = BUZZ_TIMEOUT_MS;
  objRoom.questionTimeoutMs = QUESTION_TIMEOUT_MS;
  resetBuzzState(objRoom);

  return { objRoom };
}

/**
 * Opens buzzing for the current question.
 * @param {Object} objRoom - The room object.
 * @returns {Object} - Updated room object.
 */
function openBuzzing(objRoom) {
  objRoom.buzzOpen = true;
  objRoom.buzzedPlayerId = null;
  objRoom.buzzAnswerStartTime = null;
  objRoom.questionStartTime = Date.now();
  objRoom.buzzedPlayers = [];
  return objRoom;
}

/**
 * Handles a player's buzz.
 * @param {Object} objRoom - The room object.
 * @param {string} playerId - The ID of the player buzzing.
 * @returns {Object} - Result of the buzz attempt.
 */
function playerBuzz(objRoom, playerId) {
  const now = Date.now();

  if (!objRoom.buzzOpen) return { error: 'Buzzing is closed' };

  if (now - objRoom.questionStartTime > objRoom.questionTimeoutMs) {
    resetBuzzState(objRoom);
    return { error: 'Time is up for this question' };
  }

  if (objRoom.buzzedPlayers.includes(playerId)) {
    return { error: 'You already buzzed and answered/skipped' };
  }

  if (objRoom.buzzedPlayerId) {
    return { error: 'Someone already buzzed and is answering' };
  }

  objRoom.buzzedPlayerId = playerId;
  objRoom.buzzAnswerStartTime = now;
  objRoom.buzzOpen = false;

  return { success: true, playerId, objRoom };
}

/**
 * Submits an answer for the current question.
 * @param {Object} objRoom - The room object.
 * @param {string} playerId - The ID of the player submitting the answer.
 * @param {string} answer - The player's answer.
 * @returns {Object} - Result of the answer submission.
 */
function submitAnswer(objRoom, playerId, answer) {
  const now = Date.now();

  if (!objRoom.gameStarted || objRoom.status !== 'playing') {
    return { error: 'Game not active' };
  }

  if (objRoom.buzzedPlayerId !== playerId) {
    return { error: 'Not your turn to answer' };
  }

  if (now - objRoom.buzzAnswerStartTime > objRoom.buzzTimeoutMs) {
    objRoom.buzzedPlayers.push(playerId);
    resetBuzzState(objRoom);
    objRoom.buzzOpen = true;
    return { timeout: true, message: 'Answer time expired, buzzing reopened', objRoom };
  }

  const question = objRoom.questions[objRoom.currentQuestionIndex];
  const player = objRoom.players.find(p => p.id === playerId);
  if (!player) return { error: 'Player not found' };

  const isCorrect = question.correctAnswer === answer;
  if (isCorrect) {
    player.score += 1;
    objRoom.currentQuestionIndex += 1;

    objRoom.status = objRoom.currentQuestionIndex >= objRoom.questions.length ? 'ended' : 'playing';
    objRoom.gameStarted = objRoom.status !== 'ended';
    resetBuzzState(objRoom);
    return { correct: true, questionEnded: true, isGameOver: objRoom.status === 'ended', objRoom };
  }

  objRoom.buzzedPlayers.push(playerId);
  objRoom.buzzOpen = true;
  return { correct: false, questionEnded: false, message: 'Wrong answer, buzzing reopened', objRoom };
}

/**
 * Selects a question for the game.
 * @param {Object} objRoom - The room object.
 * @param {number} questionIndex - The index of the question to select.
 * @param {string} hostId - The ID of the host selecting the question.
 * @param {Object} io - The socket.io instance for broadcasting events.
 * @returns {Object} - Result of the question selection.
 */
function selectQuestion(objRoom, questionIndex, hostId, io) {
  if (!objRoom.host || objRoom.host.id !== hostId) {
    return { error: 'Only the host can select questions.' };
  }

  if (!objRoom.questions || questionIndex >= objRoom.questions.length) {
    return { error: 'Invalid question index.' };
  }

  objRoom.currentQuestionIndex = questionIndex;
  objRoom.status = 'playing';
  objRoom.questionStartTime = Date.now();
  resetBuzzState(objRoom);
  objRoom.buzzOpen = true;

  if (objRoom.questionTimer) {
    clearTimeout(objRoom.questionTimer);
  }

  objRoom.questionTimer = setTimeout(() => {
    resetBuzzState(objRoom);
    io.to(objRoom.code).emit('questionTimedOut', {
      message: 'Time is up for this question!',
      room: objRoom
    });
  }, objRoom.questionTimeoutMs);

  return { success: true, objRoom };
}

/**
 * Ends the game and resets the room state.
 * @param {Object} objRoom - The room object.
 * @returns {Object} - Result of the game end.
 */
function endGame(objRoom) {
  objRoom.status = 'ended';
  objRoom.gameStarted = false;
  resetBuzzState(objRoom);
  objRoom.questionStartTime = null;

  if (objRoom.questionTimer) {
    clearTimeout(objRoom.questionTimer);
    objRoom.questionTimer = null;
  }

  return { success: true, message: 'Game has ended', objRoom };
}

module.exports = {
  startGame,
  openBuzzing,
  playerBuzz,
  submitAnswer,
  selectQuestion,
  endGame
};
