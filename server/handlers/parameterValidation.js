/**
 * This file holds validation functions to handle throwing InvalidRequestErrors
 */

const InvalidRequestError = require('../errors/InvalidRequestError');
const { findCardInListOfCards, cardEquals } = require('./commonFunctions');

function paramsNotNull(params, action) {
  if (!params) {
    throw createError('params is invalid or undefined', action);
  }
}

function containsGameId(params, action) {
  if (!params.gameId) {
    throw createError('params.gameId is invalid or undefined', action);
  }
}

function containsCards(params, action) {
  if (!params.cards) {
    throw createError('params.cards is invalid or undefined', action);
  }
}

function cardsAreValid(params, action) {
  const { cards } = params;
  if (cards.length === 0) {
    throw createError('params.cards is empty', action);
  }
  for (let i = 0; i < cards.length; i += 1) {
    for (let j = i + 1; j < cards.length; j += 1) {
      if (cardEquals(cards[i], cards[j])) {
        throw createError('params.cards contains a duplicate card', action);
      }
    }
  }
}

function containsPlayerName(params, action) {
  if (!params.playerName) {
    throw createError('params.playerName is invalid or undefined', action);
  }
}

function gameExists(games, gameId, action) {
  if (!games.has(gameId)) {
    // TODO fix error message
    throw createError('Client is not in a game', action);
  }
}

// TODO can split into validating game exists and another function for ensuring player is in game
function playerIsInGame(ws, games, action) {
  if (!ws.gameId) {
    throw createError('Client is not in a game', action);
  }
  if (!games.has(ws.gameId)) {
    // TODO could be made into InvalidRequestError depending on how disconnect is implemented
    throw new Error(`Client made request for inactive or unknown game: ${ws.gameId}`);
  }
  if (games.get(ws.gameId).players.filter((el) => el.socket === ws).length === 0) {
    // TODO Should this be a client error? Or an internal server error?
    throw createError('Client is not in the specified game', action);
  }
}

function isValidSubsetOfCards(subset, superset) {
  for (const card of subset) {
    if (!findCardInListOfCards(superset, card)) {
      throw new InvalidRequestError('submit-set: At least one card in params.set is not on the table');
    }
  }
}

function createError(msg, action) {
  if (action) {
    return new InvalidRequestError(`Error for action "${action}". ${msg}`);
  }
  return new InvalidRequestError(msg);
}

module.exports = {
  paramsNotNull,
  containsGameId,
  containsCards,
  cardsAreValid,
  containsPlayerName,
  playerIsInGame,
  gameExists,
  isValidSubsetOfCards,
};
