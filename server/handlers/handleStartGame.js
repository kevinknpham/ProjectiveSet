const InvalidRequestError = require('../errors/InvalidRequestError');

const {refillTable} = require('./commonFunctions');

/**
 * Starts a game
 * @param {WebSocket} ws - WebSocket to send responses to
 */
function handleStartGame(ws, games) {
  if (!ws.gameName) {
    throw new InvalidRequestError('start-game: client is not currently in a game');
  }

  if (!games.has(ws.gameName)) {
    throw new InvalidRequestError(`Game name ${ws.gameName} not found`);
  }

  const gameInfo = games.get(ws.gameName);
  gameInfo.started = true;

  // Set table
  refillTable(gameInfo.table, gameInfo.deck, gameInfo.numDots);
  // TODO broadcast message to all players
}

module.exports = handleStartGame;
