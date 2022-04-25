const InvalidRequestError = require('../errors/InvalidRequestError');

/**
 * Handles adding player to an existing game
 * @param {WebSocket} ws - WebSocket to send responses to
 * @param {Object} params - must contain name of the game and name of the player
 */
function handleJoinGame(ws, games, params) {
  if (!params.gameName) {
    throw new InvalidRequestError('join-game: params.gameName is missing or invalid');
  }
  if (!params.playerName) {
    throw new InvalidRequestError('join-game: params.playerName is missing or invalid');
  }

  if (!games.has(params.gameName)) {
    ws.send(JSON.stringify({
      action: 'join-game',
      status: 'error',
      reason: `${params.gameName} is does not exist`,
    }));
  } else {
    games.get(params.gameName).players.push({ socket: ws, score: 0 });
    ws.gameName = params.gameName;
    ws.playerName = params.playerName;
    // TODO send back success status
  }
}

module.exports = handleJoinGame;
