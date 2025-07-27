// gameManager.js

function generateQuestions() {
  return [
    {
      question: "What is the capital of France?",
      options: ["Paris", "Berlin", "Rome", "Madrid"],
      correctAnswer: "Paris"
    },
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: "4"
    },
    {
      question: "What color is the sky?",
      options: ["Blue", "Green", "Red", "Yellow"],
      correctAnswer: "Blue"
    }
  ];
}

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

  // Timer and buzz related initialization
  objRoom.questionStartTime = null;
  objRoom.buzzAnswerStartTime = null;
  objRoom.buzzTimeoutMs = 7000; // 7 sec to answer after buzzing
  objRoom.questionTimeoutMs = 30000; // 30 sec total question time
  objRoom.buzzedPlayers = [];
  objRoom.buzzOpen = false;
  objRoom.buzzedPlayerId = null;

  return { objRoom };
}

function openBuzzing(objRoom) {
  objRoom.buzzOpen = true;
  objRoom.buzzedPlayerId = null;
  objRoom.buzzAnswerStartTime = null;
  objRoom.questionStartTime = Date.now();
  objRoom.buzzedPlayers = [];
  return objRoom;
}

function playerBuzz(objRoom, playerId) {
  const now = Date.now();

  if (!objRoom.buzzOpen) {
    return { error: 'Buzzing is closed' };
  }

  // Check total question time exceeded
  if (now - objRoom.questionStartTime > objRoom.questionTimeoutMs) {
    objRoom.buzzOpen = false;
    objRoom.buzzedPlayerId = null;
    return { error: 'Time is up for this question' };
  }

  // If player already buzzed & answered/skipped, reject
  if (objRoom.buzzedPlayers.includes(playerId)) {
    return { error: 'You already buzzed and answered/skipped' };
  }

  if (objRoom.buzzedPlayerId) {
    return { error: 'Someone already buzzed and is answering' };
  }

  // Accept buzz, start answer timer
  objRoom.buzzedPlayerId = playerId;
  objRoom.buzzAnswerStartTime = now;
  objRoom.buzzOpen = false; // temporarily close buzz until answer or timeout

  return { success: true, playerId, objRoom };
}

function submitAnswer(objRoom, playerId, answer) {
  const now = Date.now();

  if (!objRoom.gameStarted || objRoom.status !== 'playing') {
    return { error: 'Game not active' };
  }

  if (objRoom.buzzedPlayerId !== playerId) {
    return { error: 'Not your turn to answer' };
  }

  // Check if answer time exceeded
  if (now - objRoom.buzzAnswerStartTime > objRoom.buzzTimeoutMs) {
    // Player timed out
    objRoom.buzzedPlayers.push(playerId);
    objRoom.buzzedPlayerId = null;
    objRoom.buzzOpen = true; // reopen buzz for others

    return {
      timeout: true,
      message: 'Answer time expired, buzzing reopened',
      objRoom
    };
  }

  const question = objRoom.questions[objRoom.currentQuestionIndex];
  const player = objRoom.players.find(p => p.id === playerId);
  if (!player) return { error: 'Player not found' };

  const isCorrect = question.correctAnswer === answer;
  if (isCorrect) {
    player.score += 1;
    // End question immediately
    objRoom.currentQuestionIndex += 1;
    objRoom.status = objRoom.currentQuestionIndex >= objRoom.questions.length ? 'ended' : 'playing';
    objRoom.gameStarted = objRoom.status !== 'ended';

    // Reset buzz state
    objRoom.buzzedPlayerId = null;
    objRoom.buzzOpen = false;
    objRoom.buzzAnswerStartTime = null;
    objRoom.buzzedPlayers = [];

    return {
      correct: true,
      questionEnded: true,
      isGameOver: objRoom.status === 'ended',
      objRoom
    };
  } else {
    // Wrong answer — allow other players to buzz (if time left)
    objRoom.buzzedPlayers.push(playerId);
    objRoom.buzzedPlayerId = null;

    // Check if total question time exceeded
    if (now - objRoom.questionStartTime > objRoom.questionTimeoutMs) {
      objRoom.buzzOpen = false;
      objRoom.status = objRoom.currentQuestionIndex >= objRoom.questions.length ? 'ended' : 'playing';
      objRoom.gameStarted = objRoom.status !== 'ended';

      return {
        correct: false,
        questionEnded: true,
        isGameOver: objRoom.status === 'ended',
        objRoom
      };
    } else {
      objRoom.buzzOpen = true; // reopen buzz for remaining players
      return {
        correct: false,
        questionEnded: false,
        message: 'Wrong answer, buzzing reopened',
        objRoom
      };
    }
  }
}

function timeExpired(objRoom) {
  if (!objRoom || !objRoom.questions) return { error: 'Invalid room state' };

  const nextIndex = objRoom.currentQuestionIndex + 1;

  if (nextIndex >= objRoom.questions.length) {
    objRoom.status = 'finished';
    return { gameOver: true, objRoom };
  }

  objRoom.currentQuestionIndex = nextIndex;

  // Reset timers and buzz state for next question
  objRoom.questionStartTime = Date.now();
  objRoom.buzzAnswerStartTime = null;
  objRoom.buzzOpen = true;
  objRoom.buzzedPlayers = [];
  objRoom.buzzedPlayerId = null;
  objRoom.currentBuzz = null;

  return { objRoom };
}


module.exports = {
  startGame,
  openBuzzing,
  playerBuzz,
  submitAnswer,
  timeExpired
};
