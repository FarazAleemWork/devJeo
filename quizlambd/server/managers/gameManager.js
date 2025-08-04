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

  objRoom.questionStartTime = null;
  objRoom.buzzAnswerStartTime = null;
  objRoom.buzzTimeoutMs = 7000;
  objRoom.questionTimeoutMs = 30000;

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

  if (!objRoom.buzzOpen) return { error: 'Buzzing is closed' };

  if (now - objRoom.questionStartTime > objRoom.questionTimeoutMs) {
    objRoom.buzzOpen = false;
    objRoom.buzzedPlayerId = null;
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
    objRoom.buzzedPlayerId = null;
    objRoom.buzzOpen = true;

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
    objRoom.currentQuestionIndex += 1;

    objRoom.status = objRoom.currentQuestionIndex >= objRoom.questions.length ? 'ended' : 'playing';
    objRoom.gameStarted = objRoom.status !== 'ended';

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
    objRoom.buzzedPlayers.push(playerId);
    objRoom.buzzedPlayerId = null;

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
      objRoom.buzzOpen = true;
      return {
        correct: false,
        questionEnded: false,
        message: 'Wrong answer, buzzing reopened',
        objRoom
      };
    }
  }
}

//selectQuestion FUNCTION
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
  objRoom.buzzedPlayers = [];
  objRoom.buzzOpen = true;
  objRoom.buzzedPlayerId = null;

  // Clear existing timer if any
  if (objRoom.questionTimer) {
    clearTimeout(objRoom.questionTimer);
  }

  // Start auto-end timer for question
  objRoom.questionTimer = setTimeout(() => {
    objRoom.buzzOpen = false;
    objRoom.buzzedPlayerId = null;
    io.to(objRoom.code).emit('questionTimedOut', {
      message: 'Time is up for this question!',
      room: objRoom
    });
  }, objRoom.questionTimeoutMs);

  return { success: true, objRoom };

}
  //end game 
function endGame(objRoom) {
  objRoom.status = 'ended';
  objRoom.gameStarted = false;
  objRoom.buzzOpen = false;
  objRoom.buzzedPlayerId = null;
  objRoom.buzzedPlayers = [];
  objRoom.questionStartTime = null;
  objRoom.buzzAnswerStartTime = null;

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
