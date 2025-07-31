// You can add player-specific utilities here
// For example, updateScore, findPlayer, etc.

function updatePlayerScore(objRoom, playerId, delta) {
  const player = objRoom.players.find(p => p.id === playerId);
  if (player) player.score += delta;
  return player;
}

module.exports = {
  updatePlayerScore
};
