const InvalidRequestError = require('../errors/InvalidRequestError');
const FailedActionError = require('../errors/FailedActionError');

const { DEFAULT_NUM_DOTS } = require('../Constants');

/**
 * Handles creation of a game
 * @param {WebSocket} ws - WebSocket to send responses to
 * @param {Object} params - must contain game's name and name of the player, optionally contains
 * the number of dots to use
 */
function handleCreateGame(ws, games, params) {
  if (!params.gameName) {
    throw new InvalidRequestError('create-game: params.gameName is missing or invalid');
  }
  if (!params.playerName) {
    throw new InvalidRequestError('create-game: params.playerName is missing or invalid');
  }

  if (games.has(params.gameName)) {
    throw new FailedActionError('create-game', `The name "${params.gameName}" has already been taken`);
  } else {
    const numDots = params.numDots || DEFAULT_NUM_DOTS;
    const deck = createDeck(numDots);
    shuffle(deck);
    const gameInfo = {
      numDots,
      started: false,
      table: [],
      deck,
      players: [{ socket: ws, score: 0 }],
    };
    games.set(params.gameName, gameInfo);
    ws.gameName = params.gameName;
    ws.playerName = params.playerName;
    // TODO send back success status
  }
}

/**
 * Helper method to populate deck
 * @param {Number} numDots - number of dots on each card
 */
function createDeck(numDots, deck = [], currentCard = []) {
  if (numDots <= 0) {
    // if all values are 0, omit this card
    if (!currentCard.includes(1)) {
      deck.push(currentCard);
    }
  } else {
    currentCard.push(0);
    createDeck(numDots - 1, deck, currentCard);
    currentCard.pop();
    currentCard.push(1);
    createDeck(numDots - 1, deck, currentCard);
    currentCard.pop();
  }
  return deck;
}

function shuffle(array) {
  let currentIndex = array.length; let
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    const temp = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temp;
  }

  return array;
}

module.exports = handleCreateGame;
