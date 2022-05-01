const FailedActionError = require('../errors/FailedActionError');
const validation = require('./parameterValidation');

const {
  refillTable, findCardInListOfCards, getGameStateObject, broadcastMessage,
} = require('./commonFunctions');

const { ACTIONS } = require('../Constants');

const action = ACTIONS.SUBMIT_SET;

/**
 * Handles a player submitting a set
 * @param {WebSocket} ws - WebSocket to send responses to
 * @param {Object} params - must contain list of cards being submitted
 */
function handleSubmitSet(ws, games, params) {
  validation.paramsNotNull(params, action);
  validation.containsCards(params, action);
  validation.playerIsInGame(ws, games, action);

  const gameInfo = games.get(ws.gameId);

  validation.isValidSubsetOfCards(params.cards, gameInfo.table);

  if (!isASet(params.cards)) {
    throw new FailedActionError('submit-set', 'The given params.cards does not make a valid set');
  } else {
    // Update scores
    gameInfo.players.filter((el) => el.socket === ws).forEach((el) => el.score += 1);
    // Remove cards from table
    gameInfo.table = removeCardsFromTable(params.cards, gameInfo.table);
    // Repopulate deck
    refillTable(gameInfo.table, gameInfo.deck, gameInfo.numDots);
    // Broadcast to all clients
    broadcastMessage(getGameStateObject(gameInfo), gameInfo.players.map((player) => player.socket));
    // TODO remove game from list if ended
  }
}

/**
 * Checks that the card has an even number of each dot color
 * @param {Number[][]} cards - list of cards to check
 * @param {Number} numDots - number of dots on a single card
 */
function isASet(cards, numDots) {
  // TODO verify cards unique
  const parities = new Array(numDots);
  parities.fill(0);
  for (const card of cards) {
    for (let i = 0; i < numDots; i += 1) {
      // eslint-disable-next-line no-bitwise
      parities[i] ^= card[i];
    }
  }
  return !parities.includes(1);
}

function removeCardsFromTable(set, table) {
  return table.filter((card) => !findCardInListOfCards(set, card));
}

module.exports = handleSubmitSet;
