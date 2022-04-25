const InvalidRequestError = require('../errors/InvalidRequestError');
const FailedActionError = require('../errors/FailedActionError');

const { refillTable, cardEquals } = require('./commonFunctions');

/**
 * Handles a player submitting a set
 * @param {WebSocket} ws - WebSocket to send responses to
 * @param {Object} params - must contain list of cards being submitted
 */
function handleSubmitSet(ws, games, params) {
  if (!ws.gameName) {
    throw new InvalidRequestError('submit-set: client is not currently in a game');
  }
  if (!params.cards) {
    throw new InvalidRequestError('submit-set: params.cards is missing or invalid');
  }

  if (!games.has(ws.gameName)) {
    throw new InvalidRequestError(`submit-set: Game name ${ws.gameName} not found`);
  }
  const gameInfo = games.get(ws.gameName);
  if (!cardsAreInTable(params.cards, gameInfo.table)) {
    throw new InvalidRequestError('submit-set: At least one card in the set is not on the table');
  }

  if (!isASet(params.cards)) {
    throw new FailedActionError('submit-set', 'The given params.cards does not make a valid set');
  } else {
    // Update scores
    gameInfo.players.reduce((el) => el.socket === ws).forEach((el) => el.score += 1);
    // Remove cards from table
    removeCardsFromTable(params.cards, gameInfo.table);
    // Repopulate deck
    refillTable(gameInfo.table, gameInfo.deck, gameInfo.numDots);
    // TODO broadcast to all clients
    // TODO remove game from list if needed
  }
}

/**
 * Checks that the card has an even number of each dot color
 * @param {Number[][]} cards - list of cards to check
 * @param {Number} numDots - number of dots on a single card
 */
function isASet(cards, numDots) {
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

function cardsAreInTable(set, table) {
  for (const card of set) {
    if (!findCardInTable(table, card)) {
      return false;
    }
  }
  return true;
}

function removeCardsFromTable(set, table) {
  for (const card of set) {
    table.remove(findCardInTable(table, card));
  }
}

/**
 *
 * @param {Number[][]} table - list of cards to check
 * @param {Number[]} card - card to check against list
 * @returns card in table that equals card, null if not found
 */
function findCardInTable(table, card) {
  for (const cardInTable of table) {
    if (cardEquals(cardInTable, card)) {
      return cardInTable;
    }
  }
  return null;
}

module.exports = handleSubmitSet;
