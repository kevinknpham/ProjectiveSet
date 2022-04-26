/**
 * This file holds validation functions to handle throwing InvalidRequestErrors
 */

const InvalidRequestError = require('../errors/InvalidRequestError');
const { findCardInTable } = require('./commonFunctions');

function paramsNotNull(params, action) {
  if (!params) {
    throw createError('params is invalid or undefined', action);
  }
}

function containsGameName(params, action) {
  if (!params.gameName) {
    throw createError('params.gameName is invalid or undefined', action);
  }
}

function containsCards(params, action) {
  if (!params.cards || params.cards.length === 0) {
    throw createError('params.cards is invalid or undefined', action);
  }
}

function containsPlayerName(params, action) {
  if (!params.playerName) {
    throw createError('params.playerName is invalid or undefined', action);
  }
}

function gameExists(games, gameName, action) {
  if (!games.has(gameName)) {
    // TODO fix error message
    throw createError('Client is not in a game', action);
  }
}

// TODO can split into validating game exists and another function for ensuring player is in game
function playerIsInGame(ws, games, action) {
  if (!ws.gameName) {
    throw createError('Client is not in a game', action);
  }
  if (!games.has(ws.gameName)) {
    // TODO could be made into InvalidRequestError depending on how disconnect is implemented
    throw new Error(`Client made request for inactive or unknown game: ${ws.gameName}`);
  }
  if (games.get(ws.gameName).players.filter((el) => el.socket === ws).length === 0) {
    // TODO Should this be a client error? Or an internal server error?
    throw createError('Client is not in the specified game', action);
  }
}

function isValidSubsetOfCards(subset, superset) {
  for (const card of subset) {
    if (!findCardInTable(superset, card)) {
      throw new InvalidRequestError('submit-set: At least one card in the set is not on the table');
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
  containsGameName,
  containsCards,
  containsPlayerName,
  playerIsInGame,
  gameExists,
  isValidSubsetOfCards,
};
