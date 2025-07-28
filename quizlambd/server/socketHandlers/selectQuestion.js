const { getRoomByCode, setRoom } = require('../data/rooms');
const { openBuzzing } = require('../managers/gameManager');

module.exports = function handleSelectQuestion(io, socket) {
  socket.on('selectQuestion', ({ roomCode, questionIndex }) => {
    const room = getRoomByCode(roomCode);
    if (!room) return socket.emit('errorMessage', 'Room not found');

    // Only host can select a question
    if (socket.id !== room.host.id) {
      return socket.emit('errorMessage', 'Only host can select a question');
    }

    // Make sure the question index is valid
    if (questionIndex < 0 || questionIndex >= room.questions.length) {
      return socket.emit('errorMessage', 'Invalid question index');
    }

    // Update room state
    room.currentQuestionIndex = questionIndex;
    room.questionStartTime = Date.now();
    room.buzzedPlayerId = null;
    room.buzzedPlayers = [];
    room.buzzOpen = true;

    // Broadcast the selected question to everyone in the room
    io.to(roomCode).emit('questionSelected', {
      question: room.questions[questionIndex],
      index: questionIndex
    });

    // Save updated room
    setRoom(roomCode, room);

    // Auto-end question after timeout (e.g., 30 seconds)
    const timeoutDuration = room.questionTimeoutMs || 30000; // fallback to 30s

    // Clear any existing timeout first (optional safety)
    if (room.questionTimer) {
      clearTimeout(room.questionTimer);
    }

    // Store timeout reference in memory (not persisted)
    room.questionTimer = setTimeout(() => {
      // Ensure it's still the same question and buzz is open
      const stillValid = room.currentQuestionIndex === questionIndex && room.buzzOpen;
      if (!stillValid) return;

      room.buzzOpen = false;

      // Notify all players that time ran out
      io.to(roomCode).emit('questionEnded', {
        reason: 'timeout',
        questionIndex
      });

      // Save updated state
      setRoom(roomCode, room);
    }, timeoutDuration);
  });
};
