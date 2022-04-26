const validation = require('./parameterValidation');

const { refillTable, broadcastMessage, getGameStateObject } = require('./commonFunctions');

const { ACTIONS } = require('../Constants');

const action = ACTIONS.START_GAME;

/**
 * Starts a game
 * @param {WebSocket} ws - WebSocket to send responses to
 */
function handleStartGame(ws, games) {
  validation.playerIsInGame(ws, games, action);

  const gameInfo = games.get(ws.gameName);
  gameInfo.started = true;

  // Set table
  refillTable(gameInfo.table, gameInfo.deck, gameInfo.numDots);
  // TODO refactor code to get list of sockets from gameInfo.players
  broadcastMessage(getGameStateObject(gameInfo), gameInfo.players.map((player) => player.socket));
}

module.exports = handleStartGame;
