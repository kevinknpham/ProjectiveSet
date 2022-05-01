const FailedActionError = require('../errors/FailedActionError');
const validation = require('./parameterValidation');

const {
  broadcastMessage,
  getJoinGameResult,
  setWsData,
  getSocketListFromGameInfo,
} = require('./commonFunctions');

const { ACTIONS } = require('../Constants');

const action = ACTIONS.JOIN_GAME;

/**
 * Handles adding player to an existing game
 * @param {WebSocket} ws - WebSocket to send responses to
 * @param {Object} params - must contain id of the game and name of the player
 */
function handleJoinGame(ws, games, params) {
  // TODO check if player is already in game, do nothing or error if they are (same for create)
  validation.paramsNotNull(params, action);
  validation.containsGameId(params, action);
  validation.containsPlayerName(params, action);

  if (!games.has(params.gameId)) {
    throw new FailedActionError(action, `${params.gameId} is does not exist`);
  } else {
    const gameInfo = games.get(params.gameId);
    gameInfo.players.push({ socket: ws, score: 0 });
    setWsData(ws, params.gameId, params.playerName);
    ws.send(JSON.stringify({
      action,
      status: 'success',
    }));
    // TODO refactor code for creating player object (duplicated in create)
    broadcastMessage(
      getJoinGameResult(action, params.gameId, params.playerName),
      getSocketListFromGameInfo(gameInfo),
    );
  }
}

module.exports = handleJoinGame;
