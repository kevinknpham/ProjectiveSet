const FailedActionError = require('../errors/FailedActionError');
const validation = require('./parameterValidation');

const { DEFAULT_NUM_DOTS, ACTIONS } = require('../Constants');

// TODO change actions in handleMessage to use this or move action string literals to separate file
const action = ACTIONS.CREATE_GAME;

/**
 * Handles creation of a game
 * @param {WebSocket} ws - WebSocket to send responses to
 * @param {Object} params - must contain game's name and name of the player, optionally contains
 * the number of dots to use
 */
function handleCreateGame(ws, games, params) {
  validation.paramsNotNull(params, action);
  validation.containsGameName(params, action);
  validation.containsPlayerName(params, action);

  if (games.has(params.gameName)) {
    throw new FailedActionError('create-game', `The name "${params.gameName}" has already been taken`);
  } else {
    const numDots = params.numDots || DEFAULT_NUM_DOTS;
    const deck = createDeck(numDots);
    shuffle(deck);
    // TODO refactor creation of game mapping value to common function (if needed)
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
    // TODO refactor into if needed
    ws.send(JSON.stringify({
      action,
      status: 'success',
    }));
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
