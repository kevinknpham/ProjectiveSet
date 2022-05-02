/**
 * This file holds validation functions to handle throwing InvalidRequestErrors
 */

const InvalidRequestError = require('../errors/InvalidRequestError');
const { findCardInListOfCards, cardEquals } = require('./commonFunctions');

function paramsNotNull(params, action) {
  if (!params) {
    throw createRequestError('params is invalid or undefined', action);
  }
}

function containsGameId(params, action) {
  if (!params.gameId) {
    throw createRequestError('params.gameId is invalid or undefined', action);
  }
}

function containsCards(params, action) {
  if (!params.cards) {
    throw createRequestError('params.cards is invalid or undefined', action);
  }
}

function cardsAreValid(params, action) {
  const { cards } = params;
  if (cards.length === 0) {
    throw createRequestError('params.cards is empty', action);
  }
  for (let i = 0; i < cards.length; i += 1) {
    for (let j = i + 1; j < cards.length; j += 1) {
      if (cardEquals(cards[i], cards[j])) {
        throw createRequestError('params.cards contains a duplicate card', action);
      }
    }
  }
}

function containsPlayerName(params, action) {
  if (!params.playerName) {
    throw createRequestError('params.playerName is invalid or undefined', action);
  }
}

function playerIsNotInAGame(games, ws, action) {
  const gameInfos = Array.from(games.values());
  const playerSockets = gameInfos.map((gameInfo) => gameInfo.players.map(
    (playerInfo) => playerInfo.socket,
  )).flat();
  if (playerSockets.includes(ws)) {
    throw createRequestError('Client is already in a game. Please leave before entering another game', action);
  }
}

function gameExists(games, gameId, action) {
  if (!games.has(gameId)) {
    throw createRequestError('Client\'s game is missing or does not exist', action);
  }
}

function playerIsInGame(ws, games, action) {
  if (!ws.gameId) {
    throw createRequestError('Client is not in a game', action);
  }
  if (!games.has(ws.gameId)) {
    throw new Error(`Client made request for inactive or unknown game: ${ws.gameId}`);
  }
  if (games.get(ws.gameId).players.filter((el) => el.socket === ws).length === 0) {
    throw new Error(`Client is not in the specified game: ${ws.gameId}`);
  }
}

function isValidSubsetOfCards(subset, superset) {
  for (const card of subset) {
    if (!findCardInListOfCards(superset, card)) {
      throw new InvalidRequestError('submit-set: At least one card in params.set is not on the table');
    }
  }
}

function createRequestError(msg, action) {
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
  playerIsNotInAGame,
};
