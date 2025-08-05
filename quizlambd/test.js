
const roomManager = require('./server/managers/roomManager');
const gameManager = require('./server/managers/gameManager');
const rooms = require('./data/rooms');

// Helper to manually shift the internal timestamps by ms
function shiftTime(objRoom, ms) {
  if (objRoom.questionStartTime) objRoom.questionStartTime -= ms;
  if (objRoom.buzzAnswerStartTime) objRoom.buzzAnswerStartTime -= ms;
}


// 1. Create objRoom with host
let objRoom = roomManager.createRoom('Alex');
console.log('✅ objRoom created:', objRoom);

// 2. Players join
const player1 = roomManager.joinRoom(objRoom.roomCode, 'John');
const player2 = roomManager.joinRoom(objRoom.roomCode, 'Jane');
console.log('✅ Players joined:', player1.player.name, player2.player.name);

// 3. Start the game
let startResult = gameManager.startGame(objRoom);
if (startResult.error) {
  console.error('❌ Cannot start game:', startResult.error);
  process.exit(1);
}
objRoom = startResult.objRoom;
rooms.setRoom(objRoom.code, objRoom);
console.log('▶️ Game started:', objRoom.status);

// 4. Open buzzing for first question
objRoom = gameManager.openBuzzing(objRoom);
rooms.setRoom(objRoom.code, objRoom);
console.log('🔔 Buzzing opened');

// 5. Player John buzzes
let buzzResult = gameManager.playerBuzz(objRoom, player1.player.id);
if (buzzResult.error) console.log('Buzz error:', buzzResult.error);
else objRoom = buzzResult.objRoom;
rooms.setRoom(objRoom.code, objRoom);
console.log('💬 Player John buzzed');

// 6. Simulate player John NOT answering within 7 seconds
// Shift buzzAnswerStartTime 8 seconds back to simulate timeout
shiftTime(objRoom, 8000);
rooms.setRoom(objRoom.code, objRoom);

let answerResult = gameManager.submitAnswer(objRoom, player1.player.id, 'Paris');
if (answerResult.timeout) {
  console.log('⏰ Player John answer timed out:', answerResult.message);
  objRoom = answerResult.objRoom;
  rooms.setRoom(objRoom.code, objRoom);
}

// 7. Now buzzing should reopen — Player Jane buzzes
buzzResult = gameManager.playerBuzz(objRoom, player2.player.id);
if (buzzResult.error) console.log('Buzz error:', buzzResult.error);
else objRoom = buzzResult.objRoom;
rooms.setRoom(objRoom.code, objRoom);
console.log('💬 Player Jane buzzed');

// 8. Player Jane answers correctly within time
answerResult = gameManager.submitAnswer(objRoom, player2.player.id, 'Paris');
if (answerResult.correct) {
  console.log('✅ Player Jane answered correctly!');
  objRoom = answerResult.objRoom;
  rooms.setRoom(objRoom.code, objRoom);
} else if (answerResult.error) {
  console.log('Answer error:', answerResult.error);
}

// 9. Open buzzing for next question
objRoom = gameManager.openBuzzing(objRoom);
rooms.setRoom(objRoom.code, objRoom);
console.log('🔔 Buzzing opened for next question');

// 10. Simulate 31 seconds passing without any buzz — question timeout
shiftTime(objRoom, 31000);
rooms.setRoom(objRoom.code, objRoom);

// Now try to buzz — should fail due to question timeout
buzzResult = gameManager.playerBuzz(objRoom, player1.player.id);
if (buzzResult.error) console.log('⏰ Buzz failed:', buzzResult.error);
else objRoom = buzzResult.objRoom;

console.log('🏁 Test completed.');
