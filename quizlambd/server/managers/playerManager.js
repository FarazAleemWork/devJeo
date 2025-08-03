// Player-specific utilities, such as score updates and player searches.

/**
 * Adjusts the score of a player in the given room.
 * @param {Object} room - The room object containing players.
 * @param {string} playerId - The ID of the player whose score will be adjusted.
 * @param {number} scoreDelta - The amount to adjust the player's score by.
 * @returns {Object|null} - The updated player object, or null if the player is not found.
 */
function adjustPlayerScore(room, playerId, scoreDelta) {
  const targetPlayer = room.players.find(player => player.id === playerId);
  if (targetPlayer) {
    targetPlayer.score += scoreDelta;
    return targetPlayer;
  }
  return null; // Explicitly return null if the player is not found
}

/**
 * Get the current player scores
 */
function getPlayerScores(roomCode) {
  const room = rooms.getRoom(roomCode);
  if (!room) return { error: 'Room not found' };

  return room.players.map(player => ({
    id: player.id,
    name: player.name,
    score: player.score
  }));
}

module.exports = {
  adjustPlayerScore,
  getPlayerScores
};