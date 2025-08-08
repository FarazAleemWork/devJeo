const { startGame, selectQuestion, playerBuzz, submitAnswer, endGame } = require('./server/managers/gameManager');

// Mock in-memory room store
const rooms = {};

// Mock Socket.io
const mockIo = {
  to: (roomCode) => ({
    emit: (event, payload) => {
      console.log(`[Room ${roomCode}] Event: ${event}`, payload.message || '');
    }
  })
};

// Helper to create a room with players
function createTestRoom(roomCode, hostId, playerIds) {
  return {
    code: roomCode,
    host: { id: hostId, name: `Host_${hostId}` },
    players: playerIds.map(id => ({ id, name: `Player_${id}`, score: 0 })),
    questions: [],
    gameStarted: false,
    status: 'waiting'
  };
}

// Test runner for one room
async function runGameSimulation(roomCode, hostId, playerIds) {
  const objRoom = createTestRoom(roomCode, hostId, playerIds);
  rooms[roomCode] = objRoom;

  console.log(`\n🟩 Starting game in room: ${roomCode}`);

  // Start game
  const start = startGame(objRoom);
  if (start.error) return console.error(`[${roomCode}] Error: ${start.error}`);

  // Host selects first question
  const selected = selectQuestion(objRoom, 0, hostId, mockIo);
  if (selected.error) return console.error(`[${roomCode}] Error: ${selected.error}`);

  // Player buzzes in
  const buzzed = playerBuzz(objRoom, playerIds[0]);
  if (buzzed.error) return console.error(`[${roomCode}] Error: ${buzzed.error}`);
  console.log(`[${roomCode}] ${buzzed.playerId} buzzed`);

  // Player submits answer
  const question = objRoom.questions[objRoom.currentQuestionIndex];
  const answer = question.correctAnswer;
  const submitted = submitAnswer(objRoom, playerIds[0], answer);

  if (submitted.correct) {
    console.log(`[${roomCode}] ✅ Correct answer by ${playerIds[0]}`);
  } else if (submitted.timeout) {
    console.log(`[${roomCode}] ⌛ Answer timed out`);
  } else {
    console.log(`[${roomCode}] ❌ Wrong answer`);
  }

  // End the game manually
  const result = endGame(objRoom);

if (result && result.success && result.objRoom) {
  const endedRoom = result.objRoom;
  endedRoom.players.forEach(p => {
    console.log(`- ${p.name}: ${p.score}`);
  });
} else {
  console.error("Failed to end game:", result?.message || "Unknown error");
}
}

// Run all 3 games in parallel
async function runAllGames() {
  await Promise.all([
    runGameSimulation('ROOM1', 'host1', ['p1', 'p2']),
    runGameSimulation('ROOM2', 'host2', ['p3', 'p4']),
    runGameSimulation('ROOM3', 'host3', ['p5', 'p6'])
  ]);
}

runAllGames();
