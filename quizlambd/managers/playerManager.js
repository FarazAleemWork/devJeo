// You can add player-specific utilities here
// For example, updateScore, findPlayer, etc.

function updatePlayerScore(room, playerId, delta) {
  const player = room.players.find(p => p.id === playerId);
  if (player) player.score += delta;
  return player;
}

module.exports = {
  updatePlayerScore
};
