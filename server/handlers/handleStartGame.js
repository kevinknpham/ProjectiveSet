const validation = require('./parameterValidation');

const {
  refillTable,
  broadcastMessage,
  getGameStateObject,
  getSocketListFromGameInfo,
} = require('./commonFunctions');

const { ACTIONS } = require('../Constants');

const action = ACTIONS.START_GAME;

/**
 * Starts a game
 * @param {WebSocket} ws - WebSocket to send responses to
 */
function handleStartGame(ws, games) {
  validation.playerIsInGame(ws, games, action);

  const gameInfo = games.get(ws.gameId);
  gameInfo.started = true;

  // Set table
  refillTable(gameInfo.table, gameInfo.deck, gameInfo.numDots);
  // TODO refactor code to get list of sockets from gameInfo.players
  broadcastMessage(getGameStateObject(gameInfo), getSocketListFromGameInfo(gameInfo));
}

module.exports = handleStartGame;
